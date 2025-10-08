import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  username = ''; password = ''; msg = '';
  loading = false;

  constructor(private auth: AuthService, private router: Router) {}

  submit() {
    this.loading = true;
    const res = this.auth.login(this.username.trim(), this.password);
    this.loading = false;
    if (res) this.router.navigateByUrl('/');
    else this.msg = 'Invalid username or password';

  }
}
