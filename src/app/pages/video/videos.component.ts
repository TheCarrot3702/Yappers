// ============================================================
// 🎥 Videos Component
// ------------------------------------------------------------
// Handles peer-to-peer video calls using PeerJS.
// Allows users to start camera, call others, and manage audio/video.
// ============================================================

import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import Peer, { MediaConnection } from 'peerjs';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-videos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './videos.component.html',
  styleUrls: ['./videos.component.css'],
})
export class VideosComponent implements OnInit, OnDestroy {
  @ViewChild('localVideo', { static: true }) localVideo!: ElementRef<HTMLVideoElement>;
  @ViewChild('remoteVideo', { static: true }) remoteVideo!: ElementRef<HTMLVideoElement>;

  // UI state
  myId = '';
  otherId = '';
  status = 'Idle';

  // Media and PeerJS state
  private peer?: Peer;
  public localStream: MediaStream | null = null;
  private currentCall?: MediaConnection;

  micOn = true;
  camOn = true;

  constructor(private auth: AuthService) {}

  // Initialize PeerJS and media stream
  async ngOnInit() {
    const baseId = (this.auth.username() || 'guest') + '-' + Math.floor(Math.random() * 10000);
    this.peer = new Peer(baseId, {
      host: 'localhost',
      port: 3000,
      path: '/peerjs',
      secure: false, // Set to true if hosted over HTTPS
      debug: 1,
    });

    // Handle successful connection
    this.peer.on('open', id => {
      this.myId = id;
      this.status = 'Ready';
    });

    // Handle connection errors
    this.peer.on('error', err => {
      console.error(err);
      this.status = 'Peer error: ' +
