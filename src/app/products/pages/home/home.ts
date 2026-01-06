import { Component, computed, inject, input, signal } from '@angular/core';
import { Card } from '../../components/card/card';
import { ProductService } from '../../services/products.service';
import { Jean, Product, ProductFilters } from '../../interfaces/product.interface';
import { toSignal } from '@angular/core/rxjs-interop';
import { ProductList } from '../../product-list/product-list';
import { Navbar } from '../../../share/components/navbar/navbar';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [ProductList, Navbar],
  templateUrl: './home.html',
})
export class Home {
  private prodSevice = inject(ProductService);
  prod = toSignal(this.prodSevice.getJeans(), { initialValue: [] as Jean[] });

  filters = signal<ProductFilters>({
    search: '',
    gender: [],
    category: [],
    brand: [],
    maxPrice: null,
  });
filteredProducts = computed(() => {
    const f = this.filters();

    return this.prod().filter(p => {

      if (
        f.search &&
        !p.description.toLowerCase().includes(f.search.toLowerCase())
      ) return false;

      if (
        f.gender.length &&
        !f.gender.includes(p.gender)
      ) return false;

      if (
        f.category.length &&
        !f.category.includes(p.category)
      ) return false;

      if (
        f.brand.length &&
        !f.brand.includes(p.brand)
      ) return false;

      if (
        f.maxPrice !== null &&
        p.price > f.maxPrice
      ) return false;

      return true;
    });
  });

  updateFilters(partial: Partial<ProductFilters>) {
    console.log('🟢 updateFilters llamado con:', partial);
    this.filters.update(current => ({
      ...current,
      ...partial,
    }));
  }
}
