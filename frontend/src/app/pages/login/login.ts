import { AfterViewInit, Component, ElementRef, NgZone, ViewChild } from '@angular/core';
import { UserService } from '../../services/user-service';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { toast } from 'ngx-sonner';
import { NgIcon } from '@ng-icons/core';

declare const google: any;

@Component({
  selector: 'app-login',
  imports: [FormsModule, CommonModule, NgIcon],
  templateUrl: './login.html',
  styleUrl: './login.css',
})

export class Login implements AfterViewInit {

  @ViewChild('googleLoginBtn', { static: false }) googleLoginBtn!: ElementRef;
  @ViewChild('googleRegisterBtn', { static: false }) googleRegisterBtn!: ElementRef;

  loginData = { email: localStorage.getItem('email') || 'm@gmail.com', password: '1234', rememberMe: !!localStorage.getItem('email') };
  registerData = { nombre: 'Juan', email: 'juan@gmail.com', password: '1234' };
  loading = false;

  constructor( private userService: UserService, private router: Router, private ngZone: NgZone) {}

  ngAfterViewInit(): void {
    this.googleInit();
  }
  
  isActive = false;
  showRegister(){
    this.isActive = true;
  }
  showLogin(){
    this.isActive = false;
  }

  googleInit() {
    google.accounts.id.initialize({
      client_id: "886871992771-peo1cq8l376htch5obf47coce16o9ue0.apps.googleusercontent.com",
      callback: (response: any) => this.handleCredentialResponse(response)
    });

    google.accounts.id.renderButton(
      this.googleRegisterBtn.nativeElement,
      { type: "icon", theme: "outline", size: "large", shape: "circle" }
    );

    google.accounts.id.renderButton(
      this.googleLoginBtn.nativeElement,
      { type: "icon", theme: "outline", size: "large", shape: "circle" }
    );
  }

  handleCredentialResponse(response: any) {
    this.loading = true;
    this.ngZone.run(() => {
      this.userService.loginGoogle(response.credential).subscribe({
        next: () => {
          this.loading = false;
          toast.success('Login con google exitoso');
          // this.router.navigateByUrl('/');
        },
        error: (err) => {
          this.loading = false;
          toast.error('Error de autenticación');
        }
      });
    });
  }

  login() {
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
        // this.router.navigate(['/dashboard']);
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
    this.loading = true;

    this.userService.register(this.registerData).subscribe({
      next: (res) => {
        this.loading = false;
        toast.success('Usuario creado', { description: 'El registro se completó correctamente.' });
        // this.router.navigate(['/dashboard']);
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
