import { Injectable } from '@angular/core';
import { Jean, ProductFilters } from '../interfaces/product.interface';
import { filter } from 'rxjs';

@Injectable({providedIn: 'root'})
export class FilterService {

  filterProducts(products:Jean[], filters:ProductFilters):Jean[]{
    filters.description=filters.description?.map(x=>x.toLowerCase());
    return products.filter(p => {
      if (filters.search) {
        const term = filters.search.toLowerCase();
        const matchDescription = p.description?.toLowerCase().includes(term);
        const matchReference = p.reference?.toLowerCase().includes(term);
        if (!matchDescription && !matchReference) {
          return false;
        }
      }
      if (filters.gender.length && !filters.gender.includes(p.gender)) return false;
      if (filters.category.length && !filters.category.includes(p.category)) return false;
      if (filters.brand.length && !filters.brand.includes(p.brand)) return false;
      if (filters.maxPrice !== null && p.price > filters.maxPrice) return false;
      if (filters.description && !filters.description.includes(p.description.toLowerCase())) return false;
      return true;
    });
  }
}
