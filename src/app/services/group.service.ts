import { Injectable } from '@angular/core';

export interface Group {
  id: string;
  name: string;
  ownerUsername: string;
  channels: string[];
  members: string[];
  joinRequests: string[];
}

@Injectable({ providedIn: 'root' })
export class GroupService {
  private key = 'groups';

  /** Load from localStorage, with normalization */
  private load(): Group[] {
    const raw = localStorage.getItem(this.key);
    if (!raw) return [];
    try {
      const list = JSON.parse(raw);
      return Array.isArray(list)
        ? list.map((g: any) => ({
            id: g.id ?? crypto.randomUUID(),
            name: g.name ?? '(Unnamed)',
            ownerUsername: g.ownerUsername ?? 'unknown',
            channels: Array.isArray(g.channels) ? g.channels : ['General'],
            members: Array.isArray(g.members) ? g.members : [],
            joinRequests: Array.isArray(g.joinRequests) ? g.joinRequests : [],
          }))
        : [];
    } catch {
      return [];
    }
  }

  /** Save back to localStorage */
  private save(groups: Group[]) {
    localStorage.setItem(this.key, JSON.stringify(groups));
  }

  /** List all groups */
  list(): Group[] {
    return this.load();
  }

  /** Create a new group (expects a full Group object) */
  create(g: Group) {
    const groups = this.load();
    groups.push(g);
    this.save(groups);
  }

  /** Remove a group (super-admin or owner only) */
  removeGroup(id: string, requester: string) {
    const groups = this.load();
    const filtered = groups.filter(
      (g) =>
        g.id !== id &&
        (g.ownerUsername === requester || requester === 'super' || requester === 'super-admin')
    );
    this.save(filtered);
  }

  /** Add new channel to group */
  addChannel(groupId: string, channel: string) {
    const groups = this.load();
    const g = groups.find((x) => x.id === groupId);
    if (g && !g.channels.includes(channel)) g.channels.push(channel);
    this.save(groups);
  }

  /** Remove a channel (admin only) */
  removeChannel(groupId: string, channel: string, requester: string) {
    const groups = this.load();
    const g = groups.find((x) => x.id === groupId);
    if (!g) return;
    if (g.ownerUsername !== requester && requester !== 'super-admin') return;
    g.channels = g.channels.filter((c) => c !== channel);
    this.save(groups);
  }

  /** Add a join request */
  addJoinRequest(groupId: string, username: string) {
    const groups = this.load();
    const g = groups.find((x) => x.id === groupId);
    if (g && !g.joinRequests.includes(username)) g.joinRequests.push(username);
    this.save(groups);
  }

  /** ✅ Approve a join request */
  approveJoinRequest(groupId: string, username: string) {
    const groups = this.load();
    const g = groups.find((x) => x.id === groupId);
    if (!g) return;
    g.joinRequests = g.joinRequests.filter((u) => u !== username);
    if (!g.members.includes(username)) g.members.push(username);
    this.save(groups);
  }

  /** ❌ Reject a join request */
  rejectJoinRequest(groupId: string, username: string) {
    const groups = this.load();
    const g = groups.find((x) => x.id === groupId);
    if (!g) return;
    g.joinRequests = g.joinRequests.filter((u) => u !== username);
    this.save(groups);
  }

  /** Remove a member */
  removeMember(groupId: string, username: string) {
    const groups = this.load();
    const g = groups.find((x) => x.id === groupId);
    if (!g) return;
    g.members = g.members.filter((u) => u !== username);
    this.save(groups);
  }

  /** Ban user from a specific channel (optional logic) */
  banUserFromChannel(
    groupId: string,
    channel: string,
    username: string,
    reason: string,
    requester: string
  ) {
    // For now, just log or send to super-admin inbox later
    console.warn(`User "${username}" banned from ${channel} in ${groupId}: ${reason}`);
  }
}
