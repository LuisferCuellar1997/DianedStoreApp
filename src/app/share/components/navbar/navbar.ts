import { Component, output, signal } from '@angular/core';
import { RightNavbar } from '../right-navbar/right-navbar';
import { SearchBar } from '../search-bar/search-bar';
import { ProductFilters } from '../../../products/interfaces/product.interface';

@Component({
  selector: 'app-navbar',
  imports: [RightNavbar, SearchBar],
  templateUrl: './navbar.html',
})
export class Navbar {

  searchChange = output<string>();
  filtersChange = output<Partial<ProductFilters>>();
  search(value:string){
    this.searchChange.emit(value);
  }

  onFiltersChange(filters: Partial<ProductFilters>) {
    console.log('🟠 Navbar recibe filtros:', filters);
    this.filtersChange.emit(filters);
  }
 }
