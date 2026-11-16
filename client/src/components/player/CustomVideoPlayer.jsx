import React, { useState, useRef, useEffect } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  RotateCw,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  Radio,
  Settings,
  Sparkles,
  Loader2,
  AlertCircle
} from 'lucide-react';

export const CustomVideoPlayer = ({
  movie,
  syncEngine,
  onOpenMovieSelector,
  partnerName
}) => {
  const {
    videoRef,
    isPlaying,
    currentTime,
    duration,
    buffered,
    playbackRate,
    isBuffering,
    partnerBuffering,
    syncStatus,
    togglePlay,
    seekMovie,
    skipSeconds,
    changePlaybackRate,
    handleTimeUpdate,
    handleDurationChange,
    handleWaiting,
    handlePlaying,
  } = syncEngine;

  const containerRef = useRef(null);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [showRateMenu, setShowRateMenu] = useState(false);
  const controlsTimeoutRef = useRef(null);

  // Format seconds to hh:mm:ss
  const formatTime = (seconds) => {
    if (isNaN(seconds) || seconds < 0) return '00:00';
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    if (hrs > 0) {
      return `${hrs}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    }
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  // Autohide controls on inactivity
  const handleMouseMove = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    controlsTimeoutRef.current = setTimeout(() => {
      if (isPlaying) {
        setShowControls(false);
      }
    }, 3200);
  };

  // Fullscreen toggle
  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(err => console.warn(err));
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(err => console.warn(err));
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

  // Volume control
  const handleVolumeChange = (e) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    if (videoRef.current) {
      videoRef.current.volume = val;
      videoRef.current.muted = val === 0;
    }
    setIsMuted(val === 0);
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    if (isMuted) {
      videoRef.current.muted = false;
      videoRef.current.volume = volume || 0.8;
      setIsMuted(false);
    } else {
      videoRef.current.muted = true;
      setIsMuted(true);
    }
  };

  // Determine video source URL
  const videoSrc = movie?.streamUrl || 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4';

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => isPlaying && setShowControls(false)}
      className="relative w-full aspect-video bg-black rounded-2xl overflow-hidden shadow-2xl border border-white/10 group select-none"
    >
      {/* HTML5 Video Element */}
      <video
        ref={videoRef}
        src={videoSrc}
        playsInline
        preload="auto"
        onTimeUpdate={handleTimeUpdate}
        onDurationChange={handleDurationChange}
        onWaiting={handleWaiting}
        onPlaying={handlePlaying}
        onClick={togglePlay}
        className="w-full h-full object-contain cursor-pointer"
      />

      {/* Buffering Indicator Overlay */}
      {isBuffering && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/50 backdrop-blur-sm pointer-events-none z-20">
          <Loader2 className="w-12 h-12 text-netflix-red animate-spin mb-3" />
          <p className="text-sm font-medium text-white/90">Buffering movie...</p>
        </div>
      )}

      {/* Partner Buffering Alert Overlay */}
      {partnerBuffering && (
        <div className="absolute top-4 left-4 z-20 flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-semibold backdrop-blur-md animate-pulse">
          <AlertCircle className="w-4 h-4" />
          <span>{partnerBuffering} is buffering, pausing to keep in sync...</span>
        </div>
      )}

      {/* Synchronized Status Badge */}
      <div className="absolute top-4 right-4 z-20 flex items-center gap-2">
        <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold backdrop-blur-md border ${
          syncStatus === 'in-sync'
            ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400'
            : 'bg-amber-500/20 border-amber-500/40 text-amber-300'
        }`}>
          <Radio className="w-3.5 h-3.5 animate-pulse" />
          <span>{syncStatus === 'in-sync' ? 'Synchronized' : 'Syncing...'}</span>
        </div>
      </div>

      {/* Center Big Play Button (when paused) */}
      {!isPlaying && (
        <div
          onClick={togglePlay}
          className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-xs cursor-pointer z-10"
        >
          <div className="w-20 h-20 rounded-full bg-netflix-red/90 hover:bg-netflix-red text-white flex items-center justify-center shadow-2xl neon-red-glow hover:scale-110 transition-transform">
            <Play className="w-9 h-9 fill-current ml-1" />
          </div>
        </div>
      )}

      {/* Movie Title Banner on hover */}
      <div
        className={`absolute top-0 inset-x-0 p-4 bg-gradient-to-b from-black/80 via-black/40 to-transparent transition-opacity duration-300 z-20 ${
          showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      >
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-white tracking-wide flex items-center gap-2">
              <span>{movie?.title || 'Selected Movie'}</span>
              {movie?.duration && (
                <span className="text-xs font-normal text-cinema-muted px-2 py-0.5 rounded bg-white/10">
                  {movie.duration}
                </span>
              )}
            </h2>
            <p className="text-xs text-cinema-muted truncate max-w-lg mt-0.5">
              {movie?.description || 'Synchronized live playback for both partners.'}
            </p>
          </div>

          {onOpenMovieSelector && (
            <button
              onClick={onOpenMovieSelector}
              className="px-3.5 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 border border-white/10 text-xs font-semibold text-white transition-colors"
            >
              Switch Movie
            </button>
          )}
        </div>
      </div>

      {/* Bottom Controls Bar */}
      <div
        className={`absolute bottom-0 inset-x-0 p-4 bg-gradient-to-t from-black/95 via-black/75 to-transparent transition-opacity duration-300 z-20 ${
          showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      >
        {/* Progress / Seek bar */}
        <div className="relative group/seeker mb-3 cursor-pointer">
          {/* Buffered track */}
          <div className="w-full h-1.5 bg-white/20 rounded-full overflow-hidden relative">
            <div
              className="absolute top-0 bottom-0 left-0 bg-white/30 rounded-full transition-all"
              style={{ width: `${buffered}%` }}
            />
            <div
              className="absolute top-0 bottom-0 left-0 bg-gradient-to-r from-netflix-red to-romantic-pink rounded-full transition-all"
              style={{ width: `${duration ? (currentTime / duration) * 100 : 0}%` }}
            />
          </div>

          {/* Interactive Range Input */}
          <input
            type="range"
            min="0"
            max={duration || 100}
            step="0.1"
            value={currentTime}
            onChange={(e) => seekMovie(parseFloat(e.target.value))}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
        </div>

        {/* Control Buttons */}
        <div className="flex items-center justify-between text-white">
          <div className="flex items-center gap-3">
            {/* Play / Pause */}
            <button
              onClick={togglePlay}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors text-white hover:text-romantic-pink"
              title={isPlaying ? 'Pause (Space)' : 'Play (Space)'}
            >
              {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current" />}
            </button>

            {/* Skip -10s */}
            <button
              onClick={() => skipSeconds(-10)}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors text-cinema-muted hover:text-white"
              title="Skip backward 10s"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            {/* Skip +10s */}
            <button
              onClick={() => skipSeconds(10)}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors text-cinema-muted hover:text-white"
              title="Skip forward 10s"
            >
              <RotateCw className="w-4 h-4" />
            </button>

            {/* Volume */}
            <div className="flex items-center gap-2 group/vol">
              <button
                onClick={toggleMute}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors text-cinema-muted hover:text-white"
              >
                {isMuted || volume === 0 ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
              </button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={isMuted ? 0 : volume}
                onChange={handleVolumeChange}
                className="w-16 accent-netflix-red h-1.5"
              />
            </div>

            {/* Time Stamp */}
            <div className="text-xs font-mono text-cinema-muted ml-2">
              <span className="text-white font-medium">{formatTime(currentTime)}</span> / {formatTime(duration)}
            </div>
          </div>

          <div className="flex items-center gap-2 relative">
            {/* Playback speed selector */}
            <div className="relative">
              <button
                onClick={() => setShowRateMenu(!showRateMenu)}
                className="px-2.5 py-1 rounded-md text-xs font-semibold bg-white/10 hover:bg-white/20 transition-colors"
              >
                {playbackRate}x
              </button>

              {showRateMenu && (
                <div className="absolute bottom-9 right-0 bg-cinema-darker border border-white/15 rounded-xl py-1 shadow-2xl z-30 min-w-[90px]">
                  {[0.5, 0.75, 1, 1.25, 1.5, 2].map((r) => (
                    <button
                      key={r}
                      onClick={() => {
                        changePlaybackRate(r);
                        setShowRateMenu(false);
                      }}
                      className={`w-full text-left px-3 py-1.5 text-xs hover:bg-white/10 flex items-center justify-between ${
                        playbackRate === r ? 'text-romantic-pink font-bold' : 'text-cinema-muted'
                      }`}
                    >
                      <span>{r}x</span>
                      {playbackRate === r && <span>✓</span>}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Fullscreen */}
            <button
              onClick={toggleFullscreen}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors text-cinema-muted hover:text-white"
              title={isFullscreen ? 'Exit Fullscreen (F)' : 'Fullscreen (F)'}
            >
              {isFullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomVideoPlayer;
