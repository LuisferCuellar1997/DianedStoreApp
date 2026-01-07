import { inject, Injectable } from '@angular/core';
import { Firestore, doc,docData,collectionData, collection } from '@angular/fire/firestore';
import { Observable, of } from 'rxjs';
import { Jean } from '../interfaces/product.interface';

@Injectable({providedIn: 'root'})
export class ProductService {
  constructor() {
    console.log('✅ ProductService instanciado');
  }
  private firestore=inject(Firestore)

  getJeans():Observable<Jean[]>{
    console.log("CONSULTA")
    const prodsRef=collection(this.firestore,'products');
    return collectionData(prodsRef,{idField:'id'}) as Observable<Jean[]>;
  }

 getProductById(id: string): Observable<Jean | null> {
    const ref = doc(this.firestore, `products/${id}`);
    return docData(ref, { idField: 'id' }) as Observable<Jean | null>;
  }
}
