import { Component, ElementRef, ViewChild, input } from '@angular/core';
import { Jean } from '../../interfaces/product.interface';
import { Card } from '../card/card';

@Component({
  selector: 'app-product-similar',
  standalone: true,
  imports: [Card],
  templateUrl: './product-similar.html',
})
export class ProductSimilar {

  products = input.required<Jean[]>();

  @ViewChild('scrollContainer', { static: true })
  scrollContainer!: ElementRef<HTMLDivElement>;

  scrollLeft() {
    this.scrollContainer.nativeElement.scrollBy({
      left: -300,
      behavior: 'smooth',
    });
  }

  scrollRight() {
    this.scrollContainer.nativeElement.scrollBy({
      left: 300,
      behavior: 'smooth',
    });
  }
}
