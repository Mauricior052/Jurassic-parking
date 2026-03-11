import { Component } from '@angular/core';
import { UserService } from '../../services/user-service';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-login',
  imports: [FormsModule],
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

  loginData = { email: '', password: '' };
  registerData = { name: '', email: '', password: '' };

  login() {
    this.userService.login(this.loginData).subscribe({
      next: (res) => {
        alert('Login exitoso');
        // this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        alert('Error en las credenciales');
        console.log(err)
      }
    });
  }

  register() {
    this.userService.register(this.registerData).subscribe({
      next: (res) => {
        alert('Registro exitoso');
        // this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        alert('Error en las credenciales');
        console.log(err)
      }
    });
  }

}
