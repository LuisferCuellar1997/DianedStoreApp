import { Component, computed, inject, input } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ProductService } from '../services/products.service';
import { Jean, ProductFilters } from '../interfaces/product.interface';
import { Card } from '../components/card/card';

@Component({
  selector: 'app-product-list',
  imports: [Card],
  templateUrl: './product-list.html',
})
export class ProductList {


  prod=input.required<Jean[]>();
  filters=input.required<ProductFilters>()

}
