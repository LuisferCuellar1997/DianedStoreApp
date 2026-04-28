import { Component, computed, effect, inject, signal, ViewChild, ElementRef } from '@angular/core';
import { ShoppingService } from '../../../shopping/services/shopping.service';
import { CurrencyPipe, TitleCasePipe } from '@angular/common';
import { RouterLink } from "@angular/router";

@Component({
  selector: 'app-shop-button',
  imports: [TitleCasePipe, CurrencyPipe, RouterLink],
  templateUrl: './shop-button.html',
})
export class ShopButton {
  @ViewChild('dropdownButton') dropdownButton!: ElementRef;
  
  shoppingService=inject(ShoppingService)
  shoppingList=this.shoppingService.shopList;
  isDropdownOpen = signal(false);
  
  total=computed(()=>{
    return this.shoppingList().reduce(
      (acum, item) => acum + item.product.price * (item.quantity ?? 1),
      0
    )
  })

  toggleDropdown() {
    this.isDropdownOpen.update(value => !value);
    if (this.isDropdownOpen() && this.dropdownButton) {
      this.dropdownButton.nativeElement.focus();
    }
  }

  closeDropdown() {
    this.isDropdownOpen.set(false);
  }
}
