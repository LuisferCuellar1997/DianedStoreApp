import { Component, computed, inject, signal } from '@angular/core';
import { Navbar } from '../../../share/components/navbar/navbar';
import { ProductService } from '../../services/products.service';
import { ActivatedRoute } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { Jean, ProductFilters } from '../../interfaces/product.interface';
import { filter, map, switchMap, tap } from 'rxjs';
import { CurrencyPipe, TitleCasePipe } from '@angular/common';
import { ArrayPipe } from '../../pipes/arrays-pipe.pipe';
import { FilterService } from '../../services/filter.service';
import { Card } from '../../components/card/card';
import { ProductList } from '../product-list/product-list';

@Component({
  selector: 'app-product-detail',
  imports: [Navbar, TitleCasePipe, CurrencyPipe, Card, ProductList],
  templateUrl: './product-detail.html',
})
export class ProductDetail {

  private route=inject(ActivatedRoute)
  private prodService = inject(ProductService);
  private filterService = inject(FilterService);
  prod = toSignal(this.prodService.getJeans(), { initialValue: [] as Jean[] });
  filters = signal<ProductFilters>({
    search: '',
    gender: [],
    category: ['jean'],
    brand: [],
    maxPrice: null,
  });

   filteredProducts = computed(() => {
    return this.filterService.filterProducts(
      this.prod(),
      this.filters()
    );
  });

  productId = this.route.snapshot.paramMap.get('id');
  product = toSignal(
    this.route.paramMap.pipe(
      map(params => params.get('id')),
      tap(id => console.log('ID desde URL:', id)),
      switchMap(id =>
        id ? this.prodService.getProductById(id) : []
      ),
      tap(product => console.log('Producto desde Firebase:', product))
    ),
    { initialValue: null }
  );
}
