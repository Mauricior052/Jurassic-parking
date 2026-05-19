import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { environment } from '../../environments/environment';
import { VehicleModel } from '../models/vehicle';

const base_url = environment.base_url;

@Injectable({
  providedIn: 'root',
})
export class VehicleService {
  private http = inject(HttpClient);

  public vehicles = signal<VehicleModel[]>([]);

  get headers() {
    return {
      headers: new HttpHeaders({
        'token': localStorage.getItem('token') || ''
      })
    };
  }

  getAll() {
    return this.http.get(`${base_url}/vehicle`, this.headers);
  }

  getById(id: string) {
    return this.http.get(`${base_url}/vehicles/${id}`, this.headers);
  }

  getByUser() {
    return this.http.get(`${base_url}/vehicles/user`, this.headers);
  }

  createVehicle(vehicle: VehicleModel) {
    return this.http.post(`${base_url}/vehicles`, vehicle, this.headers);
  }

  updateVehicle(vehicle: VehicleModel) {
    return this.http.put(`${base_url}/vehicles/${vehicle.id}`, vehicle, this.headers);
  }

  deleteVehicle(id: string) {
    return this.http.delete(`${base_url}/vehicles/${id}`, this.headers);
  }
}
