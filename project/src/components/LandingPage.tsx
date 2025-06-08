import React, { useState } from 'react';
import { Video, Headphones, MessageCircle, Sparkles } from 'lucide-react';

interface LandingPageProps {
  onJoinCall: (name: string, roomId: string) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onJoinCall }) => {
  const [name, setName] = useState('');
  const [roomId, setRoomId] = useState('');

  const generateRoomId = () => {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 8; i++) {
      result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    setRoomId(result);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim() && roomId.trim()) {
      onJoinCall(name.trim(), roomId.trim().toUpperCase());
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo and Title */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r from-pink-500 to-purple-600 mb-6">
            <Video className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">VideoChat Pro</h1>
          <p className="text-blue-200 text-lg">Beautiful video calling made simple</p>
        </div>

        {/* Main Form */}
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20 shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name Input */}
            <div>
              <label className="block text-white text-sm font-medium mb-2">
                Your Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name"
                className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all duration-200"
                required
              />
            </div>

            {/* Room ID Input */}
            <div>
              <label className="block text-white text-sm font-medium mb-2">
                Room ID
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={roomId}
                  onChange={(e) => setRoomId(e.target.value.toUpperCase())}
                  placeholder="Enter room ID"
                  className="flex-1 px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all duration-200"
                  required
                />
                <button
                  type="button"
                  onClick={generateRoomId}
                  className="px-4 py-3 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 text-white hover:from-pink-600 hover:to-purple-700 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-pink-500"
                >
                  <Sparkles className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Join Button */}
            <button
              type="submit"
              className="w-full py-4 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 text-white font-semibold text-lg hover:from-pink-600 hover:to-purple-700 transform hover:scale-105 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-pink-500 shadow-lg"
            >
              <div className="flex items-center justify-center gap-2">
                <Video className="w-5 h-5" />
                Join Call
              </div>
            </button>
          </form>

          {/* Features */}
          <div className="mt-8 pt-6 border-t border-white/20">
            <div className="flex items-center justify-center gap-6 text-sm text-white/80">
              <div className="flex items-center gap-1">
                <Video className="w-4 h-4" />
                <span>HD Video</span>
              </div>
              <div className="w-1 h-1 rounded-full bg-white/40"></div>
              <div className="flex items-center gap-1">
                <Headphones className="w-4 h-4" />
                <span>Crystal Clear Audio</span>
              </div>
              <div className="w-1 h-1 rounded-full bg-white/40"></div>
              <div className="flex items-center gap-1">
                <MessageCircle className="w-4 h-4" />
                <span>Real-time Chat</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};