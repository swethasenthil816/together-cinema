import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Heart,
  Play,
  Film,
  Video,
  MessageCircle,
  Clock,
  Shield,
  Sparkles,
  Users,
  CheckCircle2,
  Tv
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const LandingPage = () => {
  const { isAuthenticated, demoLogin } = useAuth();
  const navigate = useNavigate();

  const handleQuickDemo = async (role) => {
    try {
      await demoLogin(role);
      navigate('/dashboard');
    } catch (err) {
      console.error('Demo login error:', err);
    }
  };

  return (
    <div className="relative min-h-screen bg-cinema-darkest overflow-hidden text-white">
      {/* Background Hero Movie Backdrop with Netflix Dark Gradient */}
      <div className="absolute inset-0 z-0">
        <img
          src="https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?w=1920&auto=format&fit=crop&q=80"
          alt="Cinema Romance"
          className="w-full h-full object-cover opacity-25 filter blur-xs"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-cinema-darkest via-cinema-darkest/80 to-black/60" />
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-netflix-red/20 rounded-full blur-[140px] pointer-events-none" />
        <div className="absolute top-1/2 right-1/4 w-[400px] h-[400px] bg-romantic-pink/15 rounded-full blur-[120px] pointer-events-none" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-24">
        {/* Hero Section */}
        <div className="text-center max-w-3xl mx-auto pt-8 md:pt-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-md mb-6">
            <span className="w-2 h-2 rounded-full bg-netflix-red animate-pulse" />
            <span className="text-xs uppercase tracking-widest text-romantic-pink font-bold flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" /> Long-Distance Movie Dates For Two
            </span>
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight leading-tight">
            Watch Movies Together. <br />
            <span className="bg-gradient-to-r from-netflix-red via-romantic-pink to-rose-400 bg-clip-text text-transparent">
              Feel Miles Closer. ❤️
            </span>
          </h1>

          <p className="mt-6 text-base sm:text-lg text-cinema-muted leading-relaxed max-w-2xl mx-auto">
            A private cinema sanctuary created exclusively for two. Synchronize movies down to the millisecond, talk with live HD video and audio, and share every laugh, tear, and heartbeat.
          </p>

          {/* Call to Actions */}
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            {isAuthenticated ? (
              <Link
                to="/dashboard"
                className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-netflix-red to-romantic-pink text-white font-bold text-sm shadow-xl neon-red-glow hover:brightness-110 transition-all flex items-center justify-center gap-2"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>Go to Your Cinema Dashboard</span>
              </Link>
            ) : (
              <>
                <Link
                  to="/register"
                  className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-netflix-red hover:bg-netflix-hover text-white font-bold text-sm shadow-xl neon-red-glow hover:scale-105 transition-all flex items-center justify-center gap-2"
                >
                  <Heart className="w-4 h-4 fill-current" />
                  <span>Start Your Movie Date</span>
                </Link>

                <Link
                  to="/rooms/join"
                  className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/15 text-white font-bold text-sm backdrop-blur-md transition-all flex items-center justify-center gap-2"
                >
                  <span>Enter Room Code</span>
                </Link>
              </>
            )}
          </div>
        </div>

        {/* Feature Cards Grid */}
        <div className="mt-28 grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Feature 1 */}
          <div className="glass-card p-8 rounded-3xl border border-white/10 relative overflow-hidden group hover:border-netflix-red/50 transition-all">
            <div className="w-12 h-12 rounded-2xl bg-netflix-red/20 text-netflix-red flex items-center justify-center mb-6">
              <Tv className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Millisecond Sync</h3>
            <p className="text-sm text-cinema-muted leading-relaxed">
              Play, pause, seek, and speed changes synchronize instantly between both screens. Network latency compensation prevents drift so you never spoil a moment.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="glass-card p-8 rounded-3xl border border-white/10 relative overflow-hidden group hover:border-romantic-pink/50 transition-all">
            <div className="w-12 h-12 rounded-2xl bg-romantic-pink/20 text-romantic-pink flex items-center justify-center mb-6">
              <Video className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Live WebRTC Video Calling</h3>
            <p className="text-sm text-cinema-muted leading-relaxed">
              Crystal-clear low-latency video and audio calling. See their face light up during the romantic scenes with picture-in-picture dual webcam screens.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="glass-card p-8 rounded-3xl border border-white/10 relative overflow-hidden group hover:border-white/30 transition-all">
            <div className="w-12 h-12 rounded-2xl bg-white/10 text-white flex items-center justify-center mb-6">
              <Film className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">3+ Hour Extended Movies</h3>
            <p className="text-sm text-cinema-muted leading-relaxed">
              Powered by HTTP 206 Partial Content Range streaming. Upload your favorite MP4 or WebM movies and seek seamlessly across full multi-hour films without lag.
            </p>
          </div>
        </div>

        {/* Guarantee Banner */}
        <div className="mt-20 p-8 rounded-3xl bg-gradient-to-r from-cinema-darker via-cinema-card to-cinema-darker border border-white/10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
              <Shield className="w-7 h-7" />
            </div>
            <div>
              <h4 className="text-lg font-bold text-white">Private Two-Person Rooms</h4>
              <p className="text-xs text-cinema-muted mt-0.5">
                Each room is strictly locked to exactly two partners. Unauthorized guests cannot join your private date.
              </p>
            </div>
          </div>
          <Link
            to="/rooms/create"
            className="px-6 py-3 rounded-xl bg-white text-black font-bold text-xs hover:bg-gray-200 transition-colors shrink-0"
          >
            Create Your Room Now
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
