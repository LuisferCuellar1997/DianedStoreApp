import { Routes } from '@angular/router';
import { Home } from './pages/home/home';
import { ProductDetail } from './pages/product-detail/product-detail';
import { ShoppingCart } from '../shopping/pages/shopping-cart/shopping-cart';
import { DeliveryPage } from '../delivery/pages/delivery-page/delivery-page';
import { MyShops } from '../profile/components/my-shops/my-shops';

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
    path:'checkout',
    component:DeliveryPage
  },
  {
    path:'my-shops',
    component:MyShops
  },
  {
    path: '**',
    redirectTo: 'products',
  },
];
