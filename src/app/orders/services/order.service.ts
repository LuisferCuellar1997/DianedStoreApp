import { inject, Injectable } from '@angular/core';
import { addDoc, collection, Firestore, serverTimestamp } from '@angular/fire/firestore';
import { Order } from '../interfaces/order.interface';

@Injectable({providedIn: 'root'})
export class OrderService {

  private firestore=inject(Firestore)

  addOrder(order:Order){
    const ref=collection(this.firestore,'orders');
    return addDoc(ref,{
      ...order,
      status:'pending',
      createdAt:serverTimestamp(),
    });
  }
}
