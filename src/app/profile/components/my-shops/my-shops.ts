import { Component, computed, effect, inject } from '@angular/core';
import { ShopHistory } from '../../services/my-shop.service';
import { toSignal } from '@angular/core/rxjs-interop';
import { OrderMapper } from '../../utilities/order-mapper.mapper';
import { switchMap } from 'rxjs';
import { ProductService } from '../../../products/services/products.service';
import { Navbar } from '../../../share/components/navbar/navbar';
import { DatePipe } from '@angular/common';
import { MyShop, MyShopByDate } from '../../interfaces/my-shop.interface';

@Component({
  selector: 'app-my-shops',
  templateUrl: './my-shops.html',
  imports: [Navbar, DatePipe],
})
export class MyShops {
  constructor() {
    effect(() => {
      console.log(this.shopsGroupedByDate());
    });
  }
  private shopHistory = inject(ShopHistory);
  private productService: ProductService = inject(ProductService);

  private mapper = new OrderMapper(this.productService);

  orders$ = this.shopHistory.getShopHistory();

  myShopList = toSignal(
    this.orders$.pipe(switchMap((orders) => this.mapper.mapOrders(orders ?? []))),
    { initialValue: [] },
  );

  shopsGroupedByDate = computed(() => this.groupByDate(this.myShopList()));

  groupByDate(shops: MyShop[]) {
  const map = new Map<string, { date: Date; orders: MyShop[] }>();

  shops.forEach(shop => {
    if (!shop.createdAt) return;

    const key = shop.createdAt.toISOString().split('T')[0];

    if (!map.has(key)) {
      map.set(key, {
        date: new Date(key),
        orders: [],
      });
    }

    map.get(key)!.orders.push({
      ...shop,        // 👈 CLAVE: copia TODO, incluido status
    });
  });

  return Array.from(map.values());
}

}
