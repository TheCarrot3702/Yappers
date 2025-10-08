// ============================================================
// Auth Guard
// ------------------------------------------------------------
// Restricts access to routes based on authentication status
// and optional role requirements.
// ============================================================

import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService, Role } from '../services/auth.service';

export const authGuard: CanActivateFn = (route) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  // Block unauthenticated users
  if (!auth.isLoggedIn()) {
    router.navigateByUrl('/login');
    return false;
  }

  // Enforce role-based access if required
  const required = route.data?.['roles'] as Role[] | undefined;
  if (required && !required.includes(auth.role()!)) {
    router.navigateByUrl('/');
    return false;
  }

  return true; // Access granted
};
