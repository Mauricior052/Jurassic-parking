import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { NgIcon } from '@ng-icons/core';

@Component({
  selector: 'app-sidebar',
  imports: [CommonModule, RouterLink, RouterLinkActive, NgIcon],
  templateUrl: './sidebar.html',
})
export class Sidebar {
  isCollapsed = true;

  toggleSidebar() {
    this.isCollapsed = !this.isCollapsed;
  }

  links = [
    { label: 'Dashboard', icon: 'lucideLayoutDashboard', link: '/' },
    { label: 'Entradas/Salidas', icon: 'lucideParkingCircle', link: '/entradas' },
    { label: 'Historial', icon: 'lucideClock', link: '/historial' },
    { label: 'Usuarios', icon: 'lucideUsers', link: '/users' }
  ];
}
