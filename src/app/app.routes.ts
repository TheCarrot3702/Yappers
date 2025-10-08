import { Routes } from '@angular/router';
import { ShellComponent } from './layout/shell.component';
import { authGuard } from './guards/auth.guard';
import { LoginComponent } from './pages/login/login.component';
import { HomeComponent } from './pages/home/home.component';
import { UsersComponent } from './pages/users/users.component';
import { GroupsComponent } from './pages/groups/groups.component';
import { ProfileComponent } from './pages/profile/profile.component';
import { VideosComponent } from './pages/video/videos.component';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },

  {
    path: '',
    component: ShellComponent,
    canActivate: [authGuard],
    children: [
      { path: '', redirectTo: 'home', pathMatch: 'full' },
      { path: 'home', component: HomeComponent },
      { path: 'users', component: UsersComponent },
      { path: 'groups',  component: GroupsComponent, canActivate: [authGuard] },
      { path: 'profile', component: ProfileComponent },
      { path: 'video', component: VideosComponent },
    ]
  },

  { path: '**', redirectTo: 'login' }
];
