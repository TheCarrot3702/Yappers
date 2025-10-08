import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { BehaviorSubject } from 'rxjs';

export interface ChatMessage {
  username: string;
  message: string;
  channel: string;
  timestamp: string;
}

@Injectable({ providedIn: 'root' })
export class ChatService {
  private socket: Socket;
  private messagesSource = new BehaviorSubject<ChatMessage[]>([]);
  messages$ = this.messagesSource.asObservable();

  private allMessages: ChatMessage[] = [];

  constructor() {
    // Connect to your Node.js Socket.io backend
    this.socket = io('http://localhost:3000');

    // Listen for incoming chat messages
    this.socket.on('receiveMessage', (msg: ChatMessage) => {
      this.allMessages.push(msg);
      this.messagesSource.next([...this.allMessages]);
    });

    // Load previous chat history from server
    this.socket.on('loadHistory', (msgs: ChatMessage[]) => {
      this.allMessages = msgs;
      this.messagesSource.next([...msgs]);
    });

    // System messages (joins, leaves)
    this.socket.on('systemMessage', (text: string) => {
      const msg: ChatMessage = {
        username: 'SYSTEM',
        message: text,
        channel: '',
        timestamp: new Date().toISOString()
      };
      this.allMessages.push(msg);
      this.messagesSource.next([...this.allMessages]);
    });
  }

  /** Join a group channel */
  joinChannel(groupId: string, channel: string, username: string) {
    this.socket.emit('joinChannel', { groupId, channel, username });
  }

  /** Leave a channel */
  leaveChannel(groupId: string, channel: string, username: string) {
    this.socket.emit('leaveChannel', { groupId, channel, username });
  }

  /** Send message to channel */
  sendMessage(groupId: string, channel: string, username: string, message: string) {
    this.socket.emit('sendMessage', { groupId, channel, username, message });
  }
}
