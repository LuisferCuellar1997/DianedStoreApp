import { inject, Injectable } from '@angular/core';
import { Firestore, doc, docData, collectionData, collection } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { take } from 'rxjs/operators';
import { Jean } from '../interfaces/product.interface';

@Injectable({ providedIn: 'root' })
export class ProductService {
  private firestore = inject(Firestore);

  getJeans(): Observable<Jean[]> {
    const prodsRef = collection(this.firestore, 'products');
    return collectionData(prodsRef, { idField: 'id' }) as Observable<Jean[]>;
  }

  getProductById(id: string): Observable<Jean | null> {
    const ref = doc(this.firestore, `products/${id}`);
    return (docData(ref, { idField: 'id' }) as Observable<Jean | null>).pipe(
      take(1)
    );
  }
}
