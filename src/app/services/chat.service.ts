import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { BehaviorSubject } from 'rxjs';
import { AuthService } from './auth.service';

export interface ChatMessage {
  username: string;
  message?: string;
  imageUrl?: string;
  avatarUrl?: string | null;
  channel: string;
  groupId: string;
  timestamp: string;
  type: 'text' | 'image' | 'system';
}

@Injectable({ providedIn: 'root' })
export class ChatService {
  public socket: Socket;
  private all: ChatMessage[] = [];

  private source = new BehaviorSubject<ChatMessage[]>([]);
  messages$ = this.source.asObservable();

  constructor(private auth: AuthService) {
    this.socket = io('http://localhost:3000', { transports: ['websocket'] });

    this.socket.on('loadHistory', (msgs: any[]) => {
      const cast = msgs.map(this.normalize);
      this.all = cast;
      this.source.next([...this.all]);
    });

    this.socket.on('receiveMessage', (msg: any) => {
      const m = this.normalize(msg);
      this.all.push(m);
      this.source.next([...this.all]);
    });

    this.socket.on('systemMessage', (payload: any) => {
      const sysMsg: ChatMessage = {
        username: 'System',
        message: payload.text || 'System update',
        channel: payload.channel || '',
        groupId: payload.groupId || '',
        timestamp: new Date(payload.timestamp || Date.now()).toISOString(),
        type: 'system',
      };
      this.all.push(sysMsg);
      this.source.next([...this.all]);
    });
  }

  private normalize = (m: any): ChatMessage => ({
    username: m.username,
    message: m.message,
    imageUrl: m.imageUrl,
    avatarUrl: m.avatarUrl ?? null,
    groupId: m.groupId,
    channel: m.channel,
    timestamp: String(m.timestamp),
    type: m.type || 'text',
  });

  joinChannel(groupId: string, channel: string, username: string) {
    this.socket.emit('joinChannel', { groupId, channel, username });
  }

  leaveChannel(groupId: string, channel: string, username: string) {
    this.socket.emit('leaveChannel', { groupId, channel, username });
  }

  sendMessage(groupId: string, channel: string, username: string, message: string) {
    const avatarUrl = this.auth.session?.avatarUrl ?? null;
    this.socket.emit('sendMessage', { groupId, channel, username, message, avatarUrl });
  }

  sendImage(groupId: string, channel: string, username: string, imageUrl: string) {
    const avatarUrl = this.auth.session?.avatarUrl ?? null;
    this.socket.emit('sendImage', { groupId, channel, username, imageUrl, avatarUrl });
  }
}
