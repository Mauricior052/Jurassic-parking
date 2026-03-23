import { Routes } from '@angular/router';

import { authGuard } from './guards/auth-guard';
import { Login } from './pages/login/login';
import { Home } from './pages/home/home';
import { AdminLayout } from './components/layout/admin-layout/admin-layout';
import { Users } from './pages/users/users';
import { MapComponent } from './pages/map/map';

export const routes: Routes = [
    { path: 'login', component: Login, title: 'Login' },
    {
        path: '',
        canActivate: [authGuard],
        component: AdminLayout,
        children: [
            { path: '', component: Home, title: 'Home' },
            { path: 'map', component: MapComponent, title: 'Map' },
            { path: 'users', component: Users, title: 'Users' }
        ]
    },
];
