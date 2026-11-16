import React, { useState, useEffect } from 'react';
import { Clock, Calendar, Heart, Sparkles } from 'lucide-react';

export const RomanticDateCountdown = ({ partnerName }) => {
  // Saved or upcoming movie date target
  const [targetDate, setTargetDate] = useState(() => {
    const saved = localStorage.getItem('together_cinema_date_target');
    if (saved) return new Date(saved);
    // Default: Today 8:00 PM
    const now = new Date();
    const tonight = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 20, 0, 0);
    if (now > tonight) {
      tonight.setDate(tonight.getDate() + 1);
    }
    return tonight;
  });

  const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0 });
  const [isEditing, setIsEditing] = useState(false);
  const [dateInput, setDateInput] = useState('');

  useEffect(() => {
    const calculate = () => {
      const now = new Date();
      const diff = targetDate - now;

      if (diff <= 0) {
        setTimeLeft({ hours: 0, minutes: 0, seconds: 0, isNow: true });
        return;
      }

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeLeft({ hours, minutes, seconds, isNow: false });
    };

    calculate();
    const interval = setInterval(calculate, 1000);
    return () => clearInterval(interval);
  }, [targetDate]);

  const handleSaveDate = (e) => {
    e.preventDefault();
    if (!dateInput) return;
    const newTarget = new Date(dateInput);
    setTargetDate(newTarget);
    localStorage.setItem('together_cinema_date_target', newTarget.toISOString());
    setIsEditing(false);
  };

  return (
    <div className="glass-panel rounded-2xl p-6 border border-white/10 relative overflow-hidden">
      {/* Background romantic glow */}
      <div className="absolute -top-10 -right-10 w-44 h-44 bg-romantic-pink/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-10 -left-10 w-44 h-44 bg-netflix-red/15 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-netflix-red to-romantic-pink flex items-center justify-center text-white shadow-lg neon-red-glow animate-heart-beat">
            <Heart className="w-7 h-7 fill-current" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase tracking-wider font-semibold text-romantic-pink flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" /> Next Movie Date
              </span>
            </div>
            <h3 className="text-xl font-bold text-white tracking-tight">
              Virtual Cinema with {partnerName || 'Your Partner ❤️'}
            </h3>
            <p className="text-xs text-cinema-muted mt-0.5">
              Scheduled for {targetDate.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>
        </div>

        {/* Countdown Timers */}
        <div className="flex items-center gap-3">
          <div className="flex flex-col items-center bg-cinema-darkest/70 border border-white/10 rounded-xl px-4 py-2.5 min-w-[70px]">
            <span className="text-2xl font-black text-white font-mono">
              {String(timeLeft.hours).padStart(2, '0')}
            </span>
            <span className="text-[10px] uppercase tracking-wider text-cinema-muted">Hours</span>
          </div>
          <span className="text-2xl font-bold text-romantic-pink animate-pulse">:</span>
          <div className="flex flex-col items-center bg-cinema-darkest/70 border border-white/10 rounded-xl px-4 py-2.5 min-w-[70px]">
            <span className="text-2xl font-black text-white font-mono">
              {String(timeLeft.minutes).padStart(2, '0')}
            </span>
            <span className="text-[10px] uppercase tracking-wider text-cinema-muted">Mins</span>
          </div>
          <span className="text-2xl font-bold text-romantic-pink animate-pulse">:</span>
          <div className="flex flex-col items-center bg-cinema-darkest/70 border border-white/10 rounded-xl px-4 py-2.5 min-w-[70px]">
            <span className="text-2xl font-black text-romantic-pink font-mono">
              {String(timeLeft.seconds).padStart(2, '0')}
            </span>
            <span className="text-[10px] uppercase tracking-wider text-cinema-muted">Secs</span>
          </div>

          <button
            onClick={() => setIsEditing(!isEditing)}
            className="ml-2 p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-cinema-muted hover:text-white transition-colors"
            title="Reschedule movie date"
          >
            <Calendar className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Date Picker Modal/Input */}
      {isEditing && (
        <form onSubmit={handleSaveDate} className="mt-4 pt-4 border-t border-white/10 flex items-center gap-3">
          <input
            type="datetime-local"
            value={dateInput}
            onChange={(e) => setDateInput(e.target.value)}
            className="px-3 py-2 rounded-lg bg-cinema-darker border border-white/20 text-white text-xs focus:outline-none focus:border-romantic-pink"
            required
          />
          <button
            type="submit"
            className="px-4 py-2 bg-gradient-to-r from-netflix-red to-romantic-pink rounded-lg text-xs font-semibold text-white hover:opacity-95"
          >
            Update Date
          </button>
          <button
            type="button"
            onClick={() => setIsEditing(false)}
            className="px-3 py-2 bg-white/5 rounded-lg text-xs text-cinema-muted hover:text-white"
          >
            Cancel
          </button>
        </form>
      )}
    </div>
  );
};

export default RomanticDateCountdown;
