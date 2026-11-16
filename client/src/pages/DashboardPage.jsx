import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Heart,
  PlusCircle,
  DoorOpen,
  Film,
  Sparkles,
  Play,
  Clock,
  ArrowRight,
  Tv,
  Calendar,
  Users
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { roomApi, movieApi } from '../services/api';
import RomanticDateCountdown from '../components/romantic/RomanticDateCountdown';
import MovieCard from '../components/library/MovieCard';

export const DashboardPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [myRooms, setMyRooms] = useState([]);
  const [featuredMovies, setFeaturedMovies] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true);
        const [roomsRes, moviesRes] = await Promise.all([
          roomApi.getMyRooms().catch(() => ({ rooms: [] })),
          movieApi.getAll().catch(() => ({ movies: [] })),
        ]);
        setMyRooms(roomsRes.rooms || []);
        setFeaturedMovies(moviesRes.movies || []);
      } catch (err) {
        console.error('Error loading dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  const handleStartRoomWithMovie = (movie) => {
    navigate('/rooms/create', { state: { selectedMovieId: movie.id } });
  };

  return (
    <div className="min-h-screen bg-cinema-darkest text-white pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-10">
        {/* Welcome Romantic Hero Banner */}
        <div className="relative rounded-3xl overflow-hidden glass-card border border-white/10 p-8 md:p-10 shadow-2xl">
          <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-netflix-red/25 via-romantic-pink/15 to-transparent rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex items-center gap-5">
              <div className="relative">
                <img
                  src={user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                  alt={user?.name}
                  className="w-16 h-16 md:w-20 md:h-20 rounded-3xl object-cover border-2 border-romantic-pink shadow-xl neon-pink-glow"
                />
                <span className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 border-2 border-cinema-darkest rounded-full" />
              </div>
              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-romantic-pink/15 text-romantic-pink text-xs font-semibold mb-2">
                  <Sparkles className="w-3.5 h-3.5" /> Virtual Cinema Suite
                </div>
                <h1 className="text-2xl md:text-3xl font-black tracking-tight">
                  Hello, {user?.name}! ❤️
                </h1>
                <p className="text-xs md:text-sm text-cinema-muted mt-1">
                  Ready for movie night with <span className="text-white font-semibold">{user?.partnerNickname || 'Your Partner'}</span>?
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
              <Link
                to="/rooms/create"
                className="flex-1 md:flex-none px-6 py-3 rounded-2xl bg-gradient-to-r from-netflix-red to-romantic-pink text-white text-xs font-bold shadow-xl neon-red-glow hover:brightness-110 flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Create Movie Room</span>
              </Link>

              <Link
                to="/rooms/join"
                className="flex-1 md:flex-none px-6 py-3 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/10 text-white text-xs font-semibold backdrop-blur-md flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <DoorOpen className="w-4 h-4" />
                <span>Join with Code</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Romantic Date Countdown Widget */}
        <RomanticDateCountdown partnerName={user?.partnerNickname} />

        {/* Active / Recent Rooms Section */}
        {myRooms.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Tv className="w-5 h-5 text-netflix-red" />
                <span>Your Active Rooms</span>
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {myRooms.map((room) => (
                <div
                  key={room.id}
                  className="p-5 rounded-2xl bg-cinema-darker border border-white/10 hover:border-romantic-pink/40 transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-romantic-pink tracking-wider font-mono">
                        ROOM #{room.code}
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 text-[10px] font-semibold">
                        Active
                      </span>
                    </div>
                    <h3 className="text-base font-bold text-white line-clamp-1">{room.name}</h3>
                  </div>

                  <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between">
                    <span className="text-xs text-cinema-muted">2-person locked</span>
                    <button
                      onClick={() => navigate(`/room/${room.id}`)}
                      className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-netflix-red text-white text-xs font-semibold hover:bg-netflix-hover shadow-md"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>Enter Cinema Room</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Shared Movie Library Quick Row */}
        <div>
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-xl font-black text-white flex items-center gap-2">
                <Film className="w-5 h-5 text-romantic-pink" />
                <span>Shared Movie Library</span>
              </h2>
              <p className="text-xs text-cinema-muted mt-0.5">
                Pick a movie to stream together or upload your own 3+ hour films
              </p>
            </div>
            <Link
              to="/library"
              className="text-xs font-semibold text-romantic-pink hover:underline flex items-center gap-1"
            >
              <span>View Full Library</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredMovies.slice(0, 4).map((movie) => (
              <MovieCard
                key={movie.id}
                movie={movie}
                onSelect={() => handleStartRoomWithMovie(movie)}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
