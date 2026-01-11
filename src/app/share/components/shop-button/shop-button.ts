import { Component, computed, effect, inject, signal } from '@angular/core';
import { ShoppingService } from '../../../shopping/services/shopping.service';
import { CurrencyPipe, TitleCasePipe } from '@angular/common';
import { RouterLink } from "@angular/router";

@Component({
  selector: 'app-shop-button',
  imports: [TitleCasePipe, CurrencyPipe, RouterLink],
  templateUrl: './shop-button.html',
})
export class ShopButton {
  shoppingService=inject(ShoppingService)
  shoppingList=this.shoppingService.shopList;
  total=computed(()=>{
    let totalRes=0;
    this.shoppingList().forEach(x=>{
      totalRes+=x.product.price
    });
    return totalRes;
  });
}
