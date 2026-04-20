import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./Component/medicine-list/medicine-list').then(m => m.MedicineList)
  },
  {
    path: 'add',
    loadComponent: () => import('./Component/add-medicine/add-medicine').then(m => m.AddMedicine)
  }
];
