import React from 'react';
import { Play, Trash2, Clock, HardDrive, Film } from 'lucide-react';

export const MovieCard = ({
  movie,
  onSelect,
  onDelete,
  canDelete = false,
  isSelected = false
}) => {
  return (
    <div
      className={`group relative flex flex-col bg-cinema-darker rounded-2xl overflow-hidden border transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl ${
        isSelected
          ? 'border-netflix-red shadow-lg neon-red-glow'
          : 'border-white/10 hover:border-white/25'
      }`}
    >
      {/* Thumbnail with aspect ratio */}
      <div className="relative aspect-[16/9] w-full overflow-hidden bg-cinema-card">
        <img
          src={movie.thumbnail || 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=800'}
          alt={movie.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />

        {/* Gradient dark overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-cinema-darker via-transparent to-black/30 opacity-80" />

        {/* Duration badge */}
        <div className="absolute bottom-2.5 left-2.5 flex items-center gap-1 px-2 py-0.5 rounded-md bg-black/75 backdrop-blur-md text-[11px] font-semibold text-white">
          <Clock className="w-3 h-3 text-romantic-pink" />
          <span>{movie.duration || 'Feature'}</span>
        </div>

        {/* Size or Sample badge */}
        <div className="absolute top-2.5 right-2.5 flex items-center gap-1 px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-md text-[10px] text-cinema-muted">
          {movie.isSample ? (
            <span className="text-amber-400 font-semibold">Featured</span>
          ) : (
            <span>{movie.size || 'MP4'}</span>
          )}
        </div>

        {/* Quick Play Hover Button */}
        {onSelect && (
          <button
            onClick={() => onSelect(movie)}
            className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
          >
            <div className="w-12 h-12 rounded-full bg-netflix-red text-white flex items-center justify-center shadow-xl neon-red-glow hover:scale-110 transition-transform">
              <Play className="w-5 h-5 fill-current ml-0.5" />
            </div>
          </button>
        )}
      </div>

      {/* Content description & actions */}
      <div className="p-4 flex flex-col flex-1 justify-between">
        <div>
          <h3 className="text-sm font-bold text-white tracking-wide line-clamp-1 group-hover:text-romantic-pink transition-colors">
            {movie.title}
          </h3>
          <p className="text-xs text-cinema-muted line-clamp-2 mt-1 leading-relaxed">
            {movie.description || 'Uploaded movie ready for synchronized streaming.'}
          </p>
        </div>

        <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between">
          {onSelect && (
            <button
              onClick={() => onSelect(movie)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-gradient-to-r hover:from-netflix-red hover:to-romantic-pink text-xs font-semibold text-white transition-all cursor-pointer"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Watch Together</span>
            </button>
          )}

          {canDelete && !movie.isSample && onDelete && (
            <button
              onClick={() => onDelete(movie.id)}
              className="p-1.5 rounded-lg text-cinema-muted hover:text-netflix-red hover:bg-netflix-red/10 transition-colors ml-auto"
              title="Delete uploaded movie"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default MovieCard;
