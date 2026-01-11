import { Routes } from '@angular/router';
import { Home } from './pages/home/home';
import { ProductDetail } from './pages/product-detail/product-detail';
import { ShoppingCart } from '../shopping/pages/shopping-cart/shopping-cart';

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
    path:'cart',
    component:ShoppingCart
  },
  {
    path: '**',
    redirectTo: 'products',
  },
];
