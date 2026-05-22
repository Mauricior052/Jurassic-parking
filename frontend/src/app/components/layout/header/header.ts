import { Component, inject } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { NgIcon } from '@ng-icons/core';
import { UserService } from '../../../services/user-service';
import { Router, RouterLink } from '@angular/router';
import { ThemeService } from '../../../services/theme-service';
import { ParkingService } from '../../../services/parking-service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-header',
  imports: [FormsModule, AsyncPipe, NgIcon, RouterLink],
  templateUrl: './header.html',
  styleUrl: './header.css',
})

export class Header {
  public userService = inject(UserService);
  public themeService = inject(ThemeService);
  public parkingService = inject(ParkingService);
  private router = inject(Router);

  public user$ = this.userService.usuario$;
  public usuario = this.userService.usuario;
  isMenuOpen = false;

  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
  }

  logout() {
    this.userService.logout();
    this.router.navigateByUrl('/login');
  }
}
