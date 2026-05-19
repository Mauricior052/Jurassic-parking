import { Routes } from '@angular/router';
import { authGuard } from './guards/auth-guard';
import { Login } from './pages/login/login';
import { Home } from './pages/home/home';
import { AdminLayout } from './components/layout/admin-layout/admin-layout';
import { Users } from './pages/users/users';
import { MapsComponent } from './pages/maps/maps';
import { Records } from './pages/records/records';
import { History } from './pages/history/history';
import { ParkingComponent } from './pages/parking/parking';
import { Reservation } from './pages/reservation/reservation';
import { Reservations } from './pages/reservations/reservations';

export const routes: Routes = [
    { path: 'login', component: Login, title: 'Login' },
    {
        path: '',
        canActivate: [authGuard],
        component: AdminLayout,
        children: [
            { path: '', component: Home, title: 'Home' },
            { path: 'map', component: MapsComponent, title: 'Mapa' },
            { path: 'entries', component: Records, title: 'Entradas' },
            { path: 'history', component: History, title: 'Historial' },
            { path: 'parking', component: ParkingComponent, title: 'Estacionamientos' },
            { path: 'users', component: Users, title: 'Usuarios' },
            { path: 'reservations', component: Reservations, title: 'Reservaciones' },
            { path: 'reservation/:parking', component: Reservation, title: 'Reserva' }
        ]
    },
];
