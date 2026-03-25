import { AfterViewInit, Component, ElementRef, inject, NgZone, PLATFORM_ID, signal, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { isPlatformBrowser, NgClass } from '@angular/common';
import { toast } from 'ngx-sonner';
import { NgIcon } from '@ng-icons/core';
import { UserService } from '../../services/user-service';
import { environment } from '../../../environments/environment';

declare const google: any;
let isGoogleInitialized = false;

@Component({
  selector: 'app-login',
  imports: [FormsModule, NgClass, NgIcon],
  templateUrl: './login.html',
  styleUrl: './login.css',
})

export class Login implements AfterViewInit {
  private userService = inject(UserService);
  private router = inject(Router);
  private ngZone = inject(NgZone); 
  private platformId = inject(PLATFORM_ID);

  @ViewChild('googleLoginBtn', { static: false }) googleLoginBtn!: ElementRef;
  @ViewChild('googleRegisterBtn', { static: false }) googleRegisterBtn!: ElementRef;
  
  loading = signal(false);
  isActive = signal(false);
  
  async ngAfterViewInit() {
    try {
      await this.loadScript('https://accounts.google.com/gsi/client');
      this.googleInit();
    } catch (error) {
      toast.error('Error al cargar el módulo de Google');
      console.error('Script load error:', error);
    }
  }

  loginData = { 
    email: localStorage.getItem('email') || 'm@gmail.com', 
    password: '1234', 
    rememberMe: !!localStorage.getItem('email') 
  };
  
  registerData = { 
    name: '', 
    email: '', 
    password: '' 
  };

  googleInit() {
    if (isGoogleInitialized) {
      this.googleButtons();
      return;
    }
    google.accounts.id.initialize({
      client_id: environment.client_id,
      callback: (response: any) => this.handleCredentialResponse(response)
    });

    this.googleButtons();
    isGoogleInitialized = true;
  }

  showRegister() {
    this.isActive.set(true);
  }

  showLogin() {
    this.isActive.set(false);
  }

  handleCredentialResponse(response: any) {
    if (this.loading()) return;
    this.loading.set(true);

    this.ngZone.run(() => {
      this.userService.loginGoogle(response.credential).subscribe({
        next: () => {
          this.loading.set(false);
          toast.success('Login con google exitoso');
          this.router.navigateByUrl('/');
        },
        error: (err) => {
          this.loading.set(false);
          toast.error('Error de autenticación');
        }
      });
    });
  }

  login() {
    if (this.loading()) return;
    this.loading.set(true);

    this.userService.login(this.loginData).subscribe({
      next: () => {
        this.loading.set(false);
        if (this.loginData.rememberMe) localStorage.setItem('email', this.loginData.email);
        else localStorage.removeItem('email');

        toast.success('Login exitoso');
        this.router.navigateByUrl('/');
      },
      error: (err) => {
        this.loading.set(false);
        const msg = err.error.msg || err.error.errors?.email?.msg || 'Error en el formulario';
        toast.error('Error', { description: msg });
        console.log(err)
      }
    });
  }

  register() {
    if (this.loading()) return;
    this.loading.set(true);

    this.userService.register(this.registerData).subscribe({
      next: (res) => {
        this.loading.set(false);
        toast.success('Registro exitoso');
        this.router.navigateByUrl('/');
      },
      error: (err) => {
        this.loading.set(false);
        const msg = err.error.msg || err.error.errors?.email?.msg || 'Error en el formulario';
        toast.error('Error', { description: msg });
        console.log(err.error)
      }
    });
  }

  googleButtons() {
    google.accounts.id.renderButton(
      this.googleRegisterBtn.nativeElement,
      { type: "icon", theme: "outline", size: "large", shape: "circle" }
    );

    google.accounts.id.renderButton(
      this.googleLoginBtn.nativeElement,
      { type: "icon", theme: "outline", size: "large", shape: "circle" }
    );
  }


  private scripts: any = {};
  loadScript(src: string): Promise<void> {
    if (!isPlatformBrowser(this.platformId)) {
      return Promise.resolve();
    }

    if (this.scripts[src]) {
      return this.scripts[src];
    }

    this.scripts[src] = new Promise<void>((resolve, reject) => {
      const script = document.createElement('script');
      script.type = 'text/javascript';
      script.src = src;
      script.async = true;
      script.defer = true;
      
      script.onload = () => {
        resolve();
      };

      script.onerror = (error: any) => {
        reject(error);
      };

      document.getElementsByTagName('head')[0].appendChild(script);
    });

    return this.scripts[src];
  }
}
