import { CurrencyPipe } from '@angular/common';
import { Component, computed, inject, input } from '@angular/core';
import { ShoppingService } from '../../services/shopping.service';

@Component({
  selector: 'app-shopping-summary',
  imports: [CurrencyPipe],
  templateUrl: './shopping-summary.html',
})
export class ShoppingSummary {
  private shoppingService=inject(ShoppingService);
  subtotal=computed(()=>{
    return this.shoppingService.shopList().reduce((acum,i)=>(acum+i.product.price),0);
  })
}
