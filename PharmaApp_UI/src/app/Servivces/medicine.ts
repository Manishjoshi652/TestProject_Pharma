import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class MedicineService {
  private apiUrl = 'http://localhost:5273/api/Medicines';

  constructor(private http: HttpClient) {}

  getMedicines() {
    const headers = new HttpHeaders({
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    });
    
    // Add timestamp to URL to bypass browser cache
    const timestamp = new Date().getTime();
    return this.http.get<any[]>(
      `${this.apiUrl}/GetMedicines?_t=${timestamp}`,
      { headers }
    );
  }

  addMedicine(medicine: any) {
    return this.http.post(this.apiUrl+"/AddMedicine", medicine);
  }
}