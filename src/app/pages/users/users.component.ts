import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgFor, NgIf, NgClass } from '@angular/common'; // ✅ Added NgClass
import { UserService, AppUser } from '../../services/user.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [FormsModule, NgFor, NgIf, NgClass], // ✅ Added NgClass here too
  templateUrl: './users.component.html'
})
export class UsersComponent {
  list: AppUser[] = [];
  form = { username: '', email: '' };

  constructor(private users: UserService, public auth: AuthService) {
    this.refresh();
  }

  /** Load all users, filtered by current user's role */
  refresh() {
    const all = this.users.list() || [];
    const role = this.auth.role();
    const currentUser = this.auth.username();

    if (!role || !currentUser) {
      this.list = [];
      return;
    }

    switch (role) {
      case 'super-admin':
      case 'group-admin':
        this.list = all;
        break;
      case 'user':
        this.list = all.filter(
          u => u.username.trim().toLowerCase() === currentUser
        );
        break;
      default:
        this.list = [];
    }
  }

  /** Create new user */
  add() {
    const username = this.form.username.trim();
    const email = this.form.email.trim();

    if (!username || !email) {
      alert('Please enter both username and email.');
      return;
    }

    try {
      this.users.create(username, email);
      this.form = { username: '', email: '' };
      this.refresh();
    } catch (e: any) {
      alert(e.message);
    }
  }

  /** Check if the current user can delete a target user */
  canDelete(user: AppUser): boolean {
    const role = this.auth.role();
    const currentUser = this.auth.username();

    if (role === 'super-admin') return true; // can delete anyone
    if (role === 'group-admin' && user.roles?.includes('user')) return true; // can delete regular users
    if (role === 'user' && user.username === currentUser) return true; // can delete self
    return false;
  }

  /** Remove user (with confirmation) */
  remove(username: string) {
    const current = this.auth.username();
    if (!confirm(`Are you sure you want to delete "${username}"?`)) return;

    this.users.delete(username);

    if (username === current) {
      this.auth.logout();
      window.location.href = '/login';
    } else {
      this.refresh();
    }
  }

  /** Promote a user to Group Admin */
  promoteToGroupAdmin(user: AppUser) {
    if (!confirm(`Promote ${user.username} to Group Admin?`)) return;

    const target = this.users.findByUsername(user.username);
    if (!target) return;

    if (!target.roles.includes('group-admin')) {
      target.roles.push('group-admin');
      this.users.update(target);
      alert(`${user.username} is now a Group Admin.`);
      this.refresh();
    }
  }

  /** Promote a user to Super Admin */
  promoteToSuperAdmin(user: AppUser) {
    if (!confirm(`Promote ${user.username} to Super Admin?`)) return;

    const target = this.users.findByUsername(user.username);
    if (!target) return;

    if (!target.roles.includes('super-admin')) {
      target.roles.push('super-admin');
      this.users.update(target);
      alert(`${user.username} is now a Super Admin.`);
      this.refresh();
    }
  }
}
