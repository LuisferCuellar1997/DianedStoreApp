import { Component, computed, inject, signal } from '@angular/core';
import { ShoppingSummary } from '../../../shopping/pages/shopping-summary/shopping-summary';
import { Navbar } from '../../../share/components/navbar/navbar';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators,
  ɵInternalFormsSharedModule,
} from '@angular/forms';
import { TitleCasePipe } from '@angular/common';
import { FormUtils } from '../../../utils/form-utils';
import { PhoneSpacesPipe } from '../../../products/pipes/phone-pipe.pipe';
import { DeliveryService } from '../../services/delivery.service';
import { PersonalInfoForm } from './personal-info-form/personal-info-form';
import { AddressInfo } from './address-info/address-info';
import { ShoppingService } from '../../../shopping/services/shopping.service';


@Component({
  selector: 'app-delivery-page',
  imports: [PersonalInfoForm, AddressInfo,ShoppingSummary, Navbar, ReactiveFormsModule],
  templateUrl: './delivery-page.html',
})
export class DeliveryPage {

  shoppingService=inject(ShoppingService)
  shopCount = computed(() => this.shoppingService.shopList().length);
}
