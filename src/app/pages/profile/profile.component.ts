import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { UploadService } from '../../services/upload.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent {
  user: any = null;
  uploading = false;

  constructor(public auth: AuthService, private upload: UploadService) {
    this.user = this.auth.session;
  }

  async onFileSelected(event: any) {
    const file = event.target.files?.[0];
    if (!file || !this.user) return;

    try {
      this.uploading = true;
      const { url } = await this.upload.uploadAvatar(file);
      this.auth.updateAvatar(url); // update local session
      this.user.avatarUrl = url;
      alert('✅ Avatar updated successfully!');
    } catch (err) {
      console.error('❌ Avatar upload failed', err);
      alert('Failed to upload avatar');
    } finally {
      this.uploading = false;
    }
  }
}
