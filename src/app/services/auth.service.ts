import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export type Role = 'user' | 'group-admin' | 'super-admin';
export interface Session {
  username: string;
  role: Role;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private key = 'session';
  private sessionSubject = new BehaviorSubject<Session | null>(this.loadSession());
  session$ = this.sessionSubject.asObservable();

  private loadSession(): Session | null {
    try {
      const raw = localStorage.getItem(this.key);
      if (!raw) return null;
      const parsed = JSON.parse(raw) as Session;
      if (!parsed.username || !parsed.role) return null;
      return { username: parsed.username.trim(), role: parsed.role.trim() as Role };
    } catch {
      return null;
    }
  }

  get session(): Session | null {
    return this.sessionSubject.value;
  }

  isLoggedIn(): boolean {
    return !!this.session;
  }

  role(): Role | null {
    return this.session?.role ?? null;
  }

  username(): string | null {
    return this.session?.username ?? null;
  }

  /** Login and update session stream */
  login(username: string, password: string): boolean {
    const map: Record<string, { pass: string; role: string }> = {
      super: { pass: '123', role: 'super-admin' },
      group: { pass: 'group', role: 'group-admin' },
      user: { pass: 'user', role: 'user' },
    };

    const entry = map[username];
    if (entry && entry.pass === password) {
      const session = { username, role: entry.role as Role };
      localStorage.setItem(this.key, JSON.stringify(session));
      this.sessionSubject.next(session); // ✅ triggers navbar refresh
      return true;
    }

    return false;
  }

  /** Logout and broadcast change */
  logout(): void {
    localStorage.removeItem(this.key);
    this.sessionSubject.next(null); // ✅ navbar auto-refresh
  }
}
