import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Film, Upload, Search, Sparkles, Plus, AlertCircle } from 'lucide-react';
import { movieApi, roomApi } from '../services/api';
import MovieCard from '../components/library/MovieCard';
import UploadMovieModal from '../components/library/UploadMovieModal';

export const LibraryPage = () => {
  const [movies, setMovies] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [feedback, setFeedback] = useState(null);

  const navigate = useNavigate();

  const fetchMovies = async (query = '') => {
    try {
      setLoading(true);
      const res = await movieApi.getAll(query);
      setMovies(res.movies || []);
    } catch (err) {
      console.error('Failed to fetch movies:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMovies(search);
  }, [search]);

  const handleMovieUploaded = (newMovie) => {
    setMovies((prev) => [newMovie, ...prev]);
    setFeedback({ type: 'success', message: `"${newMovie.title}" uploaded and added to library!` });
    setTimeout(() => setFeedback(null), 4000);
  };

  const handleDeleteMovie = async (movieId) => {
    if (!window.confirm('Are you sure you want to delete this movie from the shared library?')) {
      return;
    }
    try {
      await movieApi.deleteMovie(movieId);
      setMovies((prev) => prev.filter((m) => m.id !== movieId));
      setFeedback({ type: 'success', message: 'Movie deleted successfully.' });
      setTimeout(() => setFeedback(null), 3000);
    } catch (err) {
      setFeedback({ type: 'error', message: err.message || 'Failed to delete movie.' });
    }
  };

  const handleWatchTogether = (movie) => {
    navigate('/rooms/create', { state: { selectedMovieId: movie.id } });
  };

  return (
    <div className="min-h-screen bg-cinema-darkest text-white pb-20">
      {/* Upload Modal */}
      <UploadMovieModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onMovieUploaded={handleMovieUploaded}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-8">
        {/* Header Bar */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-romantic-pink/15 text-romantic-pink text-xs font-semibold mb-2">
              <Sparkles className="w-3.5 h-3.5" /> Shared Couple Storage
            </div>
            <h1 className="text-3xl font-black text-white tracking-tight">Shared Movie Library</h1>
            <p className="text-xs text-cinema-muted mt-1">
              Both partners access this shared collection. Upload full-length movies (MP4/WebM) to watch together.
            </p>
          </div>

          <button
            onClick={() => setIsUploadModalOpen(true)}
            className="px-5 py-3 rounded-2xl bg-gradient-to-r from-netflix-red to-romantic-pink text-white text-xs font-bold shadow-xl neon-red-glow hover:brightness-110 flex items-center gap-2 transition-all cursor-pointer"
          >
            <Upload className="w-4 h-4" />
            <span>Upload New Movie</span>
          </button>
        </div>

        {/* Feedback Alert */}
        {feedback && (
          <div
            className={`p-3.5 rounded-2xl border text-xs flex items-center gap-2 ${
              feedback.type === 'success'
                ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300'
                : 'bg-netflix-red/20 border-netflix-red/30 text-red-200'
            }`}
          >
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{feedback.message}</span>
          </div>
        )}

        {/* Search Bar */}
        <div className="relative max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-cinema-muted" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search movie title, description, or genre..."
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-cinema-darker border border-white/10 text-white text-xs focus:outline-none focus:border-romantic-pink"
          />
        </div>

        {/* Movies Grid */}
        {loading ? (
          <div className="py-20 text-center text-cinema-muted text-xs">
            Loading movie library...
          </div>
        ) : movies.length === 0 ? (
          <div className="py-20 text-center glass-card rounded-3xl p-8 border border-white/5 max-w-md mx-auto">
            <Film className="w-12 h-12 text-cinema-muted mx-auto mb-3 opacity-40" />
            <h3 className="text-base font-bold text-white mb-1">No movies found</h3>
            <p className="text-xs text-cinema-muted mb-4">
              Upload your first personal movie file or try a different search term.
            </p>
            <button
              onClick={() => setIsUploadModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-netflix-red text-white text-xs font-semibold"
            >
              Upload Movie Now
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {movies.map((movie) => (
              <MovieCard
                key={movie.id}
                movie={movie}
                onSelect={() => handleWatchTogether(movie)}
                onDelete={handleDeleteMovie}
                canDelete={!movie.isSample}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default LibraryPage;
