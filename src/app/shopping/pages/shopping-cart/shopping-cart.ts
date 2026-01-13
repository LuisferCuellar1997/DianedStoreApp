import { Component, computed, effect, inject } from '@angular/core';
import { Navbar } from '../../../share/components/navbar/navbar';
import { ShoppingService } from '../../services/shopping.service';
import { CurrencyPipe, TitleCasePipe } from '@angular/common';
import { Shop } from '../../interfaces/shop.interface';
import { filter } from 'rxjs';
import { ShoppingSummary } from '../shopping-summary/shopping-summary';

@Component({
  selector: 'app-shopping-cart',
  imports: [Navbar, TitleCasePipe, CurrencyPipe, ShoppingSummary],
  templateUrl: './shopping-cart.html',
})
export class ShoppingCart {
  shoppingService=inject(ShoppingService);
  shoppingList=this.shoppingService.shopList;
  subTotalCart=computed(()=>{
    return this.shoppingList().reduce((acumulator,item)=>acumulator+(item.quantity!*item.product.price),0);
  });

  changeQuantity(id:string,selectedSize:string,quantity:number,operation:number){
    const cant= this.shoppingList().at(0)?.quantity!;

    if(quantity===1 && operation<0)return
    this.shoppingService.changeQuantity(id,selectedSize,operation)
  }

  deleteProduct(id:string,selectedSize:string){
    this.shoppingService.deleteProduct(id,selectedSize);
  }

}
