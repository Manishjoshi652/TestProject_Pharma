import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, NavigationEnd, Router } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { MedicineService } from '../../Servivces/medicine';
import { Subject } from 'rxjs';
import { takeUntil, filter } from 'rxjs/operators';

@Component({
  standalone: true,
  selector: 'app-medicine-list',
  imports: [CommonModule, FormsModule, RouterLink, HttpClientModule],
  providers: [MedicineService],
  templateUrl: './medicine-list.html',
  styleUrl: './medicine-list.css',
})
export class MedicineList implements OnInit, OnDestroy {
  medicines: any[] = [];
  searchText = '';
  sortColumn: string = '';
  sortDirection: 'asc' | 'desc' = 'asc';
  isLoading: boolean = false;
  errorMessage: string = '';
  
  // Pagination properties
  currentPage: number = 1;
  itemsPerPage: number = 10;
  totalPages: number = 1;
  
  private destroy$ = new Subject<void>();

  constructor(private service: MedicineService, private router: Router, private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    // Ensure component is fully initialized before loading data
    setTimeout(() => {
      this.loadData();
    }, 0);
    
    // Reload data when navigating back to this component
    this.router.events
      .pipe(
        filter(event => event instanceof NavigationEnd),
        filter((event: any) => event.urlAfterRedirects === '/'),
        takeUntil(this.destroy$)
      )
      .subscribe(() => {
        this.loadData();
      });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadData() {
    this.isLoading = true;
    this.errorMessage = '';
    this.service.getMedicines()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          this.medicines = res;
          this.isLoading = false;
          this.cdr.detectChanges(); // Force change detection
        },
        error: (err) => {
          this.isLoading = false;
          this.errorMessage = 'Failed to load medicines. Please try again.';
          console.error('Error loading medicines:', err);
          this.cdr.detectChanges(); // Force change detection
        }
      });
  }

  sortData(column: string) {
    if (this.sortColumn === column) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortColumn = column;
      this.sortDirection = 'asc';
    }
  }

  get filteredMedicines() {
    const term = this.searchText?.toLowerCase().trim();
    let filtered = this.medicines;

    if (term) {
      filtered = filtered.filter(med => {
        const name = med.fullName?.toLowerCase() ?? '';
        const brand = med.brand?.toLowerCase() ?? '';
        return name.includes(term) || brand.includes(term);
      });
    }

    if (this.sortColumn) {
      filtered = [...filtered].sort((a, b) => {
        let aVal = a[this.sortColumn];
        let bVal = b[this.sortColumn];

        if (aVal == null) aVal = '';
        if (bVal == null) bVal = '';

        if (typeof aVal === 'string') {
          aVal = aVal.toLowerCase();
          bVal = bVal.toLowerCase();
        }

        let comparison = 0;
        if (aVal > bVal) {
          comparison = 1;
        } else if (aVal < bVal) {
          comparison = -1;
        }

        return this.sortDirection === 'asc' ? comparison : -comparison;
      });
    }

    // Calculate total pages
    this.totalPages = Math.ceil(filtered.length / this.itemsPerPage);
    
    // Ensure current page is valid
    if (this.currentPage > this.totalPages && this.totalPages > 0) {
      this.currentPage = this.totalPages;
    } else if (this.currentPage < 1) {
      this.currentPage = 1;
    }

    // Return paginated results
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    return filtered.slice(startIndex, endIndex);
  }

  getRowClass(med: any) {
    const today = new Date();
    const expiry = new Date(med.expiryDate);
    const diffDays = (expiry.getTime() - today.getTime()) / (1000 * 3600 * 24);

    if (diffDays < 30) return 'bg-danger';
    if (med.quantity < 10) return 'bg-warning';
    return '';
  }

  getSortIndicator(column: string): string {
    if (this.sortColumn !== column) return '';
    return this.sortDirection === 'asc' ? '▲' : '▼';
  }

  onSearchChange() {
    // Force change detection when search text changes
    this.cdr.detectChanges();
  }
}