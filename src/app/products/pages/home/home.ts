import { Component, inject, signal } from '@angular/core';
import { Card } from '../../components/card/card';
import { ProductService } from '../../services/products.service';
import { Jean } from '../../interfaces/product.interface';
import { toSignal } from '@angular/core/rxjs-interop';
import { ProductList } from '../../product-list/product-list';

@Component({
  selector: 'app-home',
  standalone:true,
  imports: [ProductList],
  templateUrl: './home.html',
})
export class Home {

}
