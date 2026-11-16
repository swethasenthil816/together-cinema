import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Heart, Mail, Lock, User, Sparkles, AlertCircle, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const AVATAR_OPTIONS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
];

export const RegisterPage = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [partnerNickname, setPartnerNickname] = useState('My Sweetheart ❤️');
  const [selectedAvatar, setSelectedAvatar] = useState(AVATAR_OPTIONS[0]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    try {
      await register({
        name,
        email,
        password,
        avatar: selectedAvatar,
        partnerNickname,
      });
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 bg-cinema-darkest relative overflow-hidden">
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-romantic-pink/10 rounded-full blur-[140px] pointer-events-none" />

      <div className="relative w-full max-w-md glass-card border border-white/10 rounded-3xl p-8 shadow-2xl">
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-netflix-red to-romantic-pink flex items-center justify-center text-white shadow-lg neon-red-glow mx-auto mb-3 animate-heart-beat">
            <Heart className="w-6 h-6 fill-current" />
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">Create Couple Account</h1>
          <p className="text-xs text-cinema-muted mt-1">
            Set up your private cinema account to invite your favorite person ❤️
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-netflix-red/20 border border-netflix-red/30 flex items-center gap-2 text-xs text-red-200">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Avatar selector */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-cinema-muted mb-2">
              Select Your Avatar
            </label>
            <div className="flex items-center justify-center gap-3">
              {AVATAR_OPTIONS.map((imgUrl, i) => (
                <img
                  key={i}
                  src={imgUrl}
                  alt={`Avatar option ${i + 1}`}
                  onClick={() => setSelectedAvatar(imgUrl)}
                  className={`w-11 h-11 rounded-full object-cover cursor-pointer transition-transform ${
                    selectedAvatar === imgUrl
                      ? 'border-2 border-romantic-pink scale-110 shadow-lg neon-pink-glow'
                      : 'opacity-60 hover:opacity-100'
                  }`}
                />
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-cinema-muted mb-1.5">
              Your Name
            </label>
            <div className="relative">
              <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-cinema-muted" />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Swetha"
                required
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-cinema-darker border border-white/10 text-white text-sm focus:outline-none focus:border-romantic-pink"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-cinema-muted mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-cinema-muted" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@email.com"
                required
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-cinema-darker border border-white/10 text-white text-sm focus:outline-none focus:border-romantic-pink"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-cinema-muted mb-1.5">
              Password (6+ chars)
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-cinema-muted" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-cinema-darker border border-white/10 text-white text-sm focus:outline-none focus:border-romantic-pink"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-cinema-muted mb-1.5">
              Partner Nickname
            </label>
            <div className="relative">
              <Heart className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-romantic-pink" />
              <input
                type="text"
                value={partnerNickname}
                onChange={(e) => setPartnerNickname(e.target.value)}
                placeholder="e.g. My Darling ❤️"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-cinema-darker border border-white/10 text-white text-sm focus:outline-none focus:border-romantic-pink"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3 rounded-xl bg-gradient-to-r from-netflix-red to-romantic-pink hover:brightness-110 text-white text-xs font-bold shadow-lg neon-red-glow transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <span>{loading ? 'Creating Account...' : 'Start Virtual Date'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-cinema-muted">
          Already have an account?{' '}
          <Link to="/login" className="text-romantic-pink hover:underline font-semibold">
            Sign in here
          </Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;
