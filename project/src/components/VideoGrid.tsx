import React, { useRef, useEffect } from 'react';
import { User } from '../App';
import { VideoTile } from './VideoTile';

interface VideoGridProps {
  localStream?: MediaStream;
  remoteStreams: Map<string, MediaStream>;
  participants: User[];
  currentUser: User;
  isVideoEnabled: boolean;
}

export const VideoGrid: React.FC<VideoGridProps> = ({
  localStream,
  remoteStreams,
  participants,
  currentUser,
  isVideoEnabled
}) => {
  const totalParticipants = participants.length + 1; // +1 for current user

  const getGridClass = () => {
    if (totalParticipants === 1) return 'grid-cols-1';
    if (totalParticipants === 2) return 'grid-cols-2';
    if (totalParticipants <= 4) return 'grid-cols-2';
    if (totalParticipants <= 6) return 'grid-cols-3';
    return 'grid-cols-4';
  };

  const getVideoSize = () => {
    if (totalParticipants === 1) return 'aspect-video';
    if (totalParticipants === 2) return 'aspect-video';
    return 'aspect-square';
  };

  return (
    <div className="h-full p-4 bg-gray-900">
      <div className={`h-full grid gap-4 ${getGridClass()}`}>
        {/* Current User */}
        <VideoTile
          stream={localStream}
          user={currentUser}
          isLocal={true}
          isVideoEnabled={isVideoEnabled}
          className={getVideoSize()}
        />

        {/* Remote Participants */}
        {participants.map((participant) => (
          <VideoTile
            key={participant.id}
            stream={remoteStreams.get(participant.id)}
            user={participant}
            isLocal={false}
            isVideoEnabled={true}
            className={getVideoSize()}
          />
        ))}
      </div>
    </div>
  );
};