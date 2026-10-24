import { Routes } from '@angular/router';
import { StorefrontComponent } from './storefront.component';
import { AdminComponent } from './admin.component';

export const routes: Routes = [
  { path: 'admin', component: AdminComponent },
  { path: '', component: StorefrontComponent },
  { path: '**', redirectTo: '' }
];
