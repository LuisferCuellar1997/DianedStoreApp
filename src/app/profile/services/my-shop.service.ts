import { inject, Injectable, signal } from '@angular/core';
import { collectionData, Firestore } from '@angular/fire/firestore';
import { Customer, Order } from '../../orders/interfaces/order.interface';
import { collection, query, where } from 'firebase/firestore';
import { forkJoin, from, map, Observable, pipe, switchMap, take } from 'rxjs';
import { MyShop } from '../interfaces/my-shop.interface';
import { ProductService } from '../../products/services/products.service';
import { AuthSessionService } from '../../session/services/auth-session.service';

@Injectable({ providedIn: 'root' })
export class ShopHistory {
  constructor() {}

  firebase = inject(Firestore);
  productService = inject(ProductService);
  private session=inject(AuthSessionService)
  userInfo = signal<Customer>({});
  getShopHistory() {
    this.userInfo.set(this.readCustomer() ?? {});

    return from(this.session.ensureReady()).pipe(
      switchMap((user) => {
        const result = query(
          collection(this.firebase, 'orders'),
          where('ownerUid', '==', user.uid),
          where('customer.numDoc', '==', this.userInfo().numDoc),
        );

        return collectionData(result, { idField: 'id' }) as Observable<Order[]>;
      }),
    );
  }
  readCustomer() {
    //customerInfo
    const customerInfo = localStorage.getItem('customerInfo');
    if (!customerInfo) return null;
    try {
      return JSON.parse(customerInfo) as Customer;
    } catch {
      return null;
    }
  }
  resolveOrder(order: Order): Observable<MyShop> {
    const productRequests$ = order.items.map((item) =>
      this.productService.getProductById(item.productId!).pipe(
        take(1),
        map((product) => {
          if (!product) {
            throw new Error(`Producto no encontrado: ${item.productId}`);
          }

          return {
            product,
            size: item.size,
            quantity: item.quantity,
            price: item.price,
          };
        }),
      ),
    );

    return forkJoin(productRequests$).pipe(
      map((items) => ({
        address: order.address,
        items,
        total: order.total,
        createdAt: order.createdAt?.toDate(),
      })),
    );
  }
  resolveOrders(orders: Order[]): Observable<MyShop[]> {
    return forkJoin(orders.map((order) => this.resolveOrder(order)));
  }
}
