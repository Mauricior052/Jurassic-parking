import { HttpClient, HttpHeaders } from '@angular/common/http';
import { effect, inject, Injectable, signal } from '@angular/core';
import { environment } from '../../environments/environment.prod';

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
}
