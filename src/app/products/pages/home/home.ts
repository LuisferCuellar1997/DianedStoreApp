import { Component, computed, effect, inject, signal } from '@angular/core';
import { ActivatedRoute, NavigationStart, Router } from '@angular/router';
import { ProductService } from '../../services/products.service';
import { Jean, ProductFilters } from '../../interfaces/product.interface';
import { toSignal } from '@angular/core/rxjs-interop';
import { ProductList } from '../product-list/product-list';
import { Navbar } from '../../../share/components/navbar/navbar';
import { FilterService } from '../../services/filter.service';
import { ScrollService } from '../../../share/components/services/scroll-service.service';
import { filter } from 'rxjs';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [ProductList, Navbar],
  templateUrl: './home.html',
})
export class Home {

  private prodService = inject(ProductService);
  private filterService = inject(FilterService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private scrollService = inject(ScrollService);

  prod = toSignal(this.prodService.getJeans(), { initialValue: [] as Jean[] });

  loading = signal(true);
  hasInteracted = signal(false);

  page = signal(1);
  pageSize = signal(9);

  filters = signal<ProductFilters>({
    search: '',
    gender: [],
    category: [],
    brand: [],
    maxPrice: null,
  });

  private loadingTimeout: any;

  constructor() {
  this.route.queryParamMap.subscribe(params => {
    const pageParam = Number(params.get('page')) || 1;
    this.page.set(pageParam);
  });

  effect(() => {
    this.filters();
    this.prod();

    this.loading.set(true);

    if (this.loadingTimeout) {
      clearTimeout(this.loadingTimeout);
    }

    this.loadingTimeout = setTimeout(() => {
      this.loading.set(false);
    }, 500);
  });

  this.router.events
    .pipe(filter(e => e instanceof NavigationStart))
    .subscribe((event: any) => {
      if (event.navigationTrigger === 'popstate') {
        this.scrollService.markForRestore();
      }
    });

  effect(() => {
    if (!this.loading()) {
      setTimeout(() => {
        this.scrollService.restoreIfNeeded();
      });
    }
  });
}


  // 🔹 Filtros (SIN mutar estado)
  filteredProducts = computed(() => {
    const filters = this.filters();

    const normalizedFilters: ProductFilters = {
      ...filters,
      maxPrice: filters.maxPrice !== null ? filters.maxPrice * 1000 : null,
    };

    return this.filterService.filterProducts(
      this.prod(),
      normalizedFilters
    );
  });

  // 🔹 Paginado
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

  showNoResults = computed(() =>
    this.hasInteracted() &&
    !this.loading() &&
    this.filteredProducts().length === 0
  );

  // 🔹 Cambiar filtros
  updateFilters(partial: Partial<ProductFilters>) {
    this.hasInteracted.set(true);
    this.filters.update(current => ({ ...current, ...partial }));

    // actualizar URL
    this.router.navigate([], {
      queryParams: { page: 1 },
      queryParamsHandling: 'merge',
    });
  }

  goToPage(page: number) {
    this.page.set(page);

    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { page },
      queryParamsHandling: 'merge',
    });
  }



}
