import React from 'react';
import { X, Crown, Mic, MicOff, Video, VideoOff } from 'lucide-react';
import { User } from '../App';

interface ParticipantsPanelProps {
  participants: User[];
  onClose: () => void;
}

export const ParticipantsPanel: React.FC<ParticipantsPanelProps> = ({
  participants,
  onClose
}) => {
  return (
    <div className="w-80 bg-gray-800 border-l border-gray-700 flex flex-col absolute right-0 top-0 bottom-0">
      {/* Header */}
      <div className="p-4 border-b border-gray-700 flex items-center justify-between">
        <h3 className="text-white font-semibold">
          Participants ({participants.length})
        </h3>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Participants List */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="space-y-3">
          {participants.map((participant, index) => (
            <div
              key={participant.id}
              className="flex items-center gap-3 p-3 rounded-lg bg-gray-700/50 hover:bg-gray-700 transition-colors"
            >
              <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-white font-medium">
                  {participant.name.charAt(0).toUpperCase()}
                </span>
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-white font-medium text-sm truncate">
                    {participant.name}
                  </span>
                  {index === 0 && (
                    <Crown className="w-4 h-4 text-yellow-500 flex-shrink-0" />
                  )}
                </div>
                <p className="text-gray-400 text-xs">
                  {index === 0 ? 'Host' : 'Participant'}
                </p>
              </div>

              <div className="flex items-center gap-1">
                <div className="p-1">
                  <Mic className="w-4 h-4 text-green-500" />
                </div>
                <div className="p-1">
                  <Video className="w-4 h-4 text-green-500" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};