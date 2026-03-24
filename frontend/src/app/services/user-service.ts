import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { BehaviorSubject, catchError, map, of, tap } from 'rxjs';

import { environment } from '../../environments/environment';
import { User } from '../models/user';

const base_url = environment.base_url;

interface UsersResponse {
  users: User[];
  total: number;
}

@Injectable({
  providedIn: 'root',
})
export class UserService {

  private http = inject(HttpClient);
  
  private usuarioSubject = new BehaviorSubject<User | null>(null);
  public usuario$ = this.usuarioSubject.asObservable();

  get usuario(): User | null {
    return this.usuarioSubject.value;
  }

  setUsuario(usuario: User) {
    this.usuarioSubject.next(usuario);
  }

  get headers() {
    return {
      headers: new HttpHeaders({
        'token': localStorage.getItem('token') || ''
      })
    };
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

  register(credentials: { name: string; email: string; password: string }) {
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

  validateToken() {
    const token = localStorage.getItem('token');

    if (!token)  return of(false);

    return this.http.get(`${base_url}/login/renew`, this.headers).pipe(
      map((resp: any) => {
        this.usuarioSubject.next(this.createObject(resp.user));
        this.guardarLocalStorage(resp.token, resp.menu)
        return true;
      }),
      catchError(() => of(false))
    )
  }

  getUsers() {
    return this.http.get<UsersResponse>(`${base_url}/users`, this.headers).pipe(
      map(resp => {
        return {
          total: resp.total,
          users: resp.users.map(user => this.createObject(user))
        };
      })
    );
  }

  createUser(user: User) {
    return this.http.post(`${base_url}/users`, user, this.headers);
  }

  updateUser(user: User) {
    return this.http.put(`${base_url}/users/${user.id}`, user, this.headers);
  }

  deleteUser(id: string) {
    return this.http.delete(`${base_url}/users/${id}`, this.headers);
  }

  private createObject(usuario: any): User {
    return {
      id: usuario.id || usuario._id || '',
      name: usuario.name,
      email: usuario.email,
      google: usuario.google,
      role: usuario.role,
      password: ''
    };
  }

  private guardarLocalStorage (token: string, menu: any) {
    localStorage.setItem('token', token);
    localStorage.setItem('menu', JSON.stringify(menu));
  }

}