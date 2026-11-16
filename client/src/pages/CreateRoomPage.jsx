import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Heart, PlusCircle, Film, Sparkles, Copy, Check, ArrowRight, Shield } from 'lucide-react';
import { roomApi, movieApi } from '../services/api';
import { useAuth } from '../context/AuthContext';

export const CreateRoomPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [roomName, setRoomName] = useState(`${user?.name || 'Couple'}'s Cinema Suite ❤️`);
  const [movies, setMovies] = useState([]);
  const [selectedMovieId, setSelectedMovieId] = useState(location.state?.selectedMovieId || '');
  const [loading, setLoading] = useState(false);
  const [createdRoom, setCreatedRoom] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        const res = await movieApi.getAll();
        setMovies(res.movies || []);
        if (!selectedMovieId && res.movies && res.movies.length > 0) {
          setSelectedMovieId(res.movies[0].id);
        }
      } catch (err) {
        console.error('Failed to fetch movies:', err);
      }
    };
    fetchMovies();
  }, [selectedMovieId]);

  const handleCreate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await roomApi.create(roomName, selectedMovieId);
      setCreatedRoom(res.room);
    } catch (err) {
      console.error('Create room error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyLink = () => {
    if (!createdRoom) return;
    const inviteUrl = `${window.location.origin}/rooms/join?code=${createdRoom.code}`;
    navigator.clipboard.writeText(inviteUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 bg-cinema-darkest relative overflow-hidden">
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] bg-netflix-red/10 rounded-full blur-[140px] pointer-events-none" />

      <div className="relative w-full max-w-xl glass-card border border-white/10 rounded-3xl p-8 shadow-2xl">
        {!createdRoom ? (
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-netflix-red to-romantic-pink flex items-center justify-center text-white shadow-lg neon-red-glow">
                <PlusCircle className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-2xl font-black text-white tracking-tight">Create Private Room</h1>
                <p className="text-xs text-cinema-muted">Only you and your chosen partner can enter this private space.</p>
              </div>
            </div>

            <form onSubmit={handleCreate} className="space-y-5">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-cinema-muted mb-1.5">
                  Room Name
                </label>
                <input
                  type="text"
                  value={roomName}
                  onChange={(e) => setRoomName(e.target.value)}
                  placeholder="e.g. Starlight Movie Date ✨"
                  required
                  className="w-full px-4 py-2.5 rounded-xl bg-cinema-darker border border-white/10 text-white text-sm focus:outline-none focus:border-romantic-pink"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-cinema-muted mb-1.5">
                  Select Starting Movie
                </label>
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {movies.map((m) => {
                    const isSelected = m.id === selectedMovieId;
                    return (
                      <div
                        key={m.id}
                        onClick={() => setSelectedMovieId(m.id)}
                        className={`p-2.5 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                          isSelected
                            ? 'bg-romantic-pink/15 border-romantic-pink text-white shadow-md'
                            : 'bg-cinema-darker/60 hover:bg-cinema-darker border-white/5 text-cinema-muted'
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <img
                            src={m.thumbnail || 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=100'}
                            alt={m.title}
                            className="w-12 h-8 rounded-lg object-cover shrink-0"
                          />
                          <div className="truncate">
                            <p className="text-xs font-bold text-white truncate">{m.title}</p>
                            <p className="text-[10px] text-cinema-muted">{m.duration || 'Feature'}</p>
                          </div>
                        </div>

                        {isSelected && (
                          <div className="w-5 h-5 rounded-full bg-romantic-pink text-white flex items-center justify-center shrink-0">
                            <Check className="w-3.5 h-3.5" />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-white/5 border border-white/5 flex items-center gap-3 text-xs text-cinema-muted">
                <Shield className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Strict 2-person limit enforced. Once your partner joins, others are blocked.</span>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-netflix-red to-romantic-pink hover:brightness-110 text-white text-xs font-bold shadow-xl neon-red-glow transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <span>{loading ? 'Creating Private Suite...' : 'Generate Room Code & Start'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </div>
        ) : (
          <div className="text-center py-4">
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto mb-4 animate-bounce">
              <Check className="w-7 h-7" />
            </div>

            <h2 className="text-2xl font-black text-white tracking-tight mb-1">
              Private Cinema Suite Ready! ❤️
            </h2>
            <p className="text-xs text-cinema-muted mb-6">
              Share the invitation code or direct link with your partner so they can join.
            </p>

            {/* Room Code Display */}
            <div className="p-5 rounded-2xl bg-cinema-darker border border-romantic-pink/40 shadow-inner mb-6">
              <span className="text-xs uppercase tracking-widest text-cinema-muted font-semibold">
                Your Secret Room Code
              </span>
              <div className="text-3xl font-black tracking-widest text-romantic-pink font-mono mt-1">
                {createdRoom.code}
              </div>
            </div>

            {/* Copy Invite Link */}
            <div className="flex items-center gap-2 mb-6">
              <input
                type="text"
                readOnly
                value={`${window.location.origin}/rooms/join?code=${createdRoom.code}`}
                className="flex-1 px-4 py-2.5 rounded-xl bg-cinema-darker border border-white/10 text-xs text-cinema-muted select-all"
              />
              <button
                onClick={handleCopyLink}
                className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-semibold text-white flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? 'Copied!' : 'Copy Link'}</span>
              </button>
            </div>

            <button
              onClick={() => navigate(`/room/${createdRoom.id}`)}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-netflix-red to-romantic-pink hover:brightness-110 text-white text-xs font-bold shadow-xl neon-red-glow transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Enter Movie Room Now</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CreateRoomPage;
