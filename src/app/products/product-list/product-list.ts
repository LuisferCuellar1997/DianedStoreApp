import { Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ProductService } from '../services/products.service';
import { Jean } from '../interfaces/product.interface';
import { Card } from '../components/card/card';

@Component({
  selector: 'app-product-list',
  imports: [Card],
  templateUrl: './product-list.html',
})
export class ProductList {

  private prodSevice=inject(ProductService)
  prod=toSignal(this.prodSevice.getProducts(), { initialValue: [] as Jean[] });

}
