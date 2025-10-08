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

  // media/peer state
  private peer?: Peer;
  public localStream: MediaStream | null = null;
  private currentCall?: MediaConnection;

  micOn = true;
  camOn = true;

  constructor(private auth: AuthService) {}

  async ngOnInit() {
    // 1) Spin up Peer client. Use a stable ID so others can call you easily.
    //    (If the ID is taken, PeerJS will randomize; we handle either way.)
    const baseId = (this.auth.username() || 'guest') + '-' + Math.floor(Math.random() * 10000);
    this.peer = new Peer(baseId, {
      host: 'localhost',
      port: 3000,
      path: '/peerjs',
      secure: false, // true if you serve over https
      debug: 1,
    });

    this.peer.on('open', id => {
      this.myId = id;
      this.status = 'Ready';
    });

    this.peer.on('error', err => {
      console.error(err);
      this.status = 'Peer error: ' + err.message;
    });

    // 2) Auto-answer incoming calls
    this.peer.on('call', async (call: MediaConnection) => {
      try {
        if (!this.localStream) {
          await this.startCamera(); // ensure we have a local stream to answer with
        }
        this.status = `Incoming call from ${call.peer}`;
        call.answer(this.localStream!);
        this.bindCall(call);
      } catch (e) {
        console.error(e);
      }
    });

    // Pre-warm camera so answering is instant (optional)
    try {
      await this.startCamera();
    } catch (e) {
      // user can still click “Start Camera” later
    }
  }

  ngOnDestroy() {
    this.hangup();
    if (this.peer && !this.peer.destroyed) this.peer.destroy();
    if (this.localStream) {
      this.localStream.getTracks().forEach(t => t.stop());
      this.localStream = null;
    }
  }

  async startCamera() {
    if (this.localStream) return; // already started
    this.status = 'Getting camera...';
    const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    this.localStream = stream;
    this.localVideo.nativeElement.srcObject = stream;
    this.localVideo.nativeElement.muted = true; // avoid echo
    await this.localVideo.nativeElement.play();
    this.status = 'Camera ready';
  }

  async call() {
    if (!this.peer) return;
    if (!this.otherId.trim()) {
      alert('Enter a partner ID.');
      return;
    }
    if (!this.localStream) await this.startCamera();

    this.status = `Calling ${this.otherId}...`;
    const call = this.peer.call(this.otherId.trim(), this.localStream!);
    this.bindCall(call);
  }

  private bindCall(call: MediaConnection) {
    // Clean up previous call
    if (this.currentCall && this.currentCall.open) {
      this.currentCall.close();
    }
    this.currentCall = call;

    call.on('stream', async (remote: MediaStream) => {
      this.remoteVideo.nativeElement.srcObject = remote;
      await this.remoteVideo.nativeElement.play();
      this.status = `Connected to ${call.peer}`;
    });

    call.on('close', () => {
      this.remoteVideo.nativeElement.srcObject = null;
      this.status = 'Call ended';
    });

    call.on('error', (err) => {
      console.error('Call error:', err);
      this.status = 'Call error: ' + err.message;
    });
  }

  hangup() {
    if (this.currentCall) {
      this.currentCall.close();
      this.currentCall = undefined;
    }
    this.remoteVideo.nativeElement.srcObject = null;
    this.status = 'Idle';
  }

  toggleMic() {
    if (!this.localStream) return;
    this.micOn = !this.micOn;
    this.localStream.getAudioTracks().forEach(t => (t.enabled = this.micOn));
  }

  toggleCam() {
    if (!this.localStream) return;
    this.camOn = !this.camOn;
    this.localStream.getVideoTracks().forEach(t => (t.enabled = this.camOn));
  }

  copyMyId() {
    navigator.clipboard.writeText(this.myId);
  }
}
