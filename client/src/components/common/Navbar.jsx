import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Heart,
  Film,
  PlusCircle,
  LogIn,
  User,
  Settings,
  LogOut,
  DoorOpen,
  Menu,
  X,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (path) => location.pathname === path;

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="sticky top-0 z-40 w-full bg-cinema-darkest/90 backdrop-blur-xl border-b border-white/10 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-netflix-red to-romantic-pink flex items-center justify-center text-white shadow-lg neon-red-glow group-hover:scale-105 transition-transform">
            <Heart className="w-5 h-5 fill-current" />
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-black tracking-tighter text-white uppercase flex items-center gap-1">
              TOGETHER <span className="text-netflix-red">CINEMA</span>
            </span>
            <span className="text-[9px] uppercase tracking-widest text-romantic-pink font-semibold -mt-1">
              Virtual Movie Date
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <div className="hidden md:flex items-center gap-1 lg:gap-2">
          {isAuthenticated ? (
            <>
              <Link
                to="/dashboard"
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  isActive('/dashboard')
                    ? 'bg-white/10 text-white'
                    : 'text-cinema-muted hover:text-white hover:bg-white/5'
                }`}
              >
                Dashboard
              </Link>

              <Link
                to="/library"
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
                  isActive('/library')
                    ? 'bg-white/10 text-white'
                    : 'text-cinema-muted hover:text-white hover:bg-white/5'
                }`}
              >
                <Film className="w-3.5 h-3.5" />
                <span>Shared Library</span>
              </Link>

              <Link
                to="/rooms/create"
                className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-netflix-red to-romantic-pink text-white text-xs font-bold shadow-md hover:brightness-110 flex items-center gap-1.5 ml-2"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>New Movie Room</span>
              </Link>

              <Link
                to="/rooms/join"
                className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-cinema-text text-xs font-semibold flex items-center gap-1.5"
              >
                <DoorOpen className="w-3.5 h-3.5" />
                <span>Join Code</span>
              </Link>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="px-4 py-1.5 text-xs font-semibold text-cinema-muted hover:text-white transition-colors"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="px-4 py-1.5 rounded-xl bg-netflix-red hover:bg-netflix-hover text-white text-xs font-bold transition-all shadow-md neon-red-glow"
              >
                Start Free Date
              </Link>
            </>
          )}
        </div>

        {/* User Profile & Settings / Demo Login Button */}
        <div className="hidden md:flex items-center gap-3">
          {isAuthenticated ? (
            <div className="flex items-center gap-2.5 pl-2 border-l border-white/10">
              <Link
                to="/profile"
                className="flex items-center gap-2 group p-1 pr-2 rounded-xl hover:bg-white/5 transition-colors"
              >
                <img
                  src={user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
                  alt={user?.name}
                  className="w-8 h-8 rounded-full border border-romantic-pink/50 object-cover"
                />
                <div className="text-left">
                  <p className="text-xs font-bold text-white group-hover:text-romantic-pink transition-colors">
                    {user?.name?.split(' ')[0]}
                  </p>
                  <p className="text-[10px] text-cinema-muted -mt-0.5">
                    {user?.partnerNickname || 'Partner ❤️'}
                  </p>
                </div>
              </Link>

              <Link
                to="/settings"
                className="p-2 rounded-xl text-cinema-muted hover:text-white hover:bg-white/5 transition-colors"
                title="Settings & Audio/Video setup"
              >
                <Settings className="w-4 h-4" />
              </Link>

              <button
                onClick={handleLogout}
                className="p-2 rounded-xl text-cinema-muted hover:text-netflix-red hover:bg-netflix-red/10 transition-colors"
                title="Logout"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : null}
        </div>

        {/* Mobile menu trigger */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 rounded-xl bg-white/5 text-cinema-muted hover:text-white"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden px-4 pt-2 pb-4 bg-cinema-darker border-b border-white/10 space-y-2">
          {isAuthenticated ? (
            <>
              <div className="flex items-center gap-3 py-2 border-b border-white/10 mb-2">
                <img
                  src={user?.avatar}
                  alt={user?.name}
                  className="w-9 h-9 rounded-full border border-romantic-pink"
                />
                <div>
                  <p className="text-sm font-bold text-white">{user?.name}</p>
                  <p className="text-xs text-cinema-muted">{user?.email}</p>
                </div>
              </div>

              <Link
                to="/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-sm text-cinema-text hover:bg-white/5"
              >
                Dashboard
              </Link>
              <Link
                to="/library"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-sm text-cinema-text hover:bg-white/5"
              >
                Shared Movie Library
              </Link>
              <Link
                to="/rooms/create"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-sm font-semibold text-romantic-pink hover:bg-white/5"
              >
                Create Private Room
              </Link>
              <Link
                to="/rooms/join"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-sm text-cinema-text hover:bg-white/5"
              >
                Join with Room Code
              </Link>
              <Link
                to="/profile"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-sm text-cinema-text hover:bg-white/5"
              >
                Couple Profile
              </Link>
              <Link
                to="/settings"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-sm text-cinema-text hover:bg-white/5"
              >
                Settings
              </Link>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleLogout();
                }}
                className="w-full text-left px-3 py-2 rounded-lg text-sm text-netflix-red hover:bg-netflix-red/10"
              >
                Logout
              </button>
            </>
          ) : (
            <div className="space-y-2 pt-2">
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="block w-full py-2.5 text-center rounded-xl bg-white/5 text-sm font-semibold text-white"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="block w-full py-2.5 text-center rounded-xl bg-netflix-red text-sm font-bold text-white shadow-md"
              >
                Register
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
