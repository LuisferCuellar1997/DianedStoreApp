import { Component, computed, effect, inject, signal } from '@angular/core';
import { ShoppingService } from '../../../shopping/services/shopping.service';
import { CurrencyPipe, TitleCasePipe } from '@angular/common';

@Component({
  selector: 'app-shop-button',
  imports: [TitleCasePipe, CurrencyPipe],
  templateUrl: './shop-button.html',
})
export class ShopButton {
  private shoppingService=inject(ShoppingService)
  shoppingList=signal(this.shoppingService.shopList());
  total=signal(this.shoppingService.total());
}
