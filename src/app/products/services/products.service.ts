import { inject, Injectable } from '@angular/core';
import { Firestore, collectionData, collection } from '@angular/fire/firestore';
import { Observable, of } from 'rxjs';
import { Jean } from '../interfaces/product.interface';

@Injectable({providedIn: 'root'})
export class ProductService {
  constructor() {
    console.log('✅ ProductService instanciado');
  }
  private firestore=inject(Firestore)

  getJeans():Observable<Jean[]>{
    const prodsRef=collection(this.firestore,'products');
    return collectionData(prodsRef,{idField:'id'}) as Observable<Jean[]>;
  }

}
