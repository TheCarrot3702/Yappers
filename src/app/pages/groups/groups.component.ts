import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgFor, NgIf } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { GroupService, Group } from '../../services/group.service';
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

  constructor(public auth: AuthService, private groups: GroupService) {
    this.refresh();
  }

  /** 🔄 Load groups from MongoDB */
  async refresh() {
    this.list = await this.groups.list();
  }

  /** ✅ Can manage any group */
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

  /** ➕ Create new group */
  async create() {
    const name = this.name.trim();
    if (!name) return alert('Enter a group name');
    const owner = this.auth.username();
    if (!owner) return alert('You must be logged in.');

    await this.groups.create(name, owner);
    this.name = '';
    await this.refresh();
  }

  /** ➕ Add channel */
  async addChannel() {
    if (!this.selectedId || !this.channel.trim()) return;
    await this.groups.addChannel(this.selectedId, this.channel.trim());
    this.channel = '';
    await this.refresh();
  }

  /** (optional) 🧹 Remove channel placeholder */
  removeChannel(g: Group, channel: string) {
    alert(`Channel removal not yet implemented. (${channel} in ${g.name})`);
  }

  /** 👤 Check membership */
  isMember(g: Group): boolean {
    const user = this.auth.username();
    return g.members.includes(user ?? '');
  }

  /** 📨 Has user requested */
  hasRequested(g: Group): boolean {
    const user = this.auth.username();
    return g.joinRequests.includes(user ?? '');
  }

  /** 📨 Request to join */
  async request(groupId: string) {
    const user = this.auth.username();
    if (!user) return;
    await this.groups.requestJoin(groupId, user);
    await this.refresh();
  }

  /** ✅ Approve join */
  async approveJoin(groupId: string, username: string) {
    await this.groups.approveJoin(groupId, username);
    alert(`${username} has been approved.`);
    await this.refresh();
  }

  /** ❌ Reject join (local only for now) */
  rejectJoinRequest(groupId: string, username: string) {
    const g = this.list.find(x => x._id === groupId);
    if (!g) return;
    g.joinRequests = g.joinRequests.filter(u => u !== username);
    alert(`${username}'s request has been rejected.`);
  }

  /** 🚪 Leave group */
  async leave(groupId: string) {
    const user = this.auth.username();
    if (!user) return;
    await this.groups.removeMember(groupId, user);
    await this.refresh();
  }

  /** 🗑️ Delete group */
  async remove(id: string) {
    if (!confirm('Delete this group?')) return;
    await this.groups.remove(id);
    await this.refresh();
  }

  /** 🚫 Remove user from group */
  async removeUser(g: Group, username: string) {
    if (!confirm(`Remove ${username} from ${g.name}?`)) return;
    await this.groups.removeMember(g._id!, username);
    await this.refresh();
  }

  /** 🚷 Ban user */
  async banUser(g: Group, channel: string, username: string) {
    const reason = prompt(`Reason for banning ${username} from ${channel}?`);
    if (!reason) return;
    await this.groups.banUserFromChannel(g._id!, channel, username, reason, this.auth.username()!);
    alert(`${username} has been banned.`);
  }

  /** 🧭 Open group */
  openGroup(g: Group) {
    const user = this.auth.username();
    if (!this.isMember(g)) {
      alert('You must be approved to access this chat.');
      return;
    }

    this.activeGroup = g;
    this.activeChannel = g.channels[0] || null;
  }

  /** 🔀 Switch channels */
  selectChannel(channel: string) {
    this.activeChannel = channel;
  }
}
