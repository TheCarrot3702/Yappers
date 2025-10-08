import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService, Role } from '../services/auth.service';

export const authGuard: CanActivateFn = (route) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  if (!auth.isLoggedIn()) { router.navigateByUrl('/login'); return false; }

  const required = route.data?.['roles'] as Role[] | undefined;
  if (required && !required.includes(auth.role()!)) { router.navigateByUrl('/'); return false; }

  return true;
};
