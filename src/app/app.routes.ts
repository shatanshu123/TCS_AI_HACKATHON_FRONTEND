import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { InvoiceListComponent } from './pages/invoice-list/invoice-list.component';
import { InvoiceDetailComponent } from './pages/invoice-detail/invoice-detail.component';
import { BatchUploadComponent } from './pages/batch-upload/batch-upload.component';

export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'invoice-list', component: InvoiceListComponent },
  { path: 'invoice-detail/:id', component: InvoiceDetailComponent },
  { path: 'batch-upload', component: BatchUploadComponent },
  { path: '**', redirectTo: '/login' }
];
