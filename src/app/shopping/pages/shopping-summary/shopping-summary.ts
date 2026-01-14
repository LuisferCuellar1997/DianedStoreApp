import { CommonModule } from '@angular/common';
import { Component, computed, inject, input } from '@angular/core';
import { ShoppingService } from '../../services/shopping.service';
import { RouterLink } from "@angular/router";

@Component({
  selector: 'app-shopping-summary',
  imports: [CommonModule, RouterLink],
  templateUrl: './shopping-summary.html',
  standalone: true,
})
export class ShoppingSummary {

  private shoppingService=inject(ShoppingService);
  hideButton=input<boolean>(false)
  subtotal=computed(()=>{
    return this.shoppingService.shopList().reduce(
      (acum, item) => acum + item.product.price * (item.quantity ?? 1),
      0
    )
  })
}
