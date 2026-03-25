import { Component, inject } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { NgIcon } from '@ng-icons/core';
import { UserService } from '../../../services/user-service';
import { Router } from '@angular/router';
import { ThemeService } from '../../../services/theme-service';

@Component({
  selector: 'app-header',
  imports: [AsyncPipe, NgIcon],
  templateUrl: './header.html',
  styleUrl: './header.css',
})

export class Header {
  private userService = inject(UserService);
  public themeService = inject(ThemeService);
  private router = inject(Router);

  public user$ = this.userService.usuario$;

  isMenuOpen = false;
  espaciosDisponibles: number = 12;

  goToHome() {
    this.router.navigateByUrl('/');
  }

  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
  }

  logout() {
    this.userService.logout();
    this.router.navigateByUrl('/login');
  }
}
