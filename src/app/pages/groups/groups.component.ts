import { Component, OnInit } from '@angular/core';
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
  templateUrl: './groups.component.html',
})
export class GroupsComponent implements OnInit {
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
    console.log('✅ GroupsComponent constructed');
  }

  /** 🚀 Called once when component is ready */
  async ngOnInit(): Promise<void> {
    console.log('🚀 GroupsComponent initialized');
    await this.refresh();
  }

  /** 🔄 Fetch all groups from MongoDB */
  async refresh(): Promise<void> {
    try {
      console.log('🔄 Fetching groups...');
      const all = await this.groups.list();
      console.log('✅ Groups fetched:', all);

      const role = this.auth.role();
      const username = this.auth.username();

      // 🔹 Filter based on role
      if (role === 'super-admin') {
        this.list = all;
      } else if (role === 'group-admin') {
        this.list = all.filter((g) => g.ownerUsername === username);
      } else {
        this.list = all;
      }

      // ✅ Keep active group updated safely
      if (this.activeGroup) {
        const id = this.activeGroup?._id;
        const updated = this.list.find((g) => g._id === id);
        this.activeGroup = updated || null;
      }

      console.log('📦 Final group list:', this.list);
    } catch (err) {
      console.error('❌ Failed to fetch groups:', err);
      alert('Failed to load groups. Please check your connection.');
      this.list = [];
    }
  }

  /** ✅ Role checks */
  canManage(): boolean {
    const role = this.auth.role();
    return role === 'super-admin' || role === 'group-admin';
  }

  canManageGroup(g: Group): boolean {
    const role = this.auth.role();
    const username = this.auth.username();
    return role === 'super-admin' || g.ownerUsername === username;
  }

  /** ➕ Create new group */
  async create(): Promise<void> {
    const name = this.name.trim();
    if (!name) return alert('Enter a group name');
    const owner = this.auth.username();
    if (!owner) return alert('You must be logged in.');

    try {
      await this.groups.create(name, owner);
      this.name = '';
      await this.refresh();
      alert(`✅ Group "${name}" created successfully.`);
    } catch (err) {
      console.error('❌ Failed to create group:', err);
      alert('Failed to create group.');
    }
  }

  /** ➕ Add channel */
  async addChannel(): Promise<void> {
    if (!this.selectedId || !this.channel.trim()) {
      return alert('Select a group and enter a channel name.');
    }

    try {
      await this.groups.addChannel(this.selectedId, this.channel.trim());
      this.channel = '';
      await this.refresh();
      alert('✅ Channel added.');
    } catch (err) {
      console.error('❌ Failed to add channel:', err);
      alert('Failed to add channel.');
    }
  }

  /** ➖ Remove channel */
  async removeChannel(g: Group, channel: string): Promise<void> {
    if (!confirm(`Remove channel "${channel}" from ${g.name}?`)) return;

    try {
      await this.groups.removeChannel(g._id, channel);
      await this.refresh();
      alert(`✅ Channel "${channel}" removed.`);
    } catch (err) {
      console.error('❌ Failed to remove channel:', err);
      alert('Failed to remove channel.');
    }
  }

  /** 👤 Membership checks */
  isMember(g: Group): boolean {
    const user = this.auth.username();
    return g.members.includes(user ?? '');
  }

  hasRequested(g: Group): boolean {
    const user = this.auth.username();
    return g.joinRequests.includes(user ?? '');
  }

  /** 📨 Request to join */
  async request(groupId: string): Promise<void> {
    const user = this.auth.username();
    if (!user) return alert('You must be logged in.');

    try {
      await this.groups.requestJoin(groupId, user);
      await this.refresh();
      alert('✅ Join request sent.');
    } catch (err) {
      console.error('❌ Failed to request join:', err);
      alert('Failed to send join request.');
    }
  }

  /** 🚪 Leave group */
  async leave(groupId: string): Promise<void> {
    const user = this.auth.username();
    if (!user) return;

    try {
      await this.groups.removeMember(groupId, user);
      await this.refresh();
      alert('🚪 You left the group.');
    } catch (err) {
      console.error('❌ Failed to leave group:', err);
      alert('Failed to leave group.');
    }
  }

  /** ✅ Approve / ❌ Reject join requests */
  async approveJoinRequest(groupId: string, username: string): Promise<void> {
    try {
      await this.groups.approveJoin(groupId, username);
      alert(`${username} has been approved.`);
      await this.refresh();
    } catch (err) {
      console.error('❌ Failed to approve request:', err);
      alert('Failed to approve join request.');
    }
  }

  async rejectJoinRequest(groupId: string, username: string): Promise<void> {
    try {
      await this.groups.rejectJoin(groupId, username);
      alert(`${username}'s request has been rejected.`);
      await this.refresh();
    } catch (err) {
      console.error('❌ Failed to reject request:', err);
      alert('Failed to reject join request.');
    }
  }

  /** 🗑️ Delete group */
  async remove(id: string): Promise<void> {
    if (!confirm('Delete this group?')) return;

    try {
      await this.groups.remove(id);
      await this.refresh();
      alert('🗑️ Group deleted.');
    } catch (err) {
      console.error('❌ Failed to delete group:', err);
      alert('Failed to delete group.');
    }
  }

  /** 🚫 Remove or ban users */
  async removeUser(g: Group, username: string): Promise<void> {
    if (!confirm(`Remove ${username} from ${g.name}?`)) return;

    try {
      await this.groups.removeMember(g._id, username);
      await this.refresh();
      alert(`${username} removed from group.`);
    } catch (err) {
      console.error('❌ Failed to remove user:', err);
      alert('Failed to remove user.');
    }
  }

  async banUser(g: Group, channel: string, username: string): Promise<void> {
    const reason = prompt(`Enter reason for banning ${username} from ${channel}:`);
    if (!reason) return;

    try {
      await this.groups.banUserFromChannel(
        g._id,
        channel,
        username,
        reason,
        this.auth.username()!
      );
      alert(`${username} has been banned from ${channel}. Report sent to Super Admins.`);
    } catch (err) {
      console.error('❌ Failed to ban user:', err);
      alert('Failed to ban user.');
    }
  }

  /** 🧭 Group + Channel navigation */
  openGroup(g: Group): void {
    const user = this.auth.username();
    if (!this.isMember(g)) {
      alert('You must be approved to access this chat.');
      return;
    }

    this.activeGroup = g;
    this.activeChannel = g.channels[0] || null;
  }

  selectChannel(channel: string): void {
    this.activeChannel = channel;
  }
}
