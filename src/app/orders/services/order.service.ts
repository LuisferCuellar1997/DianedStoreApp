import { inject, Injectable } from '@angular/core';
import { addDoc, collection, Firestore, serverTimestamp } from '@angular/fire/firestore';
import { Order } from '../interfaces/order.interface';
import { AuthSessionService } from '../../session/services/auth-session.service';

@Injectable({ providedIn: 'root' })
export class OrderService {
  private firestore = inject(Firestore);
  private session = inject(AuthSessionService);

  async addOrder(order: Order) {
    const user = await this.session.ensureReady();

    const ref = collection(this.firestore, 'orders');
    return addDoc(ref, {
      ...order,
      ownerUid: user.uid,
      status: 'Pendiente',
      numGuia: '',
      createdAt: serverTimestamp(),
    });
  }
}
