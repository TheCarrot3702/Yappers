// src/app/user-login.ts
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'user-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div style="text-align: center; margin-top: 100px;">
      <h2>User Login</h2>
      <input [(ngModel)]="username" placeholder="Username" style="margin: 10px; padding: 5px;">
      <input [(ngModel)]="password" type="password" placeholder="Password" style="margin: 10px; padding: 5px;">
      <div>
        <button (click)="login()" style="padding: 5px 10px; margin-top: 10px;">Login</button>
      </div>
      <p style="color: red; margin-top: 10px;">{{ message }}</p>
    </div>
  `,
})
export class UserLogin {
  username = '';
  password = '';
  message = '';

  login() {
    if (this.username === 'user' && this.password === 'user') {
      this.message = 'Login successful!';
    } else {
      this.message = 'Invalid credentials';
    }
  }
}
