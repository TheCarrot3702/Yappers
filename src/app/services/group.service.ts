import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

/** 🧩 Group model — matches your MongoDB schema */
export interface Group {
  _id: string;
  name: string;
  ownerUsername: string;
  channels: string[];
  members: string[];
  joinRequests: string[];
}

@Injectable({ providedIn: 'root' })
export class GroupService {
  /** Adjust to your backend URL if needed */
  private readonly baseUrl = 'http://localhost:3000/api/groups';

  constructor(private http: HttpClient) {}

  /** 🔹 Fetch all groups */
  async list(): Promise<Group[]> {
    try {
      const res = await firstValueFrom(this.http.get<Group[]>(this.baseUrl));
      return res ?? [];
    } catch (err) {
      console.error('❌ Failed to fetch groups:', err);
      return [];
    }
  }

  /** 🔹 Create a new group */
  async create(name: string, ownerUsername: string): Promise<void> {
    try {
      await firstValueFrom(
        this.http.post<void>(this.baseUrl, { name, ownerUsername })
      );
    } catch (err) {
      console.error('❌ Failed to create group:', err);
      throw err;
    }
  }

  /** 🔹 Add a new channel */
  async addChannel(groupId: string, channel: string): Promise<void> {
    try {
      await firstValueFrom(
        this.http.post<void>(`${this.baseUrl}/${groupId}/channels`, { channel })
      );
    } catch (err) {
      console.error('❌ Failed to add channel:', err);
      throw err;
    }
  }

  /** 🔹 Remove a channel */
  async removeChannel(groupId: string, channel: string): Promise<void> {
    try {
      await firstValueFrom(
        this.http.delete<void>(`${this.baseUrl}/${groupId}/channels/${channel}`)
      );
    } catch (err) {
      console.error('❌ Failed to remove channel:', err);
      throw err;
    }
  }

  /** 🔹 Request to join group */
  async requestJoin(groupId: string, username: string): Promise<void> {
    try {
      await firstValueFrom(
        this.http.post<void>(`${this.baseUrl}/${groupId}/request`, { username })
      );
    } catch (err) {
      console.error('❌ Failed to request join:', err);
      throw err;
    }
  }

  /** 🔹 Approve join request */
  async approveJoin(groupId: string, username: string): Promise<void> {
    try {
      await firstValueFrom(
        this.http.post<void>(`${this.baseUrl}/${groupId}/approve`, { username })
      );
    } catch (err) {
      console.error('❌ Failed to approve join:', err);
      throw err;
    }
  }

  /** 🔹 Reject join request */
  async rejectJoin(groupId: string, username: string): Promise<void> {
    try {
      await firstValueFrom(
        this.http.post<void>(`${this.baseUrl}/${groupId}/reject`, { username })
      );
    } catch (err) {
      console.error('❌ Failed to reject join:', err);
      throw err;
    }
  }

  /** 🔹 Remove a member from the group */
  async removeMember(groupId: string, username: string): Promise<void> {
    try {
      await firstValueFrom(
        this.http.post<void>(`${this.baseUrl}/${groupId}/remove-member`, {
          username,
        })
      );
    } catch (err) {
      console.error('❌ Failed to remove member:', err);
      throw err;
    }
  }

  /** 🔹 Delete a group */
  async remove(groupId: string): Promise<void> {
    try {
      await firstValueFrom(
        this.http.delete<void>(`${this.baseUrl}/${groupId}`)
      );
    } catch (err) {
      console.error('❌ Failed to delete group:', err);
      throw err;
    }
  }

  /** 🔹 Ban a user from a specific channel */
  async banUserFromChannel(
    groupId: string,
    channel: string,
    username: string,
    reason: string,
    bannedBy: string
  ): Promise<void> {
    try {
      await firstValueFrom(
        this.http.post<void>(`${this.baseUrl}/${groupId}/ban`, {
          channel,
          username,
          reason,
          bannedBy,
        })
      );
    } catch (err) {
      console.error('❌ Failed to ban user:', err);
      throw err;
    }
  }
}
