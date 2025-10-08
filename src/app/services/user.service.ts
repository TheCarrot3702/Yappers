import { Injectable } from '@angular/core';
import { Role } from './auth.service';

export interface AppUser {
  id: string;
  username: string;
  email: string;
  roles: Role[];
  groups: string[];
  requestedGroups: string[];
}

@Injectable({ providedIn: 'root' })
export class UserService {
  private key = 'users';

  /** 📦 Load users from localStorage or seed defaults */
  private load(): AppUser[] {
    const raw = localStorage.getItem(this.key);
    if (raw) return JSON.parse(raw);

    // Default seed users
    const seed: AppUser[] = [
      {
        id: crypto.randomUUID(),
        username: 'super',
        email: 'super@example.com',
        roles: ['super-admin'],
        groups: [],
        requestedGroups: []
      },
      {
        id: crypto.randomUUID(),
        username: 'group',
        email: 'group@example.com',
        roles: ['group-admin'],
        groups: [],
        requestedGroups: []
      },
      {
        id: crypto.randomUUID(),
        username: 'user',
        email: 'user@example.com',
        roles: ['user'],
        groups: [],
        requestedGroups: []
      }
    ];

    localStorage.setItem(this.key, JSON.stringify(seed));
    return seed;
  }

  /** 💾 Save to localStorage */
  private save(list: AppUser[]) {
    localStorage.setItem(this.key, JSON.stringify(list));
  }

  /** 📋 Return all users */
  list(): AppUser[] {
    return this.load();
  }

  /** ➕ Create a new user (default role: user) */
  create(username: string, email: string): AppUser {
    const list = this.load();
    const normalized = username.trim().toLowerCase();

    if (list.some(u => u.username === normalized)) {
      throw new Error('Username already exists');
    }

    const newUser: AppUser = {
      id: crypto.randomUUID(),
      username: normalized,
      email: email.trim(),
      roles: ['user'],
      groups: [],
      requestedGroups: []
    };

    list.push(newUser);
    this.save(list);
    return newUser;
  }

  /** 🗑️ Delete user by username */
  delete(username: string) {
    const normalized = username.trim().toLowerCase();
    const updated = this.load().filter(u => u.username !== normalized);
    this.save(updated);
  }

  /** 🔍 Find user by username */
  findByUsername(username: string): AppUser | undefined {
    const normalized = username.trim().toLowerCase();
    return this.load().find(u => u.username === normalized);
  }

  /** ✏️ Update existing user (roles, email, etc.) */
  update(user: AppUser) {
    const list = this.load();
    const idx = list.findIndex(u => u.username === user.username);
    if (idx !== -1) {
      list[idx] = user;
      this.save(list);
    }
  }

  /** 🔼 Promote user to Group Admin */
  promoteToGroupAdmin(username: string) {
    const list = this.load();
    const user = list.find(u => u.username === username.trim().toLowerCase());
    if (!user) return;

    if (!user.roles.includes('group-admin')) {
      user.roles.push('group-admin');
      this.save(list);
    }
  }

  /** 👑 Promote user to Super Admin */
  promoteToSuperAdmin(username: string) {
    const list = this.load();
    const user = list.find(u => u.username === username.trim().toLowerCase());
    if (!user) return;

    if (!user.roles.includes('super-admin')) {
      user.roles.push('super-admin');
      this.save(list);
    }
  }

  /** 🔽 Demote user to regular user (optional feature) */
  demote(username: string) {
    const list = this.load();
    const user = list.find(u => u.username === username.trim().toLowerCase());
    if (!user) return;

    // Keep them as "user" only
    user.roles = ['user'];
    this.save(list);
  }

  /** 👥 Add user to a group */
  joinGroup(username: string, groupId: string) {
    const list = this.load();
    const user = list.find(u => u.username === username);
    if (!user) return;

    if (!user.groups.includes(groupId)) {
      user.groups.push(groupId);
      user.requestedGroups = user.requestedGroups.filter(g => g !== groupId);
      this.save(list);
    }
  }

  /** 🚪 Remove user from a group */
  leaveGroup(username: string, groupId: string) {
    const list = this.load();
    const user = list.find(u => u.username === username);
    if (!user) return;

    user.groups = user.groups.filter(g => g !== groupId);
    this.save(list);
  }

  /** 📨 User requests to join a group */
  requestGroup(username: string, groupId: string) {
    const list = this.load();
    const user = list.find(u => u.username === username);
    if (!user) return;

    if (
      !user.groups.includes(groupId) &&
      !user.requestedGroups.includes(groupId)
    ) {
      user.requestedGroups.push(groupId);
      this.save(list);
    }
  }

  /** 🔄 Reset demo users (utility for testing) */
  resetDemoData() {
    localStorage.removeItem(this.key);
    this.load();
  }
}
