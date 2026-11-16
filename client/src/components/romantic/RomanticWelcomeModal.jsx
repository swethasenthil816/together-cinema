import React, { useEffect, useState } from 'react';
import { Heart, Sparkles, Film, Popcorn } from 'lucide-react';
import confetti from 'canvas-confetti';

export const RomanticWelcomeModal = ({ bothJoinedData, onClose }) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (bothJoinedData) {
      setVisible(true);

      try {
        confetti({
          particleCount: 50,
          spread: 80,
          origin: { y: 0.6 },
          colors: ['#E50914', '#ff3366', '#ffffff', '#ffd700'],
        });
      } catch (e) {
        // Fallback
      }

      const timer = setTimeout(() => {
        setVisible(false);
        if (onClose) onClose();
      }, 5500);

      return () => clearTimeout(timer);
    }
  }, [bothJoinedData, onClose]);

  if (!visible || !bothJoinedData) return null;

  const users = bothJoinedData.users || [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative max-w-md w-full glass-card border border-romantic-pink/40 rounded-3xl p-8 text-center shadow-2xl neon-pink-glow overflow-hidden">
        {/* Glow ambient background */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-48 bg-gradient-to-b from-romantic-pink/30 to-transparent rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10">
          {/* Couple Avatars Connected with a Glowing Heart */}
          <div className="flex items-center justify-center gap-4 mb-6">
            <div className="relative">
              <img
                src={users[0]?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120'}
                alt={users[0]?.name}
                className="w-16 h-16 rounded-full border-2 border-netflix-red object-cover shadow-lg"
              />
              <span className="absolute bottom-0 right-0 w-4 h-4 bg-emerald-500 border-2 border-cinema-darkest rounded-full" />
            </div>

            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-netflix-red to-romantic-pink flex items-center justify-center text-white shadow-md animate-heart-beat">
              <Heart className="w-5 h-5 fill-current" />
            </div>

            <div className="relative">
              <img
                src={users[1]?.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120'}
                alt={users[1]?.name}
                className="w-16 h-16 rounded-full border-2 border-romantic-pink object-cover shadow-lg"
              />
              <span className="absolute bottom-0 right-0 w-4 h-4 bg-emerald-500 border-2 border-cinema-darkest rounded-full" />
            </div>
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-romantic-pink/20 text-romantic-pink text-xs font-semibold mb-3">
            <Sparkles className="w-3.5 h-3.5" /> Both Partners Connected
          </div>

          <h2 className="text-2xl font-black text-white tracking-tight mb-2">
            Your Movie Date Has Begun! ❤️
          </h2>

          <p className="text-sm text-cinema-muted mb-6 leading-relaxed">
            You and <span className="text-white font-semibold">{users[1]?.name || 'your partner'}</span> are synchronized in real-time. Grab some snacks, turn on your webcams, and enjoy the show!
          </p>

          <div className="flex items-center justify-center gap-3">
            <button
              onClick={() => {
                setVisible(false);
                if (onClose) onClose();
              }}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-netflix-red to-romantic-pink text-white font-semibold text-sm shadow-lg hover:brightness-110 transition-all cursor-pointer"
            >
              Start Watching 🍿
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RomanticWelcomeModal;
