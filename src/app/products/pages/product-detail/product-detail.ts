import { Component, computed, effect, inject, signal } from '@angular/core';
import { Navbar } from '../../../share/components/navbar/navbar';
import { ProductService } from '../../services/products.service';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { Jean, ProductFilters } from '../../interfaces/product.interface';
import { filter, map, switchMap, tap } from 'rxjs';
import { CurrencyPipe, TitleCasePipe, UpperCasePipe } from '@angular/common';
import { ArrayPipe } from '../../pipes/arrays-pipe.pipe';
import { FilterService } from '../../services/filter.service';
import { Card } from '../../components/card/card';
import { ProductList } from '../product-list/product-list';
import { Skeleton } from '../../../share/components/skeleton/skeleton';
import { ScrollService } from '../../../share/components/services/scroll-service.service';
import { ProductSimilar } from '../../components/product-similar/product-similar';

@Component({
  selector: 'app-product-detail',
  imports: [Navbar, TitleCasePipe, CurrencyPipe, Skeleton, ProductSimilar, UpperCasePipe,RouterLink],
  templateUrl: './product-detail.html',
  styleUrl: './product-detail.css',
})
export class ProductDetail {
  private route = inject(ActivatedRoute);
  private prodService = inject(ProductService);
  private filterService = inject(FilterService);
  selectedSize=signal<string|null>(null);
  loading = signal(true);
  prod = toSignal(this.prodService.getJeans(), { initialValue: [] as Jean[] });

  filters = signal<ProductFilters>({
    search: '',
    gender: [],
    category: [],
    brand: [],
    maxPrice: null,
  });

  filtersSameRef = signal<ProductFilters>({
    search: '',
    gender: [],
    category: [],
    brand: [],
    maxPrice: null,
    description:[]
  });

  filteredProducts = computed(() => {
    const current = this.product();
    if (!current) return [];

    return this.filterService
      .filterProducts(this.prod(), this.filters())
      .filter((p) => p.id !== current.id);
  });

  filteredSameReference=computed(()=>{
    const current=this.product();
    if(!current)return[];
    return this.filterService.filterProducts(this.prod(),this.filtersSameRef()).filter((p)=>p.reference!==current.reference)
  })

  productId = this.route.snapshot.paramMap.get('id');
  product = toSignal(
    this.route.paramMap.pipe(
      map((params) => params.get('id')),
      switchMap((id) => (id ? this.prodService.getProductById(id) : []))
    ),
    { initialValue: null }
  );

  constructor() {
    effect(() => {
      const product = this.product();

      if (!product) return;

      // 🔁 actualizar filtros dinámicamente
      this.filters.update((f) => ({
        ...f,
        category: [product.category],
      }));
      this.filtersSameRef.update((f)=>({
        ...f,
        category:[product.category],
        description:[product.description],
      }))

      // ⬆️ scroll al inicio solo cuando cambia el producto
      window.scrollTo({ top: 0 });

      // ⏳ skeleton
      this.loading.set(true);
      setTimeout(() => this.loading.set(false), 500);
    });
  }
}
