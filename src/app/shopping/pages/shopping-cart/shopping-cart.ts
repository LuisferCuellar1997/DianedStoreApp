import { Component, computed, effect, inject } from '@angular/core';
import { Navbar } from '../../../share/components/navbar/navbar';
import { ShoppingService } from '../../services/shopping.service';
import { CurrencyPipe, TitleCasePipe } from '@angular/common';
import { ShoppingSummary } from '../shopping-summary/shopping-summary';

@Component({
  selector: 'app-shopping-cart',
  imports: [Navbar, TitleCasePipe, CurrencyPipe, ShoppingSummary],
  templateUrl: './shopping-cart.html',
})
export class ShoppingCart {
  shoppingService = inject(ShoppingService);

  shoppingList = this.shoppingService.shopList;

  constructor() {
    // ✅ al entrar al carrito, verifica stock una vez si está pendiente
    effect(() => {
      const list = this.shoppingList();
      if (list.length && this.shoppingService.stockStatus() === 'idle') {
        this.shoppingService.syncCartWithStock();
      }
    });
  }

  subTotalCart = computed(() => {
    return this.shoppingList().reduce(
      (acum, item) => acum + (item.quantity ?? 1) * item.product.price,
      0
    );
  });

  changeQuantity(id: string, selectedSize: string, quantity: number, operation: number) {
    if (quantity === 1 && operation < 0) return;

    // ✅ si es + y no se puede aumentar, no hace nada
    if (operation > 0) {
      const item = this.shoppingList().find(
        x => x.product.id === id && x.selectedSize === selectedSize
      );
      if (!item || !this.shoppingService.canIncrease(item)) return;
    }

    this.shoppingService.changeQuantity(id, selectedSize, operation);
  }

  deleteProduct(id: string, selectedSize: string) {
    this.shoppingService.deleteProduct(id, selectedSize);
  }
}
