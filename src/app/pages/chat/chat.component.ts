import {
  Component,
  Input,
  OnInit,
  OnChanges,
  OnDestroy,
  SimpleChanges,
  ViewChild,
  ElementRef,
  HostListener,
} from '@angular/core';
import { CommonModule, NgFor, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChatService, ChatMessage } from '../../services/chat.service';
import { AuthService } from '../../services/auth.service';
import { UploadService } from '../../services/upload.service';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [CommonModule, FormsModule, NgFor, DatePipe],
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css'],
})
export class ChatComponent implements OnInit, OnChanges, OnDestroy {
  @Input() groupId!: string;
  @Input() channel!: string;
  @ViewChild('chatWindow') chatWindow!: ElementRef;

  messages: ChatMessage[] = [];
  newMessage = '';

  private isAtBottom = true;
  private loadingOlder = false;

  constructor(
    public chat: ChatService,
    public auth: AuthService,
    private upload: UploadService
  ) {}

  ngOnInit() {
    this.joinIfPossible();

    this.chat.messages$.subscribe((msgs) => {
      // Show only messages for this group/channel
      this.messages = msgs.filter(
        (m) => m.groupId === this.groupId && m.channel === this.channel
      );

      // Auto-scroll only if the user is near the bottom
      if (this.isAtBottom) {
        setTimeout(() => this.scrollToBottom(true), 50);
      }
    });
  }

  ngOnChanges(changes: SimpleChanges) {
    if (
      (changes['channel'] && !changes['channel'].firstChange) ||
      (changes['groupId'] && !changes['groupId'].firstChange)
    ) {
      this.joinIfPossible(true);
    }
  }

  ngOnDestroy() {
    const username = this.auth.username();
    if (username && this.channel) {
      this.chat.leaveChannel(this.groupId, this.channel, username);
    }
  }

  private joinIfPossible(rejoin = false) {
    const username = this.auth.username();
    if (!username || !this.channel || !this.groupId) return;

    if (rejoin) this.chat.leaveChannel(this.groupId, this.channel, username);
    this.chat.joinChannel(this.groupId, this.channel, username);
  }

  sendMessage() {
    const text = this.newMessage.trim();
    const username = this.auth.username();
    if (!text || !username) return;

    this.chat.sendMessage(this.groupId, this.channel, username, text);
    this.newMessage = '';
  }

  async onPickImage(ev: Event) {
    const input = ev.target as HTMLInputElement;
    const file = input?.files?.[0];
    if (!file) return;

    try {
      const { url } = await this.upload.uploadImage(file);
      this.chat.sendImage(this.groupId, this.channel, this.auth.username(), url);
      input.value = '';
    } catch (e) {
      alert('Image upload failed.');
      console.error(e);
    }
  }

  /** 🧭 Detect scroll position to allow loading older messages */
  @HostListener('scroll', ['$event'])
  onScroll(event: Event) {
    const el = this.chatWindow?.nativeElement;
    if (!el) return;

    const atTop = el.scrollTop === 0;
    const atBottom =
      el.scrollHeight - el.scrollTop - el.clientHeight < 100;

    this.isAtBottom = atBottom;

    // Simulate loading older messages when near top
    if (atTop && !this.loadingOlder) {
      this.loadingOlder = true;
      this.loadOlderMessages();
    }
  }

  /** 📜 Load older messages (simulated) */
  private async loadOlderMessages() {
    // TODO: You can expand this to fetch older messages from server later
    console.log('Loading older messages...');
    setTimeout(() => {
      this.loadingOlder = false;
    }, 500);
  }

  /** 📍 Smooth scroll to bottom */
  private scrollToBottom(force = false) {
    const el = this.chatWindow?.nativeElement;
    if (!el) return;

    requestAnimationFrame(() => {
      el.scrollTop = el.scrollHeight;
    });
  }
}
