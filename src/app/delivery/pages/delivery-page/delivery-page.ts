import { Component, computed, effect, inject, signal } from '@angular/core';
import { ShoppingSummary } from '../../../shopping/pages/shopping-summary/shopping-summary';
import { Navbar } from '../../../share/components/navbar/navbar';
import { ReactiveFormsModule } from '@angular/forms';
import { DeliveryService } from '../../services/delivery.service';
import { PersonalInfoForm } from './personal-info-form/personal-info-form';
import { AddressInfo } from './address-info/address-info';
import { ShoppingService } from '../../../shopping/services/shopping.service';

@Component({
  selector: 'app-delivery-page',
  imports: [PersonalInfoForm, AddressInfo, ShoppingSummary, Navbar, ReactiveFormsModule],
  templateUrl: './delivery-page.html',
})
export class DeliveryPage {
  constructor() {
    this.shoppingService.showToPay.set(true);
    effect(()=>{
      console.log("personal enabledButton-> ",this.enableButtonShop());
    })
  }
  shoppingService = inject(ShoppingService);
  deliveryService = inject(DeliveryService);
  shopCount = computed(() => this.shoppingService.shopList().length);
  enableButtonShop = signal(
    this.deliveryService.formAddressValid() && this.deliveryService.formPersInfoValid()
  );

  submitStore() {
    throw new Error('Method not implemented.');
  }
}
