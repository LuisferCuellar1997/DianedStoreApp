import { Routes } from '@angular/router';
import { Home } from './pages/home/home';

export const productsRoutes: Routes = [
  {
    path: '',
    component: Home,
  },
  {
    path: '**',
    redirectTo: '',
  },
];
