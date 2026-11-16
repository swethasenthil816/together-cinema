import React, { useState } from 'react';
import { User, Heart, Mail, Save, Film, Clock, Award, Sparkles, Check } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const AVATAR_OPTIONS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
];

export const ProfilePage = () => {
  const { user, updateProfile } = useAuth();

  const [name, setName] = useState(user?.name || '');
  const [partnerNickname, setPartnerNickname] = useState(user?.partnerNickname || 'My Darling ❤️');
  const [avatar, setAvatar] = useState(user?.avatar || AVATAR_OPTIONS[0]);
  const [isSaved, setIsSaved] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await updateProfile({ name, partnerNickname, avatar });
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 2500);
    } catch (err) {
      console.error('Update profile error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-cinema-darkest text-white pb-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-8">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-romantic-pink/15 text-romantic-pink text-xs font-semibold mb-2">
            <Sparkles className="w-3.5 h-3.5" /> Couple Account Settings
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight">Your Cinema Profile</h1>
          <p className="text-xs text-cinema-muted mt-1">
            Manage your personal profile and romantic details for Together Cinema.
          </p>
        </div>

        {/* Couple Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-5 rounded-2xl bg-cinema-darker border border-white/10 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-netflix-red/20 text-netflix-red flex items-center justify-center shrink-0">
              <Film className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xl font-bold text-white">14</p>
              <p className="text-xs text-cinema-muted">Movie Dates Enjoyed</p>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-cinema-darker border border-white/10 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-romantic-pink/20 text-romantic-pink flex items-center justify-center shrink-0">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xl font-bold text-white">32.5 hrs</p>
              <p className="text-xs text-cinema-muted">Watched Together</p>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-cinema-darker border border-white/10 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xl font-bold text-white">Romantic VIP</p>
              <p className="text-xs text-cinema-muted">Cinema Status</p>
            </div>
          </div>
        </div>

        {/* Profile Edit Form */}
        <div className="glass-card rounded-3xl border border-white/10 p-8 shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Avatar picker */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-cinema-muted mb-3">
                Choose Profile Avatar
              </label>
              <div className="flex flex-wrap items-center gap-4">
                {AVATAR_OPTIONS.map((imgUrl, i) => (
                  <img
                    key={i}
                    src={imgUrl}
                    alt={`Avatar ${i + 1}`}
                    onClick={() => setAvatar(imgUrl)}
                    className={`w-14 h-14 rounded-full object-cover cursor-pointer transition-all ${
                      avatar === imgUrl
                        ? 'border-3 border-romantic-pink scale-110 shadow-lg neon-pink-glow'
                        : 'opacity-50 hover:opacity-100'
                    }`}
                  />
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-cinema-muted mb-1.5">
                  Your Display Name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-cinema-muted" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-cinema-darker border border-white/10 text-white text-sm focus:outline-none focus:border-romantic-pink"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-cinema-muted mb-1.5">
                  Email Address (Read Only)
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-cinema-muted" />
                  <input
                    type="email"
                    value={user?.email || ''}
                    disabled
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-cinema-darker/60 border border-white/5 text-cinema-muted text-sm cursor-not-allowed"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-cinema-muted mb-1.5">
                Partner Nickname (Shown on your movie invitations)
              </label>
              <div className="relative max-w-md">
                <Heart className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-romantic-pink" />
                <input
                  type="text"
                  value={partnerNickname}
                  onChange={(e) => setPartnerNickname(e.target.value)}
                  placeholder="e.g. My Soulmate ❤️"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-cinema-darker border border-white/10 text-white text-sm focus:outline-none focus:border-romantic-pink"
                />
              </div>
            </div>

            <div className="pt-2 flex items-center gap-3">
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-netflix-red to-romantic-pink text-white text-xs font-bold shadow-lg hover:brightness-110 flex items-center gap-2 cursor-pointer transition-all disabled:opacity-50"
              >
                {isSaved ? <Check className="w-4 h-4 text-white" /> : <Save className="w-4 h-4" />}
                <span>{isSaved ? 'Changes Saved!' : 'Save Profile Changes'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
