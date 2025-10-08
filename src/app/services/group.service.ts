import { Injectable } from '@angular/core';

export interface Group {
  _id?: string;
  name: string;
  ownerUsername: string;
  channels: string[];
  members: string[];
  joinRequests: string[];
}

@Injectable({ providedIn: 'root' })
export class GroupService {
  private base = 'http://localhost:3000/api/groups';

  async list(): Promise<Group[]> {
    const res = await fetch(this.base);
    return await res.json();
  }

  async create(name: string, ownerUsername: string) {
    await fetch(this.base, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, ownerUsername }),
    });
  }

  async addChannel(groupId: string, channel: string) {
    await fetch(`${this.base}/${groupId}/channels`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ channel }),
    });
  }

  async requestJoin(groupId: string, username: string) {
    await fetch(`${this.base}/${groupId}/join`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username }),
    });
  }

  async approveJoin(groupId: string, username: string) {
    await fetch(`${this.base}/${groupId}/approve`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username }),
    });
  }

  async remove(id: string) {
    await fetch(`${this.base}/${id}`, { method: 'DELETE' });
  }

  async removeMember(groupId: string, username: string) {
    await fetch(`${this.base}/${groupId}/members/${username}`, { method: 'DELETE' });
  }

  async banUserFromChannel(
    groupId: string,
    channel: string,
    username: string,
    reason: string,
    by: string
  ) {
    await fetch(`${this.base}/${groupId}/bans`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ channel, username, reason, by }),
    });
  }
}
