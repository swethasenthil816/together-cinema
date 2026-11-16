import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Heart, Mail, Lock, AlertCircle, ArrowRight, Sparkles, Users } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const { login, demoLogin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/dashboard';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await login(email, password);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.message || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemo = async (role) => {
    try {
      setLoading(true);
      await demoLogin(role);
      navigate(from, { replace: true });
    } catch (err) {
      setError('Demo login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 bg-cinema-darkest relative overflow-hidden">
      {/* Ambient background glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-netflix-red/10 rounded-full blur-[140px] pointer-events-none" />

      <div className="relative w-full max-w-md glass-card border border-white/10 rounded-3xl p-8 shadow-2xl">
        {/* Brand header */}
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-netflix-red to-romantic-pink flex items-center justify-center text-white shadow-lg neon-red-glow mx-auto mb-4 animate-heart-beat">
            <Heart className="w-6 h-6 fill-current" />
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">Welcome Back</h1>
          <p className="text-xs text-cinema-muted mt-1">
            Sign in to start your private movie date with your partner ❤️
          </p>
        </div>

        {error && (
          <div className="mb-6 p-3 rounded-xl bg-netflix-red/20 border border-netflix-red/30 flex items-center gap-2 text-xs text-red-200">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
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
                placeholder="you@cinema.com"
                required
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-cinema-darker border border-white/10 text-white text-sm focus:outline-none focus:border-romantic-pink placeholder:text-cinema-muted/50"
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-cinema-muted">
                Password
              </label>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-cinema-muted" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-cinema-darker border border-white/10 text-white text-sm focus:outline-none focus:border-romantic-pink placeholder:text-cinema-muted/50"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3 rounded-xl bg-gradient-to-r from-netflix-red to-romantic-pink hover:brightness-110 text-white text-xs font-bold shadow-lg neon-red-glow transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <span>{loading ? 'Signing in...' : 'Sign In to Cinema'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* 1-Click Instant Demo Login for Testing */}
        <div className="mt-6 pt-6 border-t border-white/10">
          <p className="text-[11px] text-center text-cinema-muted uppercase tracking-wider font-semibold mb-3 flex items-center justify-center gap-1.5">
            <Users className="w-3.5 h-3.5 text-romantic-pink" /> 1-Click Test Partners
          </p>
          <div className="grid grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={() => handleDemo('partner1')}
              disabled={loading}
              className="px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold text-white hover:text-romantic-pink transition-all text-center cursor-pointer"
            >
              Partner 1 (Alex)
            </button>
            <button
              type="button"
              onClick={() => handleDemo('partner2')}
              disabled={loading}
              className="px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold text-white hover:text-romantic-pink transition-all text-center cursor-pointer"
            >
              Partner 2 (Sam)
            </button>
          </div>
        </div>

        <p className="mt-6 text-center text-xs text-cinema-muted">
          Don't have an account yet?{' '}
          <Link to="/register" className="text-romantic-pink hover:underline font-semibold">
            Create cinema account
          </Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
