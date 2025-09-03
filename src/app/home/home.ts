import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgIf } from '@angular/common'; // ✅ Important

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [FormsModule, NgIf],  // ✅ Add NgIf here
  templateUrl: './home.html',
  styleUrls: ['./home.css']
})
export class HomeComponent {
  username: string = '';
  password: string = '';
  message: string = '';
  role: 'user' | 'group-admin' | 'super-admin' | null = null;

  login() {
    if (this.username === 'user' && this.password === 'user') {
      this.role = 'user';
      this.message = 'User logged in!';
    } else if (this.username === 'super' && this.password === 'super') {
      this.role = 'super-admin';
      this.message = 'Super Admin logged in!';
    } else if (this.username === 'group' && this.password === 'group') {
      this.role = 'group-admin';
      this.message = 'Group Admin logged in!';
    } else {
      this.role = null;
      this.message = 'Incorrect login';
    }
  }

  logout() {
    this.username = '';
    this.password = '';
    this.role = null;
    this.message = '';
  }
}
