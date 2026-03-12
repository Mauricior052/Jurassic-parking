import { Component } from '@angular/core';
import { UserService } from '../../services/user-service';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { toast } from 'ngx-sonner';
import { NgIcon } from '@ng-icons/core';

@Component({
  selector: 'app-login',
  imports: [FormsModule, CommonModule, NgIcon],
  templateUrl: './login.html',
  styleUrl: './login.css',
})

export class Login {

  constructor( private userService: UserService, private router: Router) {}
  
  isActive = false;
  showRegister(){
    this.isActive = true;
  }
  showLogin(){
    this.isActive = false;
  }

  loginData = { email: 'm@gmail.com', password: '1234' };
  registerData = { nombre: 'Juan', email: 'juan@gmail.com', password: '1234' };
  loading = false;

  login() {
    this.loading = true;

    this.userService.login(this.loginData).subscribe({
      next: (res) => {
        this.loading = false;
        toast.success('', { description: 'Login exitoso' });
        // this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.loading = false;
        const msg = err.error.errors?.email?.msg || 'Error en el formulario';
        toast.error('Error', { description: msg });
        console.log(err)
      }
    });
  }

  register() {
    this.loading = true;

    this.userService.register(this.registerData).subscribe({
      next: (res) => {
        this.loading = false;
        toast.success('Usuario creado', { description: 'El registro se completó correctamente.' });
        // this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.loading = false;
        const msg = err.error.errors?.email?.msg || 'Error en el formulario';
        toast.error('Error', { description: msg });
        console.log(err.error.errors)
      }
    });
  }

}
