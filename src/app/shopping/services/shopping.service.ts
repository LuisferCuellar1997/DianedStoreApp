import { Injectable, effect, signal, inject, computed } from '@angular/core';
import { forkJoin, map, take } from 'rxjs';
import { Shop } from '../interfaces/shop.interface';
import { Jean } from '../../products/interfaces/product.interface';
import { ProductService } from '../../products/services/products.service';

type ShopPersisted = {
  productId: string;
  selectedSize: string;
  quantity: number;
};

type StockIssue = {
  productId: string;
  size: string;
  requested: number;
  available: number;
  action: 'removed' | 'reduced';
};

@Injectable({ providedIn: 'root' })
export class ShoppingService {
  private productService = inject(ProductService);

  shopList = signal<Shop[]>([]);
  private saveTimer: any = null;

  showToPay = signal(false);

  subtotal = computed(() => {
    return this.shopList().reduce(
      (acum, item) => acum + item.product.price * (item.quantity ?? 1),
      0
    );
  });

  finalTotal = signal(0);

  // ---------------- STOCK (NUEVO) ----------------
  stockStatus = signal<'idle' | 'checking' | 'done' | 'error'>('idle');
  stockIssues = signal<StockIssue[]>([]);

  /** stock disponible por key "productId|size" */
  private availableStockMap = signal<Record<string, number>>({});

  private key(productId: string, size: string) {
    return `${productId}|${size.toLowerCase()}`;
  }

  /** stock disponible para (id,talla). Si no está verificado aún, retorna 0 */
  availableFor(productId: string, size: string): number {
    return this.availableStockMap()[this.key(productId, size)] ?? 0;
  }

  /** ✅ reactivo: determina si se puede subir +1 */
  canIncrease(item: Shop): boolean {
    if (this.stockStatus() !== 'done') return false;
    const max = this.availableFor(item.product.id, item.selectedSize);
    const current = item.quantity ?? 1;
    return current < max;
  }

  /** ✅ si el carrito quedó inválido (overstock o sin stock) */
  hasOverstock = computed(() => {
    if (this.stockStatus() !== 'done') return true; // mientras no esté verificado, bloquea checkout
    return this.shopList().some((item) => {
      const max = this.availableFor(item.product.id, item.selectedSize);
      const q = item.quantity ?? 1;
      return max <= 0 || q > max;
    });
  });

  /** ✅ deshabilitar checkout */
  isCheckoutDisabled = computed(() => {
    return this.stockStatus() !== 'done' || this.hasOverstock();
  });

  constructor() {
    this.loadFromLocalStorage();

    // Guarda automáticamente cuando cambie shopList (debounced)
    effect(() => {
      const list = this.shopList();
      this.scheduleSave(list);
    });
  }

  // ---------------- ACCIONES CARRITO ----------------

  addToCart(product: Jean, size: string) {
    // cuando el carrito cambia manualmente, los issues anteriores ya no aplican
    this.stockIssues.set([]);

    this.shopList.update((list) => {
      const found = list.find((x) => x.product.id === product.id && x.selectedSize === size);
      if (found) {
        // NO clamp aquí: el clamp fuerte lo hacemos en changeQuantity y en syncCartWithStock
        return list.map((x) =>
          x.product.id === product.id && x.selectedSize === size
            ? { ...x, quantity: (x.quantity ?? 1) + 1 }
            : x
        );
      }
      return [...list, this.mapToShop(product, size)];
    });

    // si ya habíamos verificado stock, este add puede volver el estado “desconocido”,
    // marcamos idle para forzar recheck en la pantalla del carrito
    if (this.stockStatus() === 'done') {
      this.stockStatus.set('idle');
    }
  }

  changeQuantity(id: string, selectedSize: string, operation: number) {
    this.stockIssues.set([]);

    this.shopList.update((list) =>
      list.map((item) => {
        if (item.product.id === id && item.selectedSize === selectedSize) {
          const current = item.quantity ?? 1;

          // bajar
          if (operation < 0) {
            const next = Math.max(1, current + operation);
            return { ...item, quantity: next };
          }

          // subir: clamp por stock verificado
          if (operation > 0) {
            if (this.stockStatus() !== 'done') return item;

            const max = this.availableFor(id, selectedSize);
            if (max <= 0) return item;

            const next = Math.min(current + operation, max);
            return { ...item, quantity: next };
          }
        }
        return item;
      })
    );
  }

  deleteProduct(id: string, selectedSize: string) {
    this.stockIssues.set([]);

    this.shopList.update((list) =>
      list.filter((prod) => !(prod.product.id === id && prod.selectedSize === selectedSize))
    );
  }

  cleanShoppingList() {
    this.finalTotal.set(this.subtotal());
    this.shopList.set([]);
    this.availableStockMap.set({});
    this.stockIssues.set([]);
    this.stockStatus.set('idle');
  }

  // ---------------- SYNC STOCK (NUEVO) ----------------

  private getAvailableStock(product: Jean, selectedSize: string): number {
    const s = product.stock?.find(
      (x) => x.size.toLowerCase() === selectedSize.toLowerCase()
    );
    return s?.count ?? 0;
  }

  /** ✅ sincroniza el carrito con el stock REAL en Firestore */
  syncCartWithStock(): void {
    if (this.stockStatus() === 'checking') return;

    const cart = this.shopList();
    if (!cart.length) {
      this.availableStockMap.set({});
      this.stockIssues.set([]);
      this.stockStatus.set('done');
      return;
    }

    this.stockStatus.set('checking');

    const uniqueIds = Array.from(new Set(cart.map((i) => i.product.id)));

    forkJoin(
      uniqueIds.map((id) =>
        this.productService.getProductById(id).pipe(map((product) => ({ id, product })))
      )
    ).subscribe({
      next: (products) => {
        const byId = new Map(products.map((x) => [x.id, x.product as Jean | null]));
        const mapStock: Record<string, number> = {};
        const issues: StockIssue[] = [];

        // llena el mapa de stock por cada item del carrito (id+talla)
        for (const item of cart) {
          const fresh = byId.get(item.product.id);
          const k = this.key(item.product.id, item.selectedSize);

          if (!fresh) {
            mapStock[k] = 0;
            continue;
          }

          mapStock[k] = this.getAvailableStock(fresh, item.selectedSize);
        }

        // reconstruye carrito aplicando reglas
        const nextCart: Shop[] = [];

        for (const item of cart) {
          const fresh = byId.get(item.product.id);
          const requested = item.quantity ?? 1;
          const available = mapStock[this.key(item.product.id, item.selectedSize)] ?? 0;

          // producto no existe o talla sin stock
          if (!fresh || available <= 0) {
            issues.push({
              productId: item.product.id,
              size: item.selectedSize,
              requested,
              available: 0,
              action: 'removed',
            });
            continue;
          }

          // reduce si excede stock
          if (requested > available) {
            issues.push({
              productId: item.product.id,
              size: item.selectedSize,
              requested,
              available,
              action: 'reduced',
            });

            nextCart.push({ ...item, product: fresh, quantity: available });
            continue;
          }

          // OK: actualiza el producto a su versión más reciente
          nextCart.push({ ...item, product: fresh });
        }

        this.availableStockMap.set(mapStock);
        this.shopList.set(nextCart);
        this.stockIssues.set(issues);
        this.stockStatus.set('done');
      },
      error: () => {
        this.stockIssues.set([]);
        this.stockStatus.set('error');
      },
    });
  }

  // ---------------- Persistencia ----------------

  private scheduleSave(list: Shop[]) {
    if (this.saveTimer) clearTimeout(this.saveTimer);

    this.saveTimer = setTimeout(() => {
      const persisted: ShopPersisted[] = list.map((item) => ({
        productId: item.product.id,
        selectedSize: item.selectedSize,
        quantity: item.quantity ?? 1,
      }));
      localStorage.setItem('shopList', JSON.stringify(persisted));
    }, 300);
  }

  private loadFromLocalStorage() {
    const raw = localStorage.getItem('shopList');
    if (!raw) return;

    let persisted: ShopPersisted[];
    try {
      persisted = JSON.parse(raw) as ShopPersisted[];
    } catch {
      localStorage.removeItem('shopList');
      return;
    }

    if (!persisted.length) return;

    forkJoin(
      persisted.map((p) =>
        this.productService.getProductById(p.productId).pipe(
          take(1),
          map((product) => ({ p, product }))
        )
      )
    ).subscribe((results) => {
      const rebuilt: Shop[] = results
        .map(({ p, product }) => {
          if (!product) return null;
          return {
            product,
            selectedSize: p.selectedSize,
            quantity: p.quantity,
            subtotal: product.price,
          } as Shop;
        })
        .filter(Boolean) as Shop[];

      this.shopList.set(rebuilt);

      // 🔥 IMPORTANTE: el stock del localStorage puede estar viejo → forzamos verificación
      this.availableStockMap.set({});
      this.stockIssues.set([]);
      this.stockStatus.set('idle');
    });
  }

  private mapToShop(product: Jean, size: string): Shop {
    return {
      product,
      selectedSize: size,
      quantity: 1,
      subtotal: product.price,
    };
  }
}
