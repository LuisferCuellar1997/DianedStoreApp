import { Routes } from '@angular/router';
import { ShoppingCart } from './shopping/pages/shopping-cart/shopping-cart';

export const routes: Routes = [
  {
    path:'',
    loadChildren: ()=>import('./products/products.routes').then(m => m.productsRoutes)
  },
  {
    path:'**',
    redirectTo:''
  }
];
