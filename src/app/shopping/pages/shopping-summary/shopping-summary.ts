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

  constructor(){
    this.shoppingService.showToPay.set(false)
  }

  private shoppingService=inject(ShoppingService);
  hideButton=input<boolean>(false)
  shopList=this.shoppingService.shopList;
  showProdToPay=input<boolean>(false);
  subtotal=computed(()=>{
    return this.shoppingService.subtotal();
  })
}
