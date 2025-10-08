import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export type Role = 'user' | 'group-admin' | 'super-admin';

export interface Session {
  username: string;
  role: Role;
  avatarUrl?: string | null;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private key = 'session';
  private sessionSubject = new BehaviorSubject<Session | null>(this.loadSession());
  session$ = this.sessionSubject.asObservable();

  constructor() {
    // Initialize as a guest if no session found
    if (!this.session) {
      const guest: Session = {
        username: 'Guest' + Math.floor(Math.random() * 1000),
        role: 'user',
        avatarUrl: 'http://localhost:3000/uploads/avatars/default.jpg',
      };
      this.saveSession(guest);
    }

    // Auto-reload session if changed elsewhere (e.g., another tab)
    window.addEventListener('storage', () => {
      this.sessionSubject.next(this.loadSession());
    });
  }

  /** Load session safely from localStorage */
  private loadSession(): Session | null {
    try {
      const raw = localStorage.getItem(this.key);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      return parsed.username ? parsed : null;
    } catch {
      return null;
    }
  }

  /** Save session to localStorage */
  private saveSession(session: Session): void {
    localStorage.setItem(this.key, JSON.stringify(session));
    this.sessionSubject.next(session);
  }

  /** Current session getter */
  get session(): Session | null {
    return this.sessionSubject.value;
  }

  /** Get current username */
  username(): string {
    return this.session?.username ?? 'Anonymous';
  }

  /** Get current avatar URL */
  avatar(): string | null {
    return this.session?.avatarUrl ?? null;
  }

  /** Attempt login with demo credentials */
  login(username: string, password: string): boolean {
    const map: Record<string, { pass: string; role: Role; avatarUrl?: string }> = {
      super: {
        pass: '123',
        role: 'super-admin',
        avatarUrl: 'http://localhost:3000/uploads/avatars/super.jpg',
      },
      group: {
        pass: 'group',
        role: 'group-admin',
        avatarUrl: 'http://localhost:3000/uploads/avatars/group.jpg',
      },
      user: {
        pass: 'user',
        role: 'user',
        avatarUrl: 'http://localhost:3000/uploads/avatars/default.jpg',
      },
    };

    const entry = map[username];
    if (entry && entry.pass === password) {
      const session: Session = {
        username,
        role: entry.role,
        avatarUrl: entry.avatarUrl ?? null,
      };
      this.saveSession(session);
      return true;
    }

    return false;
  }

  /** Update avatar image URL */
  updateAvatar(url: string): void {
    const current = this.session;
    if (!current) return;
    const updated: Session = { ...current, avatarUrl: url };
    this.saveSession(updated);
  }

  /** Log out and clear session */
  logout(): void {
    localStorage.removeItem(this.key);
    this.sessionSubject.next(null);
  }

  /** Check if user is logged in */
  isLoggedIn(): boolean {
    return !!this.session;
  }

  /** Get current user role */
  role(): Role | null {
    return this.session?.role ?? null;
  }
}
