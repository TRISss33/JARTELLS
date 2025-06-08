import React, { useState, useEffect, useRef } from 'react';
import { LandingPage } from './components/LandingPage';
import { VideoCall } from './components/VideoCall';
import { SignalingService } from './services/SignalingService';
import { WebRTCService } from './services/WebRTCService';

export interface User {
  id: string;
  name: string;
}

export interface CallState {
  isInCall: boolean;
  roomId: string;
  user: User;
  participants: User[];
  localStream?: MediaStream;
  remoteStreams: Map<string, MediaStream>;
}

function App() {
  const [callState, setCallState] = useState<CallState>({
    isInCall: false,
    roomId: '',
    user: { id: '', name: '' },
    participants: [],
    localStream: undefined,
    remoteStreams: new Map(),
  });

  const signalingService = useRef<SignalingService | null>(null);
  const webrtcService = useRef<WebRTCService | null>(null);

  useEffect(() => {
    // Initialize services
    signalingService.current = new SignalingService();
    webrtcService.current = new WebRTCService(signalingService.current);

    // Setup event listeners
    signalingService.current.onUserJoined = (user: User) => {
      setCallState(prev => ({
        ...prev,
        participants: [...prev.participants, user]
      }));
    };

    signalingService.current.onUserLeft = (userId: string) => {
      setCallState(prev => ({
        ...prev,
        participants: prev.participants.filter(p => p.id !== userId),
        remoteStreams: new Map([...prev.remoteStreams].filter(([id]) => id !== userId))
      }));
    };

    webrtcService.current.onRemoteStream = (userId: string, stream: MediaStream) => {
      setCallState(prev => ({
        ...prev,
        remoteStreams: new Map(prev.remoteStreams).set(userId, stream)
      }));
    };

    return () => {
      if (signalingService.current) {
        signalingService.current.disconnect();
      }
      if (webrtcService.current) {
        webrtcService.current.cleanup();
      }
    };
  }, []);

  const joinCall = async (name: string, roomId: string) => {
    try {
      if (!signalingService.current || !webrtcService.current) return;

      // Get user media
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 1280, height: 720 },
        audio: { echoCancellation: true, noiseSuppression: true }
      });

      const user: User = {
        id: Date.now().toString(),
        name
      };

      // Connect to signaling server and join room
      await signalingService.current.connect();
      await signalingService.current.joinRoom(roomId, user);

      // Initialize WebRTC with local stream
      webrtcService.current.setLocalStream(stream);

      setCallState(prev => ({
        ...prev,
        isInCall: true,
        roomId,
        user,
        localStream: stream
      }));
    } catch (error) {
      console.error('Failed to join call:', error);
      alert('Failed to join call. Please check your camera and microphone permissions.');
    }
  };

  const leaveCall = () => {
    if (signalingService.current) {
      signalingService.current.leaveRoom(callState.roomId);
      signalingService.current.disconnect();
    }

    if (webrtcService.current) {
      webrtcService.current.cleanup();
    }

    if (callState.localStream) {
      callState.localStream.getTracks().forEach(track => track.stop());
    }

    setCallState({
      isInCall: false,
      roomId: '',
      user: { id: '', name: '' },
      participants: [],
      localStream: undefined,
      remoteStreams: new Map(),
    });
  };

  if (callState.isInCall) {
    return (
      <VideoCall
        callState={callState}
        onLeaveCall={leaveCall}
        signalingService={signalingService.current}
        webrtcService={webrtcService.current}
      />
    );
  }

  return <LandingPage onJoinCall={joinCall} />;
}

export default App;