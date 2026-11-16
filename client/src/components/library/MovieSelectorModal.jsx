import React, { useState, useEffect } from 'react';
import { X, Search, Film, Check } from 'lucide-react';
import { movieApi } from '../../services/api';

export const MovieSelectorModal = ({
  isOpen,
  onClose,
  currentMovieId,
  onSelectMovie
}) => {
  const [movies, setMovies] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isOpen) return;

    const fetchMovies = async () => {
      try {
        setLoading(true);
        const res = await movieApi.getAll(search);
        setMovies(res.movies || []);
      } catch (err) {
        console.error('Error fetching movies:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchMovies();
  }, [isOpen, search]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-2xl max-h-[85vh] glass-card border border-white/10 rounded-3xl p-6 flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-netflix-red/20 text-netflix-red flex items-center justify-center">
              <Film className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-white">Switch Movie</h2>
              <p className="text-xs text-cinema-muted">Select a movie from your shared library to stream together</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-cinema-muted hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search */}
        <div className="mt-4 relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-cinema-muted" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search movie title or genre..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-cinema-darker border border-white/10 text-white text-xs focus:outline-none focus:border-romantic-pink"
          />
        </div>

        {/* Movie Grid */}
        <div className="mt-4 flex-1 overflow-y-auto space-y-2.5 pr-1">
          {movies.map((m) => {
            const isCurrent = m.id === currentMovieId;
            return (
              <div
                key={m.id}
                onClick={() => {
                  onSelectMovie(m);
                  onClose();
                }}
                className={`p-3 rounded-2xl border flex items-center justify-between gap-4 cursor-pointer transition-all ${
                  isCurrent
                    ? 'bg-netflix-red/15 border-netflix-red/50 shadow-md'
                    : 'bg-cinema-darker/60 hover:bg-cinema-darker border-white/5 hover:border-white/20'
                }`}
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <img
                    src={m.thumbnail || 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=200'}
                    alt={m.title}
                    className="w-16 h-10 object-cover rounded-lg shrink-0 border border-white/10"
                  />
                  <div className="min-w-0">
                    <h4 className="text-xs font-bold text-white truncate flex items-center gap-2">
                      <span>{m.title}</span>
                      {isCurrent && (
                        <span className="px-2 py-0.5 rounded text-[10px] bg-netflix-red text-white">
                          Now Playing
                        </span>
                      )}
                    </h4>
                    <p className="text-[11px] text-cinema-muted truncate mt-0.5">
                      {m.description || 'Uploaded movie ready for playback.'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-xs text-cinema-muted font-medium">{m.duration || 'Feature'}</span>
                  <button
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      isCurrent
                        ? 'bg-netflix-red text-white'
                        : 'bg-white/10 hover:bg-white/20 text-white'
                    }`}
                  >
                    {isCurrent ? 'Current' : 'Select'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default MovieSelectorModal;
