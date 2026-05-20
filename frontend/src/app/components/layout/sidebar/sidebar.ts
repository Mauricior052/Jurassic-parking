import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { NgIcon } from '@ng-icons/core';
import { UserService } from '../../../services/user-service';

@Component({
  selector: 'app-sidebar',
  imports: [CommonModule, RouterLink, RouterLinkActive, NgIcon],
  templateUrl: './sidebar.html',
})
export class Sidebar {
  private userService = inject(UserService);
  isCollapsed = true;

  private allLinks = [
    { label: 'Dashboard', icon: 'lucideLayoutDashboard', link: '/', roles: ['ADMIN'] },
    { label: 'Mapa', icon: 'lucideMap', link: '/map', roles: ['ADMIN', 'CLIENT'] },
    { label: 'Reservas', icon: 'lucideCalendar', link: '/reservations', roles: ['ADMIN', 'CLIENT'] },
    { label: 'Entradas/Salidas', icon: 'LucideArrowLeftRight', link: '/entries', roles: ['ADMIN'] },
    { label: 'Historial', icon: 'LucideHistory', link: '/history', roles: ['ADMIN'] },
    { label: 'Estacionamientos', icon: 'LucideParkingSquare', link: '/parking', roles: ['ADMIN'] },
    { label: 'Usuarios', icon: 'lucideUsers', link: '/users', roles: ['ADMIN'] },
  ];

  get links() {
    const currentRole = this.userService.usuario?.role.toUpperCase();
    if (!currentRole) return [];

    return this.allLinks.filter(link => link.roles.includes(currentRole));
  }

  
  toggleSidebar() {
    this.isCollapsed = !this.isCollapsed;
  }
}
