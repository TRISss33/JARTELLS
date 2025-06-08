import React, { useState, useRef, useEffect } from 'react';
import { 
  Mic, 
  MicOff, 
  Video, 
  VideoOff, 
  Monitor, 
  MonitorOff, 
  Heart, 
  Smile, 
  ThumbsUp, 
  Coffee, 
  Phone,
  Users,
  MessageCircle
} from 'lucide-react';
import { CallState } from '../App';
import { SignalingService } from '../services/SignalingService';
import { WebRTCService } from '../services/WebRTCService';
import { VideoGrid } from './VideoGrid';
import { ChatPanel } from './ChatPanel';
import { ParticipantsPanel } from './ParticipantsPanel';

interface VideoCallProps {
  callState: CallState;
  onLeaveCall: () => void;
  signalingService: SignalingService | null;
  webrtcService: WebRTCService | null;
}

export const VideoCall: React.FC<VideoCallProps> = ({
  callState,
  onLeaveCall,
  signalingService,
  webrtcService
}) => {
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [showParticipants, setShowParticipants] = useState(false);
  const [messages, setMessages] = useState<Array<{
    id: string;
    userId: string;
    userName: string;
    message: string;
    timestamp: Date;
  }>>([]);

  useEffect(() => {
    if (signalingService) {
      signalingService.onMessage = (data) => {
        setMessages(prev => [...prev, {
          id: Date.now().toString(),
          userId: data.userId,
          userName: data.userName,
          message: data.message,
          timestamp: new Date()
        }]);
      };
    }
  }, [signalingService]);

  const toggleAudio = () => {
    if (callState.localStream) {
      const audioTrack = callState.localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsAudioEnabled(audioTrack.enabled);
      }
    }
  };

  const toggleVideo = () => {
    if (callState.localStream) {
      const videoTrack = callState.localStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoEnabled(videoTrack.enabled);
      }
    }
  };

  const toggleScreenShare = async () => {
    try {
      if (!isScreenSharing) {
        const screenStream = await navigator.mediaDevices.getDisplayMedia({
          video: true,
          audio: true
        });
        
        // Replace video track with screen share
        if (webrtcService && callState.localStream) {
          const videoTrack = screenStream.getVideoTracks()[0];
          await webrtcService.replaceVideoTrack(videoTrack);
          setIsScreenSharing(true);

          // Listen for screen share end
          videoTrack.onended = () => {
            stopScreenShare();
          };
        }
      } else {
        stopScreenShare();
      }
    } catch (error) {
      console.error('Failed to toggle screen share:', error);
    }
  };

  const stopScreenShare = async () => {
    try {
      // Get camera stream back
      const cameraStream = await navigator.mediaDevices.getUserMedia({
        video: { width: 1280, height: 720 },
        audio: false
      });

      if (webrtcService) {
        const videoTrack = cameraStream.getVideoTracks()[0];
        await webrtcService.replaceVideoTrack(videoTrack);
        setIsScreenSharing(false);
      }
    } catch (error) {
      console.error('Failed to stop screen share:', error);
    }
  };

  const sendReaction = (emoji: string) => {
    if (signalingService) {
      signalingService.sendReaction(callState.roomId, {
        userId: callState.user.id,
        userName: callState.user.name,
        emoji
      });
    }
  };

  const sendMessage = (message: string) => {
    if (signalingService) {
      signalingService.sendMessage(callState.roomId, {
        userId: callState.user.id,
        userName: callState.user.name,
        message
      });
    }
  };

  return (
    <div className="h-screen bg-gray-900 flex flex-col relative">
      {/* Header */}
      <div className="bg-gray-800 px-6 py-4 flex items-center justify-between">
        <div>
          <h2 className="text-white text-lg font-semibold">Room: {callState.roomId}</h2>
          <p className="text-gray-400 text-sm">{callState.participants.length + 1} participants</p>
        </div>
        
        <div className="flex items-center gap-4">
          <button
            onClick={() => setShowParticipants(!showParticipants)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              showParticipants 
                ? 'bg-purple-600 text-white' 
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            <Users className="w-4 h-4" />
            Participants
          </button>
          
          <button
            onClick={() => setShowChat(!showChat)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              showChat 
                ? 'bg-purple-600 text-white' 
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            <MessageCircle className="w-4 h-4" />
            Chat
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex relative">
        {/* Video Grid */}
        <div className={`flex-1 transition-all duration-300 ${
          showChat || showParticipants ? 'mr-80' : ''
        }`}>
          <VideoGrid
            localStream={callState.localStream}
            remoteStreams={callState.remoteStreams}
            participants={callState.participants}
            currentUser={callState.user}
            isVideoEnabled={isVideoEnabled}
          />
        </div>

        {/* Side Panels */}
        {showParticipants && (
          <ParticipantsPanel
            participants={[callState.user, ...callState.participants]}
            onClose={() => setShowParticipants(false)}
          />
        )}

        {showChat && (
          <ChatPanel
            messages={messages}
            onSendMessage={sendMessage}
            onClose={() => setShowChat(false)}
          />
        )}
      </div>

      {/* Controls */}
      <div className="bg-gray-800 px-6 py-4">
        <div className="flex items-center justify-center gap-4">
          {/* Audio Toggle */}
          <button
            onClick={toggleAudio}
            className={`p-4 rounded-full transition-all transform hover:scale-105 ${
              isAudioEnabled
                ? 'bg-gray-700 text-white hover:bg-gray-600'
                : 'bg-red-600 text-white hover:bg-red-700'
            }`}
          >
            {isAudioEnabled ? <Mic className="w-6 h-6" /> : <MicOff className="w-6 h-6" />}
          </button>

          {/* Video Toggle */}
          <button
            onClick={toggleVideo}
            className={`p-4 rounded-full transition-all transform hover:scale-105 ${
              isVideoEnabled
                ? 'bg-gray-700 text-white hover:bg-gray-600'
                : 'bg-red-600 text-white hover:bg-red-700'
            }`}
          >
            {isVideoEnabled ? <Video className="w-6 h-6" /> : <VideoOff className="w-6 h-6" />}
          </button>

          {/* Screen Share */}
          <button
            onClick={toggleScreenShare}
            className={`p-4 rounded-full transition-all transform hover:scale-105 ${
              isScreenSharing
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-gray-700 text-white hover:bg-gray-600'
            }`}
          >
            {isScreenSharing ? <MonitorOff className="w-6 h-6" /> : <Monitor className="w-6 h-6" />}
          </button>

          {/* Reactions */}
          <div className="flex items-center gap-2 bg-gray-700 rounded-full px-2">
            <button
              onClick={() => sendReaction('❤️')}
              className="p-2 rounded-full hover:bg-gray-600 transition-colors"
            >
              <Heart className="w-5 h-5 text-red-500" />
            </button>
            <button
              onClick={() => sendReaction('😊')}
              className="p-2 rounded-full hover:bg-gray-600 transition-colors"
            >
              <Smile className="w-5 h-5 text-yellow-500" />
            </button>
            <button
              onClick={() => sendReaction('👍')}
              className="p-2 rounded-full hover:bg-gray-600 transition-colors"
            >
              <ThumbsUp className="w-5 h-5 text-blue-500" />
            </button>
            <button
              onClick={() => sendReaction('☕')}
              className="p-2 rounded-full hover:bg-gray-600 transition-colors"
            >
              <Coffee className="w-5 h-5 text-amber-600" />
            </button>
          </div>

          {/* Leave Call */}
          <button
            onClick={onLeaveCall}
            className="p-4 rounded-full bg-red-600 text-white hover:bg-red-700 transition-all transform hover:scale-105"
          >
            <Phone className="w-6 h-6 rotate-[135deg]" />
          </button>
        </div>
      </div>
    </div>
  );
};