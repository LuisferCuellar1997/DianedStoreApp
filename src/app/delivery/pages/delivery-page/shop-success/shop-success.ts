import { Component, inject, input } from '@angular/core';
import { DeliveryService } from '../../../services/delivery.service';
import { RouterLink } from '@angular/router';
import { ShoppingService } from '../../../../shopping/services/shopping.service';
import { CurrencyPipe } from '@angular/common';

@Component({
  selector: 'app-shop-success',
  imports: [RouterLink, CurrencyPipe],
  templateUrl: './shop-success.html',
})
export class ShopSuccess {
  deliveryService=inject(DeliveryService);
  shoppingService=inject(ShoppingService)
}
