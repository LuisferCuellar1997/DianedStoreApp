import { Routes } from '@angular/router';
import { Home } from './pages/home/home';
import { ProductDetail } from './pages/product-detail/product-detail';

export const productsRoutes: Routes = [
  {
    path: 'products',
    component: Home,
  },
  {
    path:'products/:id',
    component:ProductDetail
  },
  {
    path: '**',
    redirectTo: 'products',
  },
];
