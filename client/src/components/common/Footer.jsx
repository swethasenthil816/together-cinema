import React from 'react';
import { Heart, Film, Shield, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Footer = () => {
  return (
    <footer className="w-full bg-cinema-darkest border-t border-white/5 py-10 px-4 sm:px-6 lg:px-8 text-cinema-muted">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-netflix-red to-romantic-pink flex items-center justify-center text-white shadow-md">
            <Heart className="w-4 h-4 fill-current" />
          </div>
          <div>
            <span className="text-sm font-black text-white uppercase tracking-tight">
              TOGETHER <span className="text-netflix-red">CINEMA</span> ❤️
            </span>
            <p className="text-[11px] text-cinema-muted">
              Private 2-person synchronized movie dates across any distance.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-6 text-xs">
          <Link to="/library" className="hover:text-white transition-colors">Shared Library</Link>
          <Link to="/rooms/create" className="hover:text-white transition-colors">Private Rooms</Link>
          <Link to="/settings" className="hover:text-white transition-colors">Audio/Video Check</Link>
          <span className="flex items-center gap-1 text-emerald-400">
            <Shield className="w-3.5 h-3.5" /> End-to-End Private
          </span>
        </div>

        <p className="text-xs text-cinema-muted">
          Made with love for cinema dates • 2026
        </p>
      </div>
    </footer>
  );
};

export default Footer;
