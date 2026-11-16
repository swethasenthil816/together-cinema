import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Heart,
  Copy,
  Check,
  LogOut,
  Users,
  Film,
  Sparkles,
  Share2,
  Tv,
  MessageSquare,
  AlertCircle
} from 'lucide-react';

import { useAuth } from '../context/AuthContext';
import { roomApi } from '../services/api';
import { connectSocket, getSocket } from '../services/socket';
import { useMovieSync } from '../hooks/useMovieSync';
import { useWebRTC } from '../hooks/useWebRTC';

import CustomVideoPlayer from '../components/player/CustomVideoPlayer';
import WebRTCCallingTile from '../components/webrtc/WebRTCCallingTile';
import ChatPanel from '../components/chat/ChatPanel';
import FloatingHearts from '../components/romantic/FloatingHearts';
import ReactionOverlay from '../components/romantic/ReactionOverlay';
import RomanticWelcomeModal from '../components/romantic/RomanticWelcomeModal';
import MovieSelectorModal from '../components/library/MovieSelectorModal';

export const MovieRoomPage = () => {
  const { roomId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [room, setRoom] = useState(null);
  const [activeMovie, setActiveMovie] = useState(null);
  const [members, setMembers] = useState([]);
  const [partnerUser, setPartnerUser] = useState(null);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);
  const [roomError, setRoomError] = useState(null);

  // Romantic & UI states
  const [floatingReactionCount, setFloatingReactionCount] = useState(0);
  const [lastReactionType, setLastReactionType] = useState('heart');
  const [lastReactionData, setLastReactionData] = useState(null);
  const [bothJoinedData, setBothJoinedData] = useState(null);
  const [isMovieSelectorOpen, setIsMovieSelectorOpen] = useState(false);
  const [isMobileChatOpen, setIsMobileChatOpen] = useState(false);

  // Initialize WebRTC
  const webrtc = useWebRTC(roomId, user);

  // Initialize Movie Synchronization Engine
  const syncEngine = useMovieSync(roomId, activeMovie, user);

  // Fetch initial room data from server
  useEffect(() => {
    const fetchRoom = async () => {
      try {
        setLoading(true);
        const res = await roomApi.get(roomId);
        setRoom(res.room);
        setActiveMovie(res.room.activeMovie);

        // Determine partner user
        if (res.room.host && res.room.host.id !== user.id) {
          setPartnerUser(res.room.host);
        } else if (res.room.participant && res.room.participant.id !== user.id) {
          setPartnerUser(res.room.participant);
        }
      } catch (err) {
        setRoomError(err.message || 'Unable to join room.');
      } finally {
        setLoading(false);
      }
    };

    if (roomId && user) {
      fetchRoom();
    }
  }, [roomId, user]);

  // Connect to Socket.IO and register room events
  useEffect(() => {
    if (!roomId || !user) return;

    const socket = connectSocket();

    socket.emit('join-room', {
      roomId,
      user: {
        id: user.id,
        name: user.name,
        avatar: user.avatar,
      },
    });

    const handleMembersUpdated = ({ members: memberList }) => {
      setMembers(memberList || []);
      const partner = memberList.find((m) => m.id !== user.id);
      setPartnerUser(partner || null);
    };

    const handleRomanticBothJoined = (data) => {
      setBothJoinedData(data);
    };

    const handleReactionReceived = (data) => {
      setLastReactionType(data.reactionType);
      setLastReactionData(data);
      setFloatingReactionCount((c) => c + 1);
    };

    const handleMovieChanged = ({ movie, changedBy }) => {
      setActiveMovie(movie);
    };

    const handleRoomError = ({ message }) => {
      setRoomError(message);
    };

    socket.on('room-members-updated', handleMembersUpdated);
    socket.on('romantic-both-joined', handleRomanticBothJoined);
    socket.on('romantic-reaction-received', handleReactionReceived);
    socket.on('sync-movie-changed', handleMovieChanged);
    socket.on('room-error', handleRoomError);

    return () => {
      socket.emit('leave-room', { roomId, userId: user.id });
      socket.off('room-members-updated', handleMembersUpdated);
      socket.off('romantic-both-joined', handleRomanticBothJoined);
      socket.off('romantic-reaction-received', handleReactionReceived);
      socket.off('sync-movie-changed', handleMovieChanged);
      socket.off('room-error', handleRoomError);
    };
  }, [roomId, user]);

  // Copy invitation link
  const handleCopyInvite = () => {
    if (!room) return;
    const inviteUrl = `${window.location.origin}/rooms/join?code=${room.code}`;
    navigator.clipboard.writeText(inviteUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Leave Room
  const handleLeaveRoom = async () => {
    try {
      await roomApi.leave(roomId);
    } catch (e) {
      // ignore
    }
    navigate('/dashboard');
  };

  // Send Romantic Reaction
  const handleSendReaction = (reactionType = 'heart') => {
    const socket = getSocket();
    socket.emit('send-romantic-reaction', {
      roomId,
      reactionType,
      senderName: user?.name,
    });
    setLastReactionType(reactionType);
    setFloatingReactionCount((c) => c + 1);
  };

  // Change active movie
  const handleSelectMovie = async (movie) => {
    try {
      await roomApi.setMovie(roomId, movie.id);
      setActiveMovie(movie);
      const socket = getSocket();
      socket.emit('room-change-movie', {
        roomId,
        movie,
        changedBy: user?.name,
      });
    } catch (err) {
      console.error('Failed to change movie:', err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-cinema-darkest flex items-center justify-center text-white">
        <div className="text-center">
          <Heart className="w-12 h-12 text-romantic-pink animate-pulse mx-auto mb-4" />
          <p className="text-sm text-cinema-muted">Connecting to your private cinema suite...</p>
        </div>
      </div>
    );
  }

  if (roomError) {
    return (
      <div className="min-h-screen bg-cinema-darkest flex items-center justify-center p-4 text-white">
        <div className="max-w-md w-full glass-card border border-netflix-red/30 rounded-3xl p-8 text-center shadow-2xl">
          <AlertCircle className="w-14 h-14 text-netflix-red mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">Room Access Issue</h2>
          <p className="text-xs text-cinema-muted mb-6 leading-relaxed">{roomError}</p>
          <button
            onClick={() => navigate('/dashboard')}
            className="px-6 py-2.5 rounded-xl bg-netflix-red hover:bg-netflix-hover text-white text-xs font-bold transition-all"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cinema-darkest text-white pb-12 flex flex-col">
      {/* Floating Hearts Particle Layer */}
      <FloatingHearts
        triggerCount={floatingReactionCount}
        reactionType={lastReactionType}
      />

      {/* Romantic Reaction Notification Banner */}
      <ReactionOverlay lastReaction={lastReactionData} />

      {/* Romantic Welcome Banner when both partners join */}
      <RomanticWelcomeModal
        bothJoinedData={bothJoinedData}
        onClose={() => setBothJoinedData(null)}
      />

      {/* Movie Selector Modal */}
      <MovieSelectorModal
        isOpen={isMovieSelectorOpen}
        onClose={() => setIsMovieSelectorOpen(false)}
        currentMovieId={activeMovie?.id}
        onSelectMovie={handleSelectMovie}
      />

      {/* Room Top Header Bar */}
      <header className="sticky top-16 z-30 bg-cinema-darker/90 backdrop-blur-md border-b border-white/10 px-4 sm:px-6 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          {/* Room Name & Code */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-netflix-red to-romantic-pink flex items-center justify-center text-white shadow-md">
              <Tv className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-sm font-black text-white tracking-wide truncate max-w-xs sm:max-w-md">
                  {room?.name || 'Private Movie Date'}
                </h1>
                <span className="px-2 py-0.5 rounded-md bg-white/10 text-romantic-pink text-[11px] font-mono font-bold">
                  #{room?.code}
                </span>
              </div>
              <div className="flex items-center gap-2 text-[11px] text-cinema-muted">
                <span className="flex items-center gap-1 text-emerald-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  {members.length === 2 ? 'Both Online ❤️' : 'Waiting for Partner...'}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Actions (Copy Invite Link, Mobile Chat Toggle, Leave Room) */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyInvite}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/10 text-xs font-semibold text-white transition-colors cursor-pointer"
              title="Copy invite link to send to partner"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span className="hidden sm:inline">{copied ? 'Link Copied!' : 'Invite Partner'}</span>
            </button>

            {/* Mobile Chat Toggle Button */}
            <button
              onClick={() => setIsMobileChatOpen(!isMobileChatOpen)}
              className="lg:hidden p-2 rounded-xl bg-white/10 hover:bg-white/15 text-white"
              title="Toggle Live Chat"
            >
              <MessageSquare className="w-4 h-4 text-romantic-pink" />
            </button>

            <button
              onClick={handleLeaveRoom}
              className="p-2 sm:px-3 sm:py-1.5 rounded-xl bg-netflix-red/20 hover:bg-netflix-red/30 border border-netflix-red/40 text-netflix-red text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Leave Room"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Leave</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Room Layout */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 w-full flex-1">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column (Video Player + Dual Webcam Screens + Quick Reaction Bar) (8 cols) */}
          <div className="lg:col-span-8 space-y-6">
            {/* Center Video Player */}
            <CustomVideoPlayer
              movie={activeMovie}
              syncEngine={syncEngine}
              onOpenMovieSelector={() => setIsMovieSelectorOpen(true)}
              partnerName={partnerUser?.name}
            />

            {/* Quick Romantic Reaction Bar */}
            <div className="flex items-center justify-between p-3 rounded-2xl bg-cinema-darker border border-white/10 shadow-lg">
              <span className="text-xs font-semibold text-cinema-muted uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-romantic-pink" /> Reactions:
              </span>
              <div className="flex items-center gap-1.5">
                {[
                  { type: 'heart', label: '❤️ Love' },
                  { type: 'kiss', label: '💋 Kiss' },
                  { type: 'popcorn', label: '🍿 Popcorn' },
                  { type: 'sparkle', label: '✨ Sparkle' },
                  { type: 'laugh', label: '😂 Laugh' },
                  { type: 'cry', label: '🥹 Emotional' },
                ].map((r) => (
                  <button
                    key={r.type}
                    onClick={() => handleSendReaction(r.type)}
                    className="px-2.5 py-1.5 rounded-xl bg-white/5 hover:bg-romantic-pink/20 hover:text-white border border-white/10 text-xs font-medium text-cinema-muted transition-all cursor-pointer hover:scale-105 active:scale-95"
                  >
                    {r.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Two Webcam Video Screens (WebRTC Dual Tiles) */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-cinema-muted flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-romantic-pink" /> Live Webcam Screens
                </h3>
                <span className="text-[11px] text-cinema-muted">
                  {partnerUser ? `${partnerUser.name} & You` : 'Waiting for partner to connect...'}
                </span>
              </div>

              <WebRTCCallingTile
                webrtc={webrtc}
                currentUser={user}
                partnerUser={partnerUser}
                roomId={roomId}
              />
            </div>
          </div>

          {/* Right Column (Live Chat Panel) (4 cols) */}
          <div className="hidden lg:block lg:col-span-4 sticky top-36">
            <div className="h-[680px]">
              <ChatPanel
                roomId={roomId}
                currentUser={user}
                partnerUser={partnerUser}
                onSendReaction={handleSendReaction}
              />
            </div>
          </div>
        </div>

        {/* Mobile Slide-Over Live Chat */}
        {isMobileChatOpen && (
          <div className="lg:hidden fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex flex-col justify-end p-4 animate-fade-in">
            <div className="relative bg-cinema-darker rounded-3xl border border-white/15 h-[520px] flex flex-col overflow-hidden shadow-2xl">
              <div className="flex justify-between items-center p-3 border-b border-white/10">
                <span className="text-sm font-bold text-white">Live Date Chat</span>
                <button
                  onClick={() => setIsMobileChatOpen(false)}
                  className="px-3 py-1 rounded-lg bg-white/10 text-xs text-white"
                >
                  Close
                </button>
              </div>
              <div className="flex-1 overflow-hidden">
                <ChatPanel
                  roomId={roomId}
                  currentUser={user}
                  partnerUser={partnerUser}
                  onSendReaction={handleSendReaction}
                />
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default MovieRoomPage;
