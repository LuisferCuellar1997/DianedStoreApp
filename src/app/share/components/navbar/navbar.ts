import { Component, input, output, signal } from '@angular/core';
import { RightNavbar } from '../right-navbar/right-navbar';
import { SearchBar } from '../search-bar/search-bar';
import { ProductFilters } from '../../../products/interfaces/product.interface';
import { ShopButton } from '../shop-button/shop-button';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-navbar',
  imports: [RightNavbar, SearchBar, ShopButton, RouterLink],
  templateUrl: './navbar.html',
})
export class Navbar {

  searchChange = output<string>();
  filtersChange = output<Partial<ProductFilters>>();
  showFilters=input<boolean>(true);
  showSearchbar=input<boolean>(true);
  showShoppingBag=input<boolean>(true);
  showProfile=input<boolean>(true)
  search(value:string){
    this.searchChange.emit(value);
  }

  onFiltersChange(filters: Partial<ProductFilters>) {
    this.filtersChange.emit(filters);
  }
 }
