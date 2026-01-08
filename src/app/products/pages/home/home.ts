import { Component, computed, inject, input, signal } from '@angular/core';
import { Card } from '../../components/card/card';
import { ProductService } from '../../services/products.service';
import { Jean, Product, ProductFilters } from '../../interfaces/product.interface';
import { toSignal } from '@angular/core/rxjs-interop';
import { ProductList } from '../product-list/product-list';
import { Navbar } from '../../../share/components/navbar/navbar';
import { FilterService } from '../../services/filter.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [ProductList, Navbar],
  templateUrl: './home.html',
})
export class Home {
  private prodSevice = inject(ProductService);

  private filterService=inject(FilterService)

  prod = toSignal(this.prodSevice.getJeans(), { initialValue: [] as Jean[] });

  loading = signal(false);

  hasInteracted = signal(false);

  page=signal(1);
  pageSize=signal(9);

  filters = signal<ProductFilters>({
    search: '',
    gender: [],
    category: [],
    brand: [],
    maxPrice: null,
  });

  showNoResults = computed(() =>
  this.hasInteracted() &&
  !this.loading() &&
  this.filteredProducts().length === 0
  );

  filteredProducts = computed(() => {
    if(this.filters().maxPrice!==null){
      this.filters().maxPrice!*=1000;
    }
    return this.filterService.filterProducts(
      this.prod(),
      this.filters()
    );
  });

  paginatedProducts = computed(() => {
    const page = this.page();
    const size = this.pageSize();

    const start = (page - 1) * size;
    const end = start + size;

    return this.filteredProducts().slice(start, end);
  });

  totalPages = computed(() =>
    Math.ceil(this.filteredProducts().length / this.pageSize())
  );

  private loadingTimeout: any;
  updateFilters(partial: Partial<ProductFilters>) {
    this.hasInteracted.set(true);
    this.loading.set(true);
    if (this.loadingTimeout) {
      clearTimeout(this.loadingTimeout);
    }
    this.page.set(1);
    this.filters.update((current) => ({...current, ...partial,}));
    this.loadingTimeout = setTimeout(() => {
      this.loading.set(false);
    }, 1000);
  }


  /* filteredProducts = computed(() => {
    const f = this.filters();
    if (f.maxPrice != null) f.maxPrice *= 1000;
    console.log(f.maxPrice);
    console.log(f.search);
    return this.prod().filter((p) => {
      if (f.search) {
        const term = f.search.toLowerCase();
        const matchDescription = p.description?.toLowerCase().includes(term);
        const matchReference = p.reference?.toLowerCase().includes(term);
        if (!matchDescription && !matchReference) {
          return false;
        }
      }
      if (f.gender.length && !f.gender.includes(p.gender)) return false;
      if (f.category.length && !f.category.includes(p.category)) return false;
      if (f.brand.length && !f.brand.includes(p.brand)) return false;
      if (f.maxPrice !== null && p.price > f.maxPrice) return false;
      return true;
    });
  }); */
}
