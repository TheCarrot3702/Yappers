import {
  Component,
  Input,
  OnInit,
  OnChanges,
  OnDestroy,
  SimpleChanges,
  ViewChild,
  ElementRef
} from '@angular/core';
import { CommonModule, NgFor, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChatService, ChatMessage } from '../../services/chat.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [CommonModule, FormsModule, NgFor, DatePipe],
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css']
})
export class ChatComponent implements OnInit, OnChanges, OnDestroy {
  @Input() groupId!: string;
  @Input() channel!: string;
  @ViewChild('chatWindow') chatWindow!: ElementRef;

  messages: ChatMessage[] = [];
  newMessage = '';

  constructor(public chat: ChatService, public auth: AuthService) {}

  ngOnInit() {
    this.chat.messages$.subscribe(msgs => {
      this.messages = msgs.filter(m => m.channel === this.channel);
      setTimeout(() => this.scrollToBottom(), 100);
    });
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['channel'] && !changes['channel'].firstChange) {
      const username = this.auth.username();
      if (username) {
        this.chat.joinChannel(this.groupId, this.channel, username);
      }
    }
  }

  ngOnDestroy() {
    const username = this.auth.username();
    if (username) {
      this.chat.leaveChannel(this.groupId, this.channel, username);
    }
  }

  sendMessage() {
    const message = this.newMessage.trim();
    const username = this.auth.username();
    if (message && username) {
      this.chat.sendMessage(this.groupId, this.channel, username, message);
      this.newMessage = '';
    }
  }

  private scrollToBottom() {
    if (this.chatWindow) {
      const el = this.chatWindow.nativeElement;
      el.scrollTop = el.scrollHeight;
    }
  }
}
