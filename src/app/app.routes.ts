// ============================================================
// 🧭 Application Routes
// ------------------------------------------------------------
// Defines all main navigation paths and applies authentication
// guards where needed.
// ============================================================

import { Routes } from '@angular/router';
import { ShellComponent } from './layout/shell.component';
import { authGuard } from './guards/auth.guard';
import { LoginComponent } from './pages/login/login.component';
import { HomeComponent } from './pages/home/home.component';
import { UsersComponent } from './pages/users/users.component';
import { GroupsComponent } from './pages/groups/groups.component';
import { ProfileComponent } from './pages/profile/profile.component';
import { VideosComponent } from './pages/video/videos.component';

// 🗺️ Route configuration
export const routes: Routes = [
  // Public login route
  { path: 'login', component: LoginComponent },

  // Protected shell layout (requires auth)
  {
    path: '',
    component: ShellComponent,
    canActivate: [authGuard],
    children: [
      { path: '', redirectTo: 'home', pathMatch: 'full' },
      { path: 'home', component: HomeComponent },
      { path: 'users', component: UsersComponent },
      { path: 'groups', component: GroupsComponent, canActivate: [authGuard] },
      { path: 'profile', component: ProfileComponent },
      { path: 'video', component: VideosComponent },
    ],
  },

  // Fallback: redirect unknown paths to login
  { path: '**', redirectTo: 'login' },
];
