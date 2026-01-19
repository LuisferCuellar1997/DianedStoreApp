import { inject, Injectable, signal } from '@angular/core';
import { collectionData, Firestore } from '@angular/fire/firestore';
import { Customer, Order } from '../../orders/interfaces/order.interface';
import { collection, query, where } from 'firebase/firestore';
import { Shop } from '../../shopping/interfaces/shop.interface';
import { forkJoin, map, Observable, pipe, take } from 'rxjs';
import { MyShop } from '../interfaces/my-shop.interface';
import { ProductService } from '../../products/services/products.service';

@Injectable({ providedIn: 'root' })
export class ShopHistory {
  constructor() {}

  firebase = inject(Firestore);
  productService = inject(ProductService);
  userInfo = signal<Customer>({});
  getShopHistory() {
    this.userInfo.set(this.readCustomer() ?? {});
    const result = query(
      collection(this.firebase, 'orders'),
      where('customer.numDoc', '==', this.userInfo().numDoc),
    );
    return collectionData(result, { idField: 'id' }) as Observable<Order[] | []>;
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
