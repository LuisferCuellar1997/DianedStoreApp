import { CurrencyPipe } from '@angular/common';
import { Component, input } from '@angular/core';

@Component({
  selector: 'app-shopping-summary',
  imports: [CurrencyPipe],
  templateUrl: './shopping-summary.html',
})
export class ShoppingSummary {
  subtotal=input.required<number>();
}
