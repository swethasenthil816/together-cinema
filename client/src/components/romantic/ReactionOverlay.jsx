import React, { useEffect, useState } from 'react';
import { Heart, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';

export const ReactionOverlay = ({ lastReaction }) => {
  const [visible, setVisible] = useState(false);
  const [data, setData] = useState(null);

  useEffect(() => {
    if (!lastReaction) return;

    setData(lastReaction);
    setVisible(true);

    // If heart or sparkle, trigger romantic canvas confetti
    if (['heart', 'kiss', 'sparkle'].includes(lastReaction.reactionType)) {
      try {
        confetti({
          particleCount: 25,
          spread: 60,
          origin: { y: 0.8 },
          colors: ['#E50914', '#ff3366', '#ff758c', '#ffffff'],
        });
      } catch (e) {
        // Fallback gracefully
      }
    }

    const timer = setTimeout(() => {
      setVisible(false);
    }, 2800);

    return () => clearTimeout(timer);
  }, [lastReaction]);

  if (!visible || !data) return null;

  const emojiMap = {
    heart: '❤️',
    kiss: '💋',
    sparkle: '✨',
    popcorn: '🍿',
    laugh: '😂',
    cry: '🥹',
    hug: '🫂',
  };

  const emoji = emojiMap[data.reactionType] || '❤️';

  return (
    <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 pointer-events-none transition-all duration-300">
      <div className="flex items-center gap-3 px-5 py-2.5 rounded-full bg-black/85 backdrop-blur-md border border-romantic-pink/40 shadow-2xl neon-pink-glow animate-bounce">
        <span className="text-2xl">{emoji}</span>
        <div className="flex items-center gap-1.5 text-sm font-medium text-white">
          <span className="text-romantic-pink font-semibold">{data.senderName || 'Your Partner'}</span>
          <span>sent love!</span>
        </div>
      </div>
    </div>
  );
};

export default ReactionOverlay;
