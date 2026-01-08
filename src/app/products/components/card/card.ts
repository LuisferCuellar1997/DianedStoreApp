import { Component, inject, input, signal } from '@angular/core';
import { Jean } from '../../interfaces/product.interface';
import { CommonModule, CurrencyPipe, DecimalPipe, TitleCasePipe } from '@angular/common';
import { ShowGenderPIpe } from '../../pipes/gender-pipe.pipe';
import { ArrayPipe } from '../../pipes/arrays-pipe.pipe';
import { RouterLink } from '@angular/router';
import { ScrollService } from '../../../share/components/services/scroll-service.service';


@Component({
  selector: 'app-card',
  imports: [RouterLink,CommonModule,TitleCasePipe, ShowGenderPIpe, ArrayPipe, CurrencyPipe],
  templateUrl: './card.html',
  standalone:true
})
export class Card {
  product=input.required<Jean>();
  private scrollService = inject(ScrollService);

saveScroll() {
  this.scrollService.save();
}
}
