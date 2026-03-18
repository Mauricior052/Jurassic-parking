import { Routes } from '@angular/router';
import { Login } from './pages/login/login';
import { Home } from './pages/home/home';
import { authGuard } from './guards/auth-guard';
import { AdminLayout } from './components/layout/admin-layout/admin-layout';

export const routes: Routes = [
    { path: 'login', component: Login, title: 'Login' },
    {
        path: '',
        canActivate: [authGuard],
        component: AdminLayout,
        children: [
            { path: '', component: Home, title: 'Home' }
        ]
    },
];
