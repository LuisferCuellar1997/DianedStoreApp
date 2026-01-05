import { Component, input, signal } from '@angular/core';
import { Jean } from '../../interfaces/product.interface';
import { CommonModule, CurrencyPipe, DecimalPipe, TitleCasePipe } from '@angular/common';
import { ShowGenderPIpe } from '../../pipes/gender-pipe.pipe';
import { ArrayPipe } from '../../pipes/arrays-pipe.pipe';


@Component({
  selector: 'app-card',
  imports: [CommonModule,TitleCasePipe, ShowGenderPIpe, ArrayPipe, CurrencyPipe],
  templateUrl: './card.html',
  standalone:true
})
export class Card {
  product=input.required<Jean>();
}
