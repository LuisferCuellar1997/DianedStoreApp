// order-mapper.mapper.ts
import { ProductService } from '../../products/services/products.service';
import { Order, Item, Address } from '../../orders/interfaces/order.interface';
import { MyShop } from '../interfaces/my-shop.interface';
import { forkJoin, map, Observable, take } from 'rxjs';
import { Product } from '../../products/interfaces/product.interface';

export class OrderMapper {
  constructor(private productService: ProductService) {}

  /** Convierte Order[] → Observable<MyShop[]> */
  mapOrders(orders: Order[]): Observable<MyShop[]> {
    if (!orders.length) {
      return new Observable((sub) => {
        sub.next([]);
        sub.complete();
      });
    }

    const orders$ = orders.map((order) => this.mapSingleOrder(order));
    return forkJoin(orders$);
  }

  /** Convierte una Order → Observable<MyShop> */
  private mapSingleOrder(order: Order): Observable<MyShop> {
    const items$ = order.items.map((item) => this.mapItem(item));

    return forkJoin(items$).pipe(
      map((items) => ({
        address: order.address,
        items,
        total: order.total,
        createdAt: order.createdAt?.toDate(),
        status: order.status, // 👈 AQUI
        numGuia:order.numGuia
      })),
    );
  }

  /** Convierte Item → Observable<MyShopItem> */
  private mapItem(item: Item) {
    return this.productService.getProductById(item.productId!).pipe(
      take(1),
      map((product) => {
        if (!product) {
          throw new Error(`Producto no encontrado: ${item.productId}`);
        }

        return {
          product, // 👈 YA NO ES NULL
          size: item.size,
          quantity: item.quantity,
          price: item.price,
        };
      }),
    );
  }
}
