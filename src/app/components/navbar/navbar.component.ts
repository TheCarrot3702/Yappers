// ============================================================
// 🧭 Navbar Component
// ------------------------------------------------------------
// Displays navigation links and login/logout options based on
// the user’s authentication state and role.
// ============================================================

import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule, NgIf } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, NgIf],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit, OnDestroy {
  isLoggedIn = false;
  role: string | null = null;
  private sub?: Subscription;

  constructor(public auth: AuthService, private router: Router) {}

  // Subscribe to auth state changes
  ngOnInit() {
    this.sub = this.auth.session$.subscribe(session => {
      this.isLoggedIn = !!session;
      this.role = session?.role ?? null;
    });
  }

  // Log out user and redirect to login page
  logout() {
    this.auth.logout();
    this.router.navigate(['/login']);
  }

  // Prevent memory leaks
  ngOnDestroy() {
    this.sub?.unsubscribe();
  }
}
