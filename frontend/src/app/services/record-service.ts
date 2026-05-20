import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../environments/environment';

const base_url = environment.base_url;

@Injectable({
  providedIn: 'root',
})
export class RecordService {
  private http = inject(HttpClient);

  get headers() {
    return {
      headers: new HttpHeaders({
        'token': localStorage.getItem('token') || ''
      })
    };
  }

  getAll(parking: string) {
    return this.http.get(`${base_url}/records/${parking}`, this.headers);
  }

  getById(id: string) {
    return this.http.get(`${base_url}/records/ticket/${id}`, this.headers);
  }

  getActive(parking: string) {
    return this.http.get(`${base_url}/records/active/${parking}`, this.headers);
  }

  getByUser() {
    return this.http.get(`${base_url}/records/user`, this.headers);
  }

  entry(record: any) {
    return this.http.post(`${base_url}/records/entry`, record, this.headers);
  }

  exit(id: string) {
    return this.http.put(`${base_url}/records/exit/${id}`, {}, this.headers);
  }

  cancel(id: string) {
    return this.http.delete(`${base_url}/records/cancel/${id}`, this.headers);
  }

}
