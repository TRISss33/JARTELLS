import React, { useRef, useEffect, useState } from 'react';
import { Mic, MicOff, User as UserIcon } from 'lucide-react';
import { User } from '../App';

interface VideoTileProps {
  stream?: MediaStream;
  user: User;
  isLocal: boolean;
  isVideoEnabled: boolean;
  className?: string;
}

export const VideoTile: React.FC<VideoTileProps> = ({
  stream,
  user,
  isLocal,
  isVideoEnabled,
  className = ''
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
      
      // Check audio track status
      const audioTrack = stream.getAudioTracks()[0];
      if (audioTrack) {
        setIsAudioEnabled(audioTrack.enabled);
        
        // Listen for track changes
        audioTrack.addEventListener('ended', () => setIsAudioEnabled(false));
      }
    }
  }, [stream]);

  const showVideo = stream && isVideoEnabled && stream.getVideoTracks().length > 0;

  return (
    <div className={`relative bg-gray-800 rounded-xl overflow-hidden ${className}`}>
      {showVideo ? (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted={isLocal}
          className="w-full h-full object-cover"
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-700 to-gray-800">
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mb-3 mx-auto">
              <UserIcon className="w-8 h-8 text-white" />
            </div>
            <p className="text-white font-medium text-lg">{user.name}</p>
            <p className="text-gray-400 text-sm">Camera off</p>
          </div>
        </div>
      )}

      {/* User Info Overlay */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-white font-medium text-sm">
              {isLocal ? 'You' : user.name}
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            {!isAudioEnabled && (
              <div className="p-1 bg-red-600 rounded-full">
                <MicOff className="w-3 h-3 text-white" />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Local indicator */}
      {isLocal && (
        <div className="absolute top-4 left-4">
          <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded-full">
            You
          </span>
        </div>
      )}
    </div>
  );
};