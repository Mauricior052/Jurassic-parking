import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { BehaviorSubject, catchError, map, of, tap } from 'rxjs';

import { environment } from '../../environments/environment';
import { User } from '../models/user';

const base_url = environment.base_url;

@Injectable({
  providedIn: 'root',
})
export class UserService {

  private http = inject(HttpClient);
  
  private usuarioSubject = new BehaviorSubject<User | null>(null);
  public usuario$ = this.usuarioSubject.asObservable();


  setUsuario(usuario: User) {
    this.usuarioSubject.next(usuario);
  }

  get usuario(): User | null {
    return this.usuarioSubject.value;
  }

  get headers() {
    return {
      headers: { 'token': localStorage.getItem('token') || '' }
    }
  }

  login(credentials: { email: string; password: string }) {
    return this.http.post(`${base_url}/login`, credentials).pipe(
      tap((resp: any) => {
        this.guardarLocalStorage(resp.token, resp.menu);
      })
    );
  }

  loginGoogle (token: string) {
    return this.http.post(`${base_url}/login/google`, { token })
      .pipe(tap((resp: any) => {
        this.guardarLocalStorage(resp.token, resp.menu)
      }));
  }

  register(credentials: { nombre: string; email: string; password: string }) {
    return this.http.post(`${base_url}/users`, credentials).pipe(
      tap((resp: any) => {
        this.guardarLocalStorage(resp.token, resp.menu);
      })
    );
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('menu');
    this.usuarioSubject.next(null);
  }

  guardarLocalStorage (token: string, menu: any) {
    localStorage.setItem('token', token);
    localStorage.setItem('menu', JSON.stringify(menu));
  }

  validateToken() {
    const token = localStorage.getItem('token');

    if (!token) {
      return of(false);
    }

    return this.http.get(`${base_url}/login/renew`, this.headers).pipe(
      map((resp: any) => {
        const { email, google, nombre, role, id } = resp.usuario;
        const usuario = new User(nombre, email, '', google, role, id);
        this.usuarioSubject.next(usuario);

        this.guardarLocalStorage(resp.token, resp.menu)
        return true;
      }),
      catchError(() => of(false))
    )
  }
}
