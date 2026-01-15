import { Injectable, effect, signal, inject } from '@angular/core';
import { forkJoin, map, of } from 'rxjs';
import { Shop } from '../interfaces/shop.interface';
import { Jean } from '../../products/interfaces/product.interface';
import { ProductService } from '../../products/services/products.service';

type ShopPersisted = {
  productId: string;
  selectedSize: string;
  quantity: number;
};

@Injectable({ providedIn: 'root' })
export class ShoppingService {
  private productService = inject(ProductService);

  shopList = signal<Shop[]>([]);
  private saveTimer: any = null;
  showToPay=signal(false);

  constructor() {
    this.loadFromLocalStorage();

    // Guarda automáticamente cuando cambie shopList (debounced)
    effect(() => {
      const list = this.shopList();
      this.scheduleSave(list);
    });
  }

  addToCart(product: Jean, size: string) {
    this.shopList.update(list => {
      const found = list.find(x => x.product.id === product.id && x.selectedSize === size);
      if (found) {
        return list.map(x =>
          x.product.id === product.id && x.selectedSize === size
            ? { ...x, quantity: (x.quantity ?? 1) + 1 }
            : x
        );
      }
      return [...list, this.mapToShop(product, size)];
    });
  }

  changeQuantity(id: string, selectedSize: string, operation: number) {
    this.shopList.update(list =>
      list.map(item => {
        if (item.product.id === id && item.selectedSize === selectedSize) {
          const next = (item.quantity ?? 1) + operation;
          return { ...item, quantity: Math.max(1, next) };
        }
        return item;
      })
    );
  }

  deleteProduct(id: string, selectedSize: string) {
    this.shopList.update(list => list.filter(prod => !(prod.product.id === id && prod.selectedSize === selectedSize)));
  }

  // ---------- Persistencia optimizada ----------
  private scheduleSave(list: Shop[]) {
    if (this.saveTimer) clearTimeout(this.saveTimer);

    this.saveTimer = setTimeout(() => {
      const persisted: ShopPersisted[] = list.map(item => ({
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
      persisted.map(p =>
        this.productService.getProductById(p.productId).pipe(
          map(product => ({ p, product }))
        )
      )
    ).subscribe(results => {
      const rebuilt: Shop[] = results
        .map(({ p, product }) => {
          if (!product) return null; // producto borrado o inexistente
          return {
            product,
            selectedSize: p.selectedSize,
            quantity: p.quantity,
            subtotal: product.price, // si no lo usas, puedes quitarlo del modelo
          } as Shop;
        })
        .filter(Boolean) as Shop[];

      this.shopList.set(rebuilt);
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
