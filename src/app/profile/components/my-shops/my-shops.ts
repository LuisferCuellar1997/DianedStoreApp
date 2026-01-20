import { Component, computed, effect, inject, signal } from '@angular/core';
import { ShopHistory } from '../../services/my-shop.service';
import { toSignal } from '@angular/core/rxjs-interop';
import { OrderMapper } from '../../utilities/order-mapper.mapper';
import { switchMap } from 'rxjs';
import { ProductService } from '../../../products/services/products.service';
import { Navbar } from '../../../share/components/navbar/navbar';
import { DatePipe, TitleCasePipe, UpperCasePipe } from '@angular/common';
import { MyShop, MyShopByDate } from '../../interfaces/my-shop.interface';
import { RouterLink } from '@angular/router';
import { FilterService } from '../../../products/services/filter.service';
import { Jean, ProductFilters } from '../../../products/interfaces/product.interface';

@Component({
  selector: 'app-my-shops',
  templateUrl: './my-shops.html',
  imports: [Navbar, DatePipe, RouterLink, UpperCasePipe, TitleCasePipe],
})
export class MyShops {
  constructor() {
    effect(() => {
      console.log(this.shopsGroupedByDate());
    });
  }
  private shopHistory = inject(ShopHistory);
  private filterService = inject(FilterService);
  private productService: ProductService = inject(ProductService);

  private mapper = new OrderMapper(this.productService);

  orders$ = this.shopHistory.getShopHistory();

  myShopList = toSignal(
    this.orders$.pipe(switchMap((orders) => this.mapper.mapOrders(orders ?? []))),
    { initialValue: [] },
  );

  showCategoryFilter = false;

  categories = ['Todas', 'Jean', 'Vestido', 'Short'];

  selectedCategory = signal<string>('Categoría');
  showDateFilter = false;

  dateOptions = [
    { label: 'Todas', value: 'all' },
    { label: 'Hoy', value: 'today' },
    { label: 'Últimos 7 días', value: '7d' },
    { label: 'Últimos 30 días', value: '30d' },
    { label: 'Este año', value: 'year' },
  ];
  productFilters = signal<ProductFilters>({
    search: '',
    gender: [],
    category: [],
    brand: [],
    maxPrice: null,
  });

  selectedDateFilter = signal<string>('all');

  groupByDate(shops: MyShop[]) {
    const map = new Map<string, { date: Date; orders: MyShop[] }>();

    shops.forEach((shop) => {
      if (!shop.createdAt) return;

      const key = shop.createdAt.toISOString().split('T')[0];

      if (!map.has(key)) {
        map.set(key, {
          date: new Date(key),
          orders: [],
        });
      }

      map.get(key)!.orders.push({
        ...shop, // 👈 CLAVE: copia TODO, incluido status
      });
    });

    return Array.from(map.values());
  }
  filteredByProductFilters = computed(() => {
    const filters = this.productFilters();
    const shops = this.myShopList();

    return shops
      .map((shop) => {
        const products = shop.items.map((i) => i.product).filter((p): p is Jean => !!p);

        const filteredProducts = this.filterService.filterProducts(products, filters);

        const filteredItems = shop.items.filter((item) =>
          filteredProducts.some((p) => p.id === item.product?.id),
        );

        return {
          ...shop,
          items: filteredItems,
        };
      })
      .filter((shop) => shop.items.length > 0);
  });

  // ✅ label de fecha (para no meter .find en el template)
  selectedDateLabel = computed(() => {
    return this.dateOptions.find((d) => d.value === this.selectedDateFilter())?.label ?? 'Fecha';
  });

  // ✅ input search -> productFilters.search
  onSearch(ev: Event) {
    const value = (ev.target as HTMLInputElement).value ?? '';
    this.productFilters.update((f) => ({ ...f, search: value }));
  }

  selectCategory(category: string) {
    this.selectedCategory.set(category);
    this.showCategoryFilter = false;

    this.productFilters.update((f) => ({
      ...f,
      category: category === 'Todas' ? [] : [category.toLowerCase()],
    }));
  }

  selectDate(value: string) {
    this.selectedDateFilter.set(value);
    this.showDateFilter = false;
  }
  private passesDateFilter(createdAt: Date | undefined, filter: string) {
    if (!createdAt) return false;
    if (filter === 'all') return true;

    const now = new Date();

    // helper: inicio del día en hora local (evita problemas por UTC)
    const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());

    const a = startOfDay(createdAt);
    const b = startOfDay(now);

    const diffDays = Math.floor((b.getTime() - a.getTime()) / (1000 * 60 * 60 * 24));

    if (filter === 'today') return diffDays === 0;
    if (filter === '7d') return diffDays >= 0 && diffDays < 7;
    if (filter === '30d') return diffDays >= 0 && diffDays < 30;
    if (filter === 'year') return createdAt.getFullYear() === now.getFullYear();

    return true;
  }

  filteredShops = computed(() => {
    const filters = this.productFilters();
    const dateFilter = this.selectedDateFilter();
    const shops = this.myShopList();

    // 1) filtra por fecha (a nivel de orden)
    const byDate = shops.filter((s) => this.passesDateFilter(s.createdAt, dateFilter));

    // 2) filtra por búsqueda/categoría (a nivel de items)
    return byDate
      .map((shop) => {
        const products = shop.items.map((i) => i.product).filter((p): p is Jean => !!p);
        const filteredProducts = this.filterService.filterProducts(products, filters);

        const filteredItems = shop.items.filter((item) =>
          filteredProducts.some((p) => p.id === item.product?.id),
        );

        return { ...shop, items: filteredItems };
      })
      .filter((shop) => shop.items.length > 0);
  });

  // ✅ AHORA agrupa usando la lista filtrada (no la cruda)
  shopsGroupedByDate = computed(() => this.groupByDate(this.filteredShops()));

  // opcional: contador real de compras (órdenes), no días agrupados
  totalFilteredOrders = computed(() => {
    return this.filteredShops().reduce((shopAcc, shop) => {
      const itemsCount = shop.items.reduce((itemAcc, item) => {
        const q = item.quantity ?? 1;
        return itemAcc + q;
      }, 0);

      return shopAcc + itemsCount;
    }, 0);
  });
}
