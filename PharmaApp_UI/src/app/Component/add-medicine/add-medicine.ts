
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { MedicineService } from '../../Servivces/medicine';

@Component({
  standalone: true,
  selector: 'app-add-medicine',
  imports: [CommonModule, FormsModule, HttpClientModule],
  providers: [MedicineService],
  templateUrl: './add-medicine.html',
  styleUrl: './add-medicine.css',
})
export class AddMedicine {
  medicine: any = {};
  isSubmitting = false;

  constructor(private service: MedicineService, private router: Router) {}

  save() {
    if (this.isFormValid()) {
      this.isSubmitting = true;
      this.service.addMedicine(this.medicine).subscribe({
        next: () => {
          alert('Medicine added successfully!');
          this.router.navigate(['/']);
        },
        error: (error) => {
          console.error('Error saving medicine:', error);
          alert('Error saving medicine. Please try again.');
          this.isSubmitting = false;
        }
      });
    }
  }

  isFormValid(): boolean {
    return !!(
      this.medicine.fullName?.trim() &&
      this.medicine.quantity > 0 &&
      this.medicine.price >= 0
    );
  }

  goBack() {
    this.router.navigate(['/']);
  }
}