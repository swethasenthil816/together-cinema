import { useState, useEffect, useRef, useCallback } from 'react';
import { getSocket } from '../services/socket';

export const useMovieSync = (roomId, activeMovie, currentUser) => {
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [buffered, setBuffered] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [isBuffering, setIsBuffering] = useState(false);
  const [partnerBuffering, setPartnerBuffering] = useState(null);
  const [syncStatus, setSyncStatus] = useState('in-sync'); // 'in-sync' | 'syncing' | 'partner-buffering'
  const [lastSyncDelta, setLastSyncDelta] = useState(0);

  // Flag to prevent synchronization loops
  const isRemoteActionRef = useRef(false);
  const lastEmittedTimeRef = useRef(0);

  // Helper to run action without triggering local socket broadcast
  const executeSilently = (action) => {
    isRemoteActionRef.current = true;
    try {
      action();
    } finally {
      // Small timeout to allow browser video event listeners to finish
      setTimeout(() => {
        isRemoteActionRef.current = false;
      }, 80);
    }
  };

  // ----------------------------------------------------
  // USER-TRIGGERED CONTROLS
  // ----------------------------------------------------

  const playMovie = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;

    if (video.paused) {
      video.play().catch(err => console.warn('Autoplay prevented:', err));
    }
    setIsPlaying(true);

    if (!isRemoteActionRef.current) {
      const socket = getSocket();
      socket.emit('player-play', {
        roomId,
        currentTime: video.currentTime,
        timestamp: Date.now(),
      });
    }
  }, [roomId]);

  const pauseMovie = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;

    if (!video.paused) {
      video.pause();
    }
    setIsPlaying(false);

    if (!isRemoteActionRef.current) {
      const socket = getSocket();
      socket.emit('player-pause', {
        roomId,
        currentTime: video.currentTime,
        timestamp: Date.now(),
      });
    }
  }, [roomId]);

  const togglePlay = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      playMovie();
    } else {
      pauseMovie();
    }
  }, [playMovie, pauseMovie]);

  const seekMovie = useCallback((targetTime) => {
    const video = videoRef.current;
    if (!video) return;

    const clampedTime = Math.max(0, Math.min(targetTime, video.duration || targetTime));
    video.currentTime = clampedTime;
    setCurrentTime(clampedTime);

    if (!isRemoteActionRef.current) {
      const socket = getSocket();
      socket.emit('player-seek', {
        roomId,
        currentTime: clampedTime,
        timestamp: Date.now(),
      });
    }
  }, [roomId]);

  const skipSeconds = useCallback((seconds) => {
    const video = videoRef.current;
    if (!video) return;
    seekMovie(video.currentTime + seconds);
  }, [seekMovie]);

  const changePlaybackRate = useCallback((rate) => {
    const video = videoRef.current;
    if (!video) return;

    video.playbackRate = rate;
    setPlaybackRate(rate);

    if (!isRemoteActionRef.current) {
      const socket = getSocket();
      socket.emit('player-rate', {
        roomId,
        playbackRate: rate,
      });
    }
  }, [roomId]);

  // ----------------------------------------------------
  // SOCKET LISTENERS (Incoming Partner Actions)
  // ----------------------------------------------------

  useEffect(() => {
    const socket = getSocket();
    const video = videoRef.current;

    const handleRemotePlay = ({ currentTime: partnerTime, timestamp }) => {
      if (!video) return;
      // Network latency compensation
      const latencySeconds = Math.max(0, (Date.now() - timestamp) / 1000);
      const targetTime = partnerTime + (latencySeconds * video.playbackRate);

      const delta = Math.abs(video.currentTime - targetTime);
      setLastSyncDelta(delta);

      executeSilently(() => {
        if (delta > 0.35) {
          video.currentTime = targetTime;
          setCurrentTime(targetTime);
        }
        video.play().catch(e => console.warn('Play error:', e));
        setIsPlaying(true);
        setSyncStatus('in-sync');
      });
    };

    const handleRemotePause = ({ currentTime: partnerTime }) => {
      if (!video) return;
      executeSilently(() => {
        const delta = Math.abs(video.currentTime - partnerTime);
        setLastSyncDelta(delta);
        if (delta > 0.35) {
          video.currentTime = partnerTime;
          setCurrentTime(partnerTime);
        }
        video.pause();
        setIsPlaying(false);
        setSyncStatus('in-sync');
      });
    };

    const handleRemoteSeek = ({ currentTime: partnerTime }) => {
      if (!video) return;
      executeSilently(() => {
        video.currentTime = partnerTime;
        setCurrentTime(partnerTime);
        setSyncStatus('in-sync');
      });
    };

    const handleRemoteRate = ({ playbackRate: rate }) => {
      if (!video) return;
      executeSilently(() => {
        video.playbackRate = rate;
        setPlaybackRate(rate);
      });
    };

    const handleRemoteBuffering = ({ isBuffering: partnerIsBuffering, userName }) => {
      if (partnerIsBuffering) {
        setPartnerBuffering(userName || 'Partner');
        setSyncStatus('partner-buffering');
        if (video && !video.paused) {
          executeSilently(() => {
            video.pause();
          });
        }
      } else {
        setPartnerBuffering(null);
        setSyncStatus('in-sync');
        if (video && isPlaying) {
          executeSilently(() => {
            video.play().catch(e => console.warn(e));
          });
        }
      }
    };

    const handleGiveState = ({ requesterSocketId }) => {
      if (!video) return;
      socket.emit('player-send-state', {
        targetSocketId: requesterSocketId,
        isPlaying: !video.paused,
        currentTime: video.currentTime,
        playbackRate: video.playbackRate,
      });
    };

    const handleReceiveState = ({ isPlaying: partnerPlaying, currentTime: partnerTime, playbackRate: partnerRate }) => {
      if (!video) return;
      executeSilently(() => {
        video.currentTime = partnerTime;
        setCurrentTime(partnerTime);
        video.playbackRate = partnerRate || 1;
        setPlaybackRate(partnerRate || 1);

        if (partnerPlaying) {
          video.play().catch(e => console.warn(e));
          setIsPlaying(true);
        } else {
          video.pause();
          setIsPlaying(false);
        }
        setSyncStatus('in-sync');
      });
    };

    socket.on('sync-player-play', handleRemotePlay);
    socket.on('sync-player-pause', handleRemotePause);
    socket.on('sync-player-seek', handleRemoteSeek);
    socket.on('sync-player-rate', handleRemoteRate);
    socket.on('sync-player-buffering', handleRemoteBuffering);
    socket.on('player-give-state', handleGiveState);
    socket.on('sync-player-state', handleReceiveState);

    // Initial state sync request from partner upon joining room
    socket.emit('player-request-state', { roomId });

    return () => {
      socket.off('sync-player-play', handleRemotePlay);
      socket.off('sync-player-pause', handleRemotePause);
      socket.off('sync-player-seek', handleRemoteSeek);
      socket.off('sync-player-rate', handleRemoteRate);
      socket.off('sync-player-buffering', handleRemoteBuffering);
      socket.off('player-give-state', handleGiveState);
      socket.off('sync-player-state', handleReceiveState);
    };
  }, [roomId, isPlaying]);

  // ----------------------------------------------------
  // HTML5 VIDEO ELEMENT EVENT LISTENERS
  // ----------------------------------------------------

  const handleTimeUpdate = () => {
    const video = videoRef.current;
    if (!video) return;
    setCurrentTime(video.currentTime);

    // Calculate buffered range
    if (video.buffered.length > 0) {
      const bufferedEnd = video.buffered.end(video.buffered.length - 1);
      setBuffered((bufferedEnd / (video.duration || 1)) * 100);
    }
  };

  const handleDurationChange = () => {
    const video = videoRef.current;
    if (video) setDuration(video.duration || 0);
  };

  const handleWaiting = () => {
    setIsBuffering(true);
    setSyncStatus('syncing');
    const socket = getSocket();
    socket.emit('player-buffering', {
      roomId,
      isBuffering: true,
      currentTime: videoRef.current ? videoRef.current.currentTime : 0,
      userName: currentUser?.name,
    });
  };

  const handlePlaying = () => {
    setIsBuffering(false);
    setSyncStatus('in-sync');
    const socket = getSocket();
    socket.emit('player-buffering', {
      roomId,
      isBuffering: false,
      currentTime: videoRef.current ? videoRef.current.currentTime : 0,
      userName: currentUser?.name,
    });
  };

  return {
    videoRef,
    isPlaying,
    currentTime,
    duration,
    buffered,
    playbackRate,
    isBuffering,
    partnerBuffering,
    syncStatus,
    lastSyncDelta,
    playMovie,
    pauseMovie,
    togglePlay,
    seekMovie,
    skipSeconds,
    changePlaybackRate,
    handleTimeUpdate,
    handleDurationChange,
    handleWaiting,
    handlePlaying,
  };
};
