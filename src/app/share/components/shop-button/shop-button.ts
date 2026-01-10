import { Component, computed, effect, inject, signal } from '@angular/core';
import { ShoppingService } from '../../../shopping/services/shopping.service';
import { CurrencyPipe, TitleCasePipe } from '@angular/common';

@Component({
  selector: 'app-shop-button',
  imports: [TitleCasePipe, CurrencyPipe],
  templateUrl: './shop-button.html',
})
export class ShopButton {
  shoppingService=inject(ShoppingService)
  total=computed(()=>{
    let totalRes=0;
    this.shoppingService.shopList().forEach(x=>{
      totalRes+=x.product.price
    });
    return totalRes;
  });
}
