import { Component, computed, effect, inject, signal } from '@angular/core';
import { ShoppingSummary } from '../../../shopping/pages/shopping-summary/shopping-summary';
import { Navbar } from '../../../share/components/navbar/navbar';
import { ReactiveFormsModule } from '@angular/forms';
import { DeliveryService } from '../../services/delivery.service';
import { PersonalInfoForm } from './personal-info-form/personal-info-form';
import { AddressInfo } from './address-info/address-info';
import { ShoppingService } from '../../../shopping/services/shopping.service';
import { Order } from '../../../orders/interfaces/order.interface';
import { OrderService } from '../../../orders/services/order.service';
import { ShopSuccess } from './shop-success/shop-success';

@Component({
  selector: 'app-delivery-page',
  imports: [
    ShopSuccess,
    PersonalInfoForm,
    AddressInfo,
    ShoppingSummary,
    Navbar,
    ReactiveFormsModule,
  ],
  templateUrl: './delivery-page.html',
})
export class DeliveryPage {
  constructor() {
    this.shoppingService.showToPay.set(true);
    this.deliveryService.personalInfoDeployed.set(true);
    this.deliveryService.addressInfoDeployed.set(false);
    this.deliveryService.finishForms.set(false);

  }
  shoppingService = inject(ShoppingService);
  deliveryService = inject(DeliveryService);
  orderService = inject(OrderService);
  shopCount = computed(() => this.shoppingService.shopList().length);
  enableButtonShop = computed(
    () =>
      this.deliveryService.formAddressValid() &&
      this.deliveryService.formPersInfoValid() &&
      this.shopCount() > 0
  );

  submitStore() {
    const order: Order = {
      customer: this.deliveryService.personalInfoFormFilled(),
      address: this.deliveryService.addresInfoFormFilled(),
      items: this.shoppingService.shopList().flatMap((x) => {
        const prodId = x.product.id;
        return {
          productId: prodId,
          size: x.selectedSize,
          quantity: x.quantity,
          price: x.product.price,
        };
      }),
      total: this.shoppingService.subtotal(),
    };
    this.orderService.addOrder(order);
    this.shoppingService.cleanShoppingList();
    this.deliveryService.deliveryFinished.set(true);
  }
}
