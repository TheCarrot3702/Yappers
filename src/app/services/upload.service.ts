import { Injectable } from '@angular/core';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class UploadService {
  private baseUrl = 'http://localhost:3000/api/upload';

  constructor(private auth: AuthService) {}

  /**  Upload chat image */
  async uploadImage(file: File): Promise<{ url: string }> {
    const formData = new FormData();
    formData.append('file', file);

    const res = await fetch(`${this.baseUrl}`, {
      method: 'POST',
      body: formData,
    });

    if (!res.ok) throw new Error('Image upload failed');
    return res.json();
  }

  /**  Upload profile avatar */
  async uploadAvatar(file: File): Promise<{ url: string }> {
    const username = this.auth.username();
    if (!username) throw new Error('Not logged in');

    const formData = new FormData();
    formData.append('file', file);
    formData.append('username', username);

    const res = await fetch(`${this.baseUrl}/avatar`, {
      method: 'POST',
      body: formData,
    });

    if (!res.ok) throw new Error('Avatar upload failed');
    const data = await res.json();

    this.auth.updateAvatar(data.url);
    return data;
  }
}
