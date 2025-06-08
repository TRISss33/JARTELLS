import { SignalingService } from './SignalingService';

export class WebRTCService {
  private localStream: MediaStream | null = null;
  private peerConnections = new Map<string, RTCPeerConnection>();
  private signalingService: SignalingService;

  public onRemoteStream: ((userId: string, stream: MediaStream) => void) | null = null;

  constructor(signalingService: SignalingService) {
    this.signalingService = signalingService;
    this.setupSignalingHandlers();
  }

  private setupSignalingHandlers() {
    this.signalingService.onSignalingMessage = async (message) => {
      if (message.type === 'signaling') {
        await this.handleSignalingMessage(message.userId!, message.data);
      }
    };

    this.signalingService.onUserJoined = async (user) => {
      await this.createPeerConnection(user.id, true);
    };

    this.signalingService.onUserLeft = (userId) => {
      this.closePeerConnection(userId);
    };
  }

  setLocalStream(stream: MediaStream) {
    this.localStream = stream;
  }

  private async createPeerConnection(userId: string, isInitiator: boolean) {
    const pc = new RTCPeerConnection({
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' }
      ]
    });

    this.peerConnections.set(userId, pc);

    // Add local stream to peer connection
    if (this.localStream) {
      this.localStream.getTracks().forEach(track => {
        pc.addTrack(track, this.localStream!);
      });
    }

    // Handle remote stream
    pc.ontrack = (event) => {
      if (this.onRemoteStream && event.streams[0]) {
        this.onRemoteStream(userId, event.streams[0]);
      }
    };

    // Handle ICE candidates
    pc.onicecandidate = (event) => {
      if (event.candidate) {
        this.signalingService.sendSignalingData('room', userId, {
          type: 'ice-candidate',
          candidate: event.candidate
        });
      }
    };

    // Handle connection state changes
    pc.onconnectionstatechange = () => {
      console.log(`Connection state with ${userId}:`, pc.connectionState);
    };

    if (isInitiator) {
      // Create offer
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      
      this.signalingService.sendSignalingData('room', userId, {
        type: 'offer',
        sdp: offer
      });
    }
  }

  private async handleSignalingMessage(userId: string, data: any) {
    const pc = this.peerConnections.get(userId);
    if (!pc) return;

    switch (data.type) {
      case 'offer':
        await pc.setRemoteDescription(data.sdp);
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        
        this.signalingService.sendSignalingData('room', userId, {
          type: 'answer',
          sdp: answer
        });
        break;

      case 'answer':
        await pc.setRemoteDescription(data.sdp);
        break;

      case 'ice-candidate':
        await pc.addIceCandidate(data.candidate);
        break;
    }
  }

  async replaceVideoTrack(newTrack: MediaStreamTrack) {
    const promises = Array.from(this.peerConnections.values()).map(async (pc) => {
      const sender = pc.getSenders().find(s => 
        s.track && s.track.kind === 'video'
      );
      
      if (sender) {
        await sender.replaceTrack(newTrack);
      }
    });

    await Promise.all(promises);

    // Update local stream
    if (this.localStream) {
      const oldTrack = this.localStream.getVideoTracks()[0];
      if (oldTrack) {
        this.localStream.removeTrack(oldTrack);
        oldTrack.stop();
      }
      this.localStream.addTrack(newTrack);
    }
  }

  private closePeerConnection(userId: string) {
    const pc = this.peerConnections.get(userId);
    if (pc) {
      pc.close();
      this.peerConnections.delete(userId);
    }
  }

  cleanup() {
    this.peerConnections.forEach(pc => pc.close());
    this.peerConnections.clear();
    
    if (this.localStream) {
      this.localStream.getTracks().forEach(track => track.stop());
      this.localStream = null;
    }
  }
}