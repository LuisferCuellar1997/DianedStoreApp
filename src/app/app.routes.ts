import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path:'',
    loadChildren: ()=>import('./products/products.routes').then(m => m.productsRoutes)
  }
];
