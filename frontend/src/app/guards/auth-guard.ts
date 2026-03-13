import { CanActivateFn, CanMatchFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { UserService } from '../services/user-service';
import { map } from 'rxjs';

export const canMatch: CanMatchFn = () => {
  const router = inject(Router);

  return inject(UserService).validateToken().pipe(
    map(isAuthenticated => {
      return isAuthenticated ? true : router.parseUrl('/login');
    })
  );
};

export const authGuard: CanActivateFn = () => {
  const userService = inject(UserService);
  const router = inject(Router);

  return userService.validateToken().pipe(
    map(isAuthenticated => {
      return isAuthenticated ? true : router.parseUrl('/login');
    })
  );
};
