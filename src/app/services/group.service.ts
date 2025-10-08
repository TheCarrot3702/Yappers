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

  /** 🧾 Get all groups */
  async list(): Promise<Group[]> {
    const res = await fetch(this.base);
    return res.json();
  }

  /** ➕ Create new group */
  async create(name: string, ownerUsername: string): Promise<Group> {
    const res = await fetch(this.base, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, ownerUsername }),
    });
    return res.json();
  }

  /** ➕ Add channel to group */
  async addChannel(groupId: string, name: string): Promise<void> {
    await fetch(`${this.base}/${groupId}/channels`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name }),
    });
  }

  /** 📨 Request to join group */
  async requestJoin(groupId: string, username: string): Promise<void> {
    await fetch(`${this.base}/${groupId}/request`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username }),
    });
  }

  /** ✅ Approve join request */
  async approveJoin(groupId: string, username: string): Promise<void> {
    await fetch(`${this.base}/${groupId}/approve`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username }),
    });
  }

  /** 🚫 Remove member */
  async removeMember(groupId: string, username: string): Promise<void> {
    await fetch(`${this.base}/${groupId}/leave`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username }),
    });
  }

  /** 🧹 Delete group */
  async remove(groupId: string): Promise<void> {
    await fetch(`${this.base}/${groupId}`, { method: 'DELETE' });
  }

  /** 🚫 Remove channel (not required but added for completeness) */
  async removeChannel(groupId: string, channelName: string): Promise<void> {
    await fetch(`${this.base}/${groupId}/channels/remove`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: channelName }),
    });
  }

  /** 🚷 Ban user placeholder (you can expand later) */
  async banUserFromChannel(
    groupId: string,
    channel: string,
    username: string,
    reason: string,
    by: string
  ): Promise<void> {
    console.warn(
      `🚷 Ban requested: ${username} from ${channel} (group ${groupId}) by ${by}: ${reason}`
    );
  }
}
