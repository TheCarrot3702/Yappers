import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgFor, NgIf } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { GroupService, Group } from '../../services/group.service';
import { UserService } from '../../services/user.service';
import { ChatComponent } from '../chat/chat.component';

@Component({
  selector: 'app-groups',
  standalone: true,
  imports: [FormsModule, NgFor, NgIf, ChatComponent],
  templateUrl: './groups.component.html'
})
export class GroupsComponent {
  list: Group[] = [];
  name = '';
  channel = '';
  selectedId: string | null = null;

  activeGroup: Group | null = null;
  activeChannel: string | null = null;

  constructor(
    public auth: AuthService,
    private groups: GroupService,
    private users: UserService
  ) {
    this.refresh();
  }

  /** 🔄 Refresh group list */
  refresh() {
    const all = this.groups.list();
    const role = this.auth.role();
    const username = this.auth.username();

    if (role === 'super-admin') {
      this.list = all;
    } else if (role === 'group-admin') {
      this.list = all.filter(g => g.ownerUsername === username);
    } else {
      this.list = all;
    }

    // Keep active group updated
    if (this.activeGroup) {
      const updated = this.list.find(g => g.id === this.activeGroup?.id);
      this.activeGroup = updated || null;
    }
  }

  /** ✅ Can manage any groups */
  canManage(): boolean {
    const role = this.auth.role();
    return role === 'super-admin' || role === 'group-admin';
  }

  /** ✅ Can manage this specific group */
  canManageGroup(g: Group): boolean {
    const role = this.auth.role();
    const username = this.auth.username();
    return role === 'super-admin' || g.ownerUsername === username;
  }

  /** ➕ Create a new group */
  create() {
    const name = this.name.trim();
    if (!name) return alert('Enter a group name');
    const owner = this.auth.username();
    if (!owner) return alert('You must be logged in.');

    this.groups.create({
      id: crypto.randomUUID(),
      name,
      ownerUsername: owner,
      channels: ['General'],
      members: [owner],
      joinRequests: []
    });

    this.name = '';
    this.refresh();
  }

  /** ➕ Add channel */
  addChannel() {
    if (!this.selectedId || !this.channel.trim()) return;
    this.groups.addChannel(this.selectedId, this.channel.trim());
    this.channel = '';
    this.refresh();
  }

  /** ➖ Remove channel */
  removeChannel(g: Group, channel: string) {
    if (!confirm(`Remove channel "${channel}" from ${g.name}?`)) return;
    this.groups.removeChannel(g.id, channel, this.auth.username()!);
    this.refresh();
  }

  /** 👤 Is user member of group */
  isMember(g: Group): boolean {
    const user = this.auth.username();
    return g.members.includes(user ?? '');
  }

  /** 📨 Has user requested join */
  hasRequested(g: Group): boolean {
    const user = this.auth.username();
    return g.joinRequests.includes(user ?? '');
  }

  /** 📨 Request join */
  request(groupId: string) {
    const user = this.auth.username();
    if (!user) return;
    this.users.requestGroup(user, groupId);
    this.groups.addJoinRequest(groupId, user);
    this.refresh();
  }

  /** 🚪 Leave group */
  leave(groupId: string) {
    const user = this.auth.username();
    if (!user) return;
    this.users.leaveGroup(user, groupId);
    this.groups.removeMember(groupId, user);
    this.refresh();
  }

  /** ✅ Approve a user's join request */
  approveJoinRequest(groupId: string, username: string) {
    this.groups.approveJoinRequest(groupId, username);
    alert(`${username} has been approved to join this group.`);
    this.refresh();
  }

  /** ❌ Reject a user's join request */
  rejectJoinRequest(groupId: string, username: string) {
    const groups = this.groups.list();
    const g = groups.find(x => x.id === groupId);
    if (!g) return;

    g.joinRequests = g.joinRequests.filter(u => u !== username);
    localStorage.setItem('groups', JSON.stringify(groups));
    alert(`${username}'s request has been rejected.`);
    this.refresh();
  }

  /** 🗑️ Delete group */
  remove(id: string) {
    if (!confirm('Delete this group?')) return;
    this.groups.removeGroup(id, this.auth.username()!);
    this.refresh();
  }

  /** 🚫 Remove user from group */
  removeUser(g: Group, username: string) {
    if (!confirm(`Remove ${username} from ${g.name}?`)) return;
    this.groups.removeMember(g.id, username);
    this.refresh();
  }

  /** 🚷 Ban user from a channel */
  banUser(g: Group, channel: string, username: string) {
    const reason = prompt(`Enter reason for banning ${username} from ${channel}:`);
    if (!reason) return;
    this.groups.banUserFromChannel(g.id, channel, username, reason, this.auth.username()!);
    alert(`${username} has been banned from ${channel}. Report sent to Super Admins.`);
  }

  /** 🧭 Open selected group + first channel */
  openGroup(g: Group) {
    const user = this.auth.username();

    // 🚫 Prevent non-members from opening chat
    if (!this.isMember(g)) {
      alert('You must be approved by a group admin to access this chat.');
      return;
    }

    this.activeGroup = g;
    this.activeChannel = g.channels[0] || null;
  }

  /** 🔀 Switch between channels */
  selectChannel(channel: string) {
    this.activeChannel = channel;
  }
}
