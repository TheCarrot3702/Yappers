// src/app/services/chat.service.ts
import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { BehaviorSubject } from 'rxjs';
import { AuthService } from './auth.service';

export interface ChatMessage {
  username: string;
  message?: string;
  imageUrl?: string;
  avatarUrl?: string | null;
  groupId: string;
  channel: string;
  timestamp: string;
  type: 'text' | 'image' | 'system';
}

@Injectable({ providedIn: 'root' })
export class ChatService {
  private socket: Socket;
  private all: ChatMessage[] = [];

  private source = new BehaviorSubject<ChatMessage[]>([]);
  messages$ = this.source.asObservable();

  constructor(private auth: AuthService) {
    // ✅ connect to backend
    this.socket = io('http://localhost:3000');

    // 🔄 load history on join
    this.socket.on('loadHistory', (msgs: any[]) => {
      const normalized = msgs.map(this.normalize);
      this.all = [...this.all, ...normalized];
      this.source.next(this.all);
    });

    // 📨 new messages
    this.socket.on('receiveMessage', (msg: any) => {
      const normalized = this.normalize(msg);
      this.all.push(normalized);
      this.source.next(this.all);
    });

    // 🧠 system messages
    this.socket.on('systemMessage', (msg: any) => {
      const normalized: ChatMessage = {
        username: msg.username || 'System',
        message: msg.message || msg.text || '',
        groupId: msg.groupId || '',
        channel: msg.channel || '',
        timestamp: msg.timestamp || new Date().toISOString(),
        avatarUrl: null,
        type: 'system',
      };
      this.all.push(normalized);
      this.source.next(this.all);
    });
  }

  // Normalize messages
  private normalize = (m: any): ChatMessage => ({
    username: m.username,
    message: m.message,
    imageUrl: m.imageUrl,
    avatarUrl: m.avatarUrl || null,
    groupId: m.groupId,
    channel: m.channel,
    timestamp:
      typeof m.timestamp === 'string'
        ? m.timestamp
        : new Date(m.timestamp).toISOString(),
    type: m.type || 'text',
  });

  // Join a channel
  joinChannel(groupId: string, channel: string, username: string) {
    this.socket.emit('joinChannel', { groupId, channel, username });
  }

  // Leave a channel
  leaveChannel(groupId: string, channel: string, username: string) {
    this.socket.emit('leaveChannel', { groupId, channel, username });
  }

  // Send a text message
  sendMessage(groupId: string, channel: string, username: string, message: string) {
    const avatarUrl = this.auth.session?.avatarUrl || null;
    this.socket.emit('sendMessage', { groupId, channel, username, message, avatarUrl });
  }

  // Send an image
  sendImage(groupId: string, channel: string, username: string, imageUrl: string) {
    const avatarUrl = this.auth.session?.avatarUrl || null;
    this.socket.emit('sendImage', { groupId, channel, username, imageUrl, avatarUrl });
  }
}
