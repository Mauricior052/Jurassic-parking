import { AfterViewInit, Component, ElementRef, inject, NgZone, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { toast } from 'ngx-sonner';
import { NgIcon } from '@ng-icons/core';
import { UserService } from '../../services/user-service';

declare const google: any;

@Component({
  selector: 'app-login',
  imports: [FormsModule, CommonModule, NgIcon],
  templateUrl: './login.html',
  styleUrl: './login.css',
})

export class Login implements AfterViewInit {
  private userService = inject(UserService);
  private router = inject(Router);
  private ngZone = inject(NgZone); 

  @ViewChild('googleLoginBtn', { static: false }) googleLoginBtn!: ElementRef;
  @ViewChild('googleRegisterBtn', { static: false }) googleRegisterBtn!: ElementRef;

  loginData = { email: localStorage.getItem('email') || 'm@gmail.com', password: '1234', rememberMe: !!localStorage.getItem('email') };
  registerData = { nombre: 'Juan', email: 'juan@gmail.com', password: '1234' };
  loading = false;
  isActive = false;
  
  ngAfterViewInit(): void {
    this.googleInit();
  }


  googleInit() {
    if (typeof google === 'undefined') {
      setTimeout(() => this.googleInit(), 100);
      return;
    }

    try {
      google.accounts.id.initialize({
        client_id: "886871992771-peo1cq8l376htch5obf47coce16o9ue0.apps.googleusercontent.com",
        callback: (response: any) => this.handleCredentialResponse(response)
      });
    } catch (e) {}

    google.accounts.id.renderButton(
      this.googleRegisterBtn.nativeElement,
      { type: "icon", theme: "outline", size: "large", shape: "circle" }
    );

    google.accounts.id.renderButton(
      this.googleLoginBtn.nativeElement,
      { type: "icon", theme: "outline", size: "large", shape: "circle" }
    );
  }

  showRegister(){
    this.isActive = true;
  }
  showLogin(){
    this.isActive = false;
  }

  handleCredentialResponse(response: any) {
    if (this.loading) return;
    this.loading = true;

    this.ngZone.run(() => {
      this.userService.loginGoogle(response.credential).subscribe({
        next: () => {
          this.loading = false;
          toast.success('Login con google exitoso');
          this.router.navigateByUrl('/');
        },
        error: (err) => {
          this.loading = false;
          toast.error('Error de autenticación');
        }
      });
    });
  }

  login() {
    if (this.loading) return;
    this.loading = true;

    this.userService.login(this.loginData).subscribe({
      next: (res) => {
        this.loading = false;
        if (this.loginData.rememberMe) {
          localStorage.setItem('email', this.loginData.email);
        } else {
          localStorage.removeItem('email');
        }
        toast.success('Login exitoso');
        this.router.navigateByUrl('/');
      },
      error: (err) => {
        this.loading = false;
        const msg = err.error.msg || err.error.errors?.email?.msg || 'Error en el formulario';
        toast.error('Error', { description: msg });
        console.log(err)
      }
    });
  }

  register() {
    if (this.loading) return;
    this.loading = true;

    this.userService.register(this.registerData).subscribe({
      next: (res) => {
        this.loading = false;
        toast.success('Registro exitoso');
        this.router.navigateByUrl('/');
      },
      error: (err) => {
        this.loading = false;
        const msg = err.error.msg || err.error.errors?.email?.msg || 'Error en el formulario';
        toast.error('Error', { description: msg });
        console.log(err.error.errors)
      }
    });
  }
}
