import { Routes } from '@angular/router';
import { Home } from './pages/home/home';
import { ProductDetail } from './pages/product-detail/product-detail';

export const productsRoutes: Routes = [
  {
    path: '',
    component: Home,
  },
  {
    path:':id',
    component:ProductDetail
  },
  {
    path: '**',
    redirectTo: '',
  },
];
