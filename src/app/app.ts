// src/app/app.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './app.html',
})
export class AppComponent {
  username = '';
  password = '';
  role: string | null = null;
  message = '';
  showLogin = false;

  // Groups & Channels
  groups: any[] = [];
  selectedGroup: string | null = null;
  selectedChannel: string | null = null;

  // Chat
  messages: { user: string; content: string }[] = [];
  newMessage = '';

  constructor() {
    // Load groups and messages from localStorage
    const storedGroups = localStorage.getItem('groups');
    if (storedGroups) this.groups = JSON.parse(storedGroups);

    const storedSelectedGroup = localStorage.getItem('selectedGroup');
    const storedSelectedChannel = localStorage.getItem('selectedChannel');
    if (storedSelectedGroup) this.selectedGroup = storedSelectedGroup;
    if (storedSelectedChannel) this.selectedChannel = storedSelectedChannel;

    const storedMessages = localStorage.getItem('messages');
    if (storedMessages) this.messages = JSON.parse(storedMessages);
  }

  // Save groups & messages to localStorage
  saveState() {
    localStorage.setItem('groups', JSON.stringify(this.groups));
    localStorage.setItem('selectedGroup', this.selectedGroup || '');
    localStorage.setItem('selectedChannel', this.selectedChannel || '');
    localStorage.setItem('messages', JSON.stringify(this.messages));
  }

  login() {
    if (this.username === 'user' && this.password === 'user') this.role = 'user';
    else if (this.username === 'super' && this.password === 'super') this.role = 'super-admin';
    else if (this.username === 'group' && this.password === 'group') this.role = 'group-admin';
    else this.message = 'Invalid credentials';

    if (this.role) this.showLogin = false;
  }

  logout() {
    this.role = null;
    this.username = '';
    this.password = '';
    this.message = '';
    this.showLogin = false;
    this.selectedGroup = null;
    this.selectedChannel = null;
    this.messages = [];
    this.saveState();
  }

  selectChannel(groupName: string, channelName: string) {
    this.selectedGroup = groupName;
    this.selectedChannel = channelName;
    const storedMessages = localStorage.getItem(`${groupName}-${channelName}-messages`);
    this.messages = storedMessages ? JSON.parse(storedMessages) : [];
    this.saveState();
  }

  sendMessage() {
    if (this.newMessage.trim() !== '' && this.selectedGroup && this.selectedChannel) {
      this.messages.push({ user: this.username, content: this.newMessage });
      localStorage.setItem(`${this.selectedGroup}-${this.selectedChannel}-messages`, JSON.stringify(this.messages));
      this.newMessage = '';
      this.saveState();
    }
  }

  addGroup() {
    const newGroup = prompt('Enter new group name:');
    if (newGroup) {
      this.groups.push({ name: newGroup, channels: ['General'], owner: this.username });
      this.saveState();
    }
  }

  addChannel(group: any) {
    const newChannel = prompt('Enter new channel name:');
    if (newChannel) {
      group.channels.push(newChannel);
      this.saveState();
    }
  }

  deleteGroup(group: any) {
    if (confirm(`Delete group "${group.name}"?`)) {
      this.groups = this.groups.filter(g => g !== group);
      if (this.selectedGroup === group.name) {
        this.selectedGroup = null;
        this.selectedChannel = null;
        this.messages = [];
      }
      this.saveState();
    }
  }

  deleteUserFromGroup(group: any, user: string) {
    alert(`(Demo) ${user} would be removed from ${group.name} if connected to backend`);
  }
}
