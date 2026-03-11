import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { tap } from 'rxjs';

import { environment } from '../../environments/environment';

const base_url = environment.base_url;

@Injectable({
  providedIn: 'root',
})
export class UserService {

  constructor(private http: HttpClient) {}

  login(credentials: { email: string; password: string }) {
    return this.http.post(`${base_url}/login`, credentials).pipe(
      tap((resp: any) => {
        this.guardarLocalStorage(resp.token, resp.menu);
      })
    );
  }

  register(credentials: { name: string, email: string; password: string }) {
    return this.http.post(`${base_url}/usuarios`, credentials)
      .pipe(tap((resp: any) => {
        this.guardarLocalStorage(resp.token, resp.menu)
      }));
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('menu');
  }

  guardarLocalStorage (token: string, menu: any) {
    localStorage.setItem('token', token);
    localStorage.setItem('menu', JSON.stringify(menu));
  }
}
