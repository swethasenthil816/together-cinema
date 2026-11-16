import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { DoorOpen, ArrowRight, AlertCircle, Heart, Shield } from 'lucide-react';
import { roomApi } from '../services/api';
import { useAuth } from '../context/AuthContext';

export const JoinRoomPage = () => {
  const [searchParams] = useSearchParams();
  const urlCode = searchParams.get('code') || '';

  const [code, setCode] = useState(urlCode);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleJoin = async (e) => {
    if (e) e.preventDefault();
    if (!code.trim()) {
      setError('Please enter a valid 6-character room code.');
      return;
    }

    setError(null);
    setLoading(true);

    try {
      const res = await roomApi.join(code.trim().toUpperCase());
      navigate(`/room/${res.room.id}`);
    } catch (err) {
      if (err.data?.code === 'ROOM_FULL') {
        setError('This private room is already full (maximum 2 partners allowed).');
      } else {
        setError(err.message || 'Room not found. Check the code and try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Auto-attempt join if code is provided in query parameter
  useEffect(() => {
    if (urlCode && isAuthenticated) {
      handleJoin();
    }
  }, [urlCode, isAuthenticated]);

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 bg-cinema-darkest relative overflow-hidden">
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-romantic-pink/10 rounded-full blur-[140px] pointer-events-none" />

      <div className="relative w-full max-w-md glass-card border border-white/10 rounded-3xl p-8 shadow-2xl">
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-netflix-red to-romantic-pink flex items-center justify-center text-white shadow-lg neon-red-glow mx-auto mb-3 animate-heart-beat">
            <DoorOpen className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">Join Private Room</h1>
          <p className="text-xs text-cinema-muted mt-1">
            Enter the 6-character invitation code from your partner ❤️
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-netflix-red/20 border border-netflix-red/30 flex items-center gap-2 text-xs text-red-200">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleJoin} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-cinema-muted mb-1.5 text-center">
              Room Invitation Code
            </label>
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="e.g. TOG123"
              maxLength={8}
              required
              className="w-full text-center tracking-widest text-2xl font-black font-mono py-3 rounded-2xl bg-cinema-darker border border-white/15 text-romantic-pink focus:outline-none focus:border-romantic-pink uppercase shadow-inner"
            />
          </div>

          <div className="p-3 rounded-xl bg-white/5 border border-white/5 flex items-center gap-3 text-xs text-cinema-muted">
            <Shield className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Rooms are strictly limited to two partners for full privacy.</span>
          </div>

          <button
            type="submit"
            disabled={loading || !code.trim()}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-netflix-red to-romantic-pink hover:brightness-110 text-white text-xs font-bold shadow-xl neon-red-glow transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <span>{loading ? 'Entering Cinema...' : 'Enter Private Room'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};

export default JoinRoomPage;
