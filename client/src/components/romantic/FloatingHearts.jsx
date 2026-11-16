import React, { useEffect, useState } from 'react';

const EMOJI_POOL = ['❤️', '💖', '💕', '✨', '🍿', '💋', '🥰', '🌹'];

export const FloatingHearts = ({ triggerCount, reactionType }) => {
  const [particles, setParticles] = useState([]);

  useEffect(() => {
    if (triggerCount === 0) return;

    const emoji = reactionType === 'popcorn' ? '🍿'
      : reactionType === 'kiss' ? '💋'
      : reactionType === 'sparkle' ? '✨'
      : reactionType === 'laugh' ? '😂'
      : reactionType === 'cry' ? '🥹'
      : EMOJI_POOL[Math.floor(Math.random() * EMOJI_POOL.length)];

    const id = Date.now() + Math.random();
    const leftPercent = 10 + Math.random() * 80;
    const duration = 2.2 + Math.random() * 1.2;
    const scale = 0.8 + Math.random() * 0.8;

    const newParticle = { id, emoji, leftPercent, duration, scale };
    setParticles((prev) => [...prev, newParticle]);

    const timer = setTimeout(() => {
      setParticles((prev) => prev.filter((p) => p.id !== id));
    }, duration * 1000);

    return () => clearTimeout(timer);
  }, [triggerCount, reactionType]);

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {particles.map((p) => (
        <span
          key={p.id}
          className="absolute bottom-10 select-none animate-float-heart"
          style={{
            left: `${p.leftPercent}%`,
            fontSize: `${28 * p.scale}px`,
            animation: `floatUp ${p.duration}s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards`,
            filter: 'drop-shadow(0 0 12px rgba(255, 51, 102, 0.6))',
          }}
        >
          {p.emoji}
        </span>
      ))}
    </div>
  );
};

export default FloatingHearts;
