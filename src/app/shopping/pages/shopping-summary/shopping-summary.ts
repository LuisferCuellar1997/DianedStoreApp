import { CommonModule } from '@angular/common';
import { Component, computed, effect, inject, input } from '@angular/core';
import { ShoppingService } from '../../services/shopping.service';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-shopping-summary',
  imports: [CommonModule, RouterLink],
  templateUrl: './shopping-summary.html',
  standalone: true,
})
export class ShoppingSummary {
  // ✅ debe ser público para usarlo en el template
  shoppingService = inject(ShoppingService);

  hideButton = input<boolean>(false);
  showProdToPay = input<boolean>(false);

  shopList = this.shoppingService.shopList;

  subtotal = computed(() => this.shoppingService.subtotal());

  constructor() {
    this.shoppingService.showToPay.set(false);

    // ✅ al cargar el summary, verifica stock una vez si está pendiente
    effect(() => {
      const list = this.shopList();
      if (list.length && this.shoppingService.stockStatus() === 'idle') {
        this.shoppingService.syncCartWithStock();
      }
    });
  }
}
