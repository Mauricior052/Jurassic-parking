import { HttpClient, HttpHeaders } from '@angular/common/http';
import { effect, inject, Injectable, signal } from '@angular/core';
import { environment } from '../../environments/environment.prod';
import { Parking } from '../models/parking';

const base_url = environment.base_url;

@Injectable({
  providedIn: 'root',
})
export class ParkingService {
  private http = inject(HttpClient);

  public selectedParkingId = signal<string>(localStorage.getItem('parking') || '');

  constructor() {
    effect(() => {
      localStorage.setItem('parking', this.selectedParkingId());
    });
  }

  setParking(id: string) {
    this.selectedParkingId.set(id);
  }

  get headers() {
    return {
      headers: new HttpHeaders({
        'token': localStorage.getItem('token') || ''
      })
    };
  }

  getAll() {
    return this.http.get(`${base_url}/parking`, this.headers);
  }

  createParking(parking: Parking) {
    return this.http.post(`${base_url}/parking`, parking, this.headers);
  }

  updateParking(parking: Parking) {
    return this.http.put(`${base_url}/parking/${parking.id}`, parking, this.headers);
  }

  deleteParking(id: string) {
    return this.http.delete(`${base_url}/parking/${id}`, this.headers);
  }
}
