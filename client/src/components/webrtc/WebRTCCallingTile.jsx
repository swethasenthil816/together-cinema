import React, { useEffect, useRef } from 'react';
import {
  Video,
  VideoOff,
  Mic,
  MicOff,
  PhoneOff,
  User,
  Heart,
  Volume2,
  Signal
} from 'lucide-react';

export const WebRTCCallingTile = ({
  webrtc,
  currentUser,
  partnerUser,
  partner1User,
  partner2User,
  isHost,
  roomCode,
  roomId
}) => {
  const {
    localStream,
    remoteStream,
    isVideoEnabled,
    isAudioEnabled,
    partnerMediaState,
    connectionStatus,
    mediaError,
    initLocalMedia,
    toggleVideo,
    toggleAudio,
  } = webrtc;

  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);

  // Determine who is Partner 1 (Host / Creator) and Partner 2 (Joiner)
  const p1Name = partner1User?.name || (isHost ? currentUser?.name : partnerUser?.name) || 'Partner 1 (Host)';
  const p2Name = partner2User?.name || (!isHost ? currentUser?.name : partnerUser?.name);

  // Attach local stream
  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  // Attach remote stream
  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream;
    }
  }, [remoteStream]);

  return (
    <div className="flex flex-col gap-3">
      {/* Media permission error alert */}
      {mediaError && (
        <div className="p-3 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-200 text-xs">
          <p className="font-semibold mb-1">Camera / Mic Access:</p>
          <p>{mediaError}. You can still watch and chat! Click "Enable Camera" when ready.</p>
          <button
            onClick={initLocalMedia}
            className="mt-2 px-3 py-1 bg-amber-500/20 hover:bg-amber-500/30 rounded-lg text-xs font-semibold text-amber-100"
          >
            Retry Camera Access
          </button>
        </div>
      )}

      {/* Two Webcam Video Screens (Partner 1 and Partner 2) */}
      <div className="grid grid-cols-2 gap-3">
        {/* Tile 1: Partner 1 (Room Creator / Host) */}
        <div className="relative aspect-video bg-cinema-darker rounded-2xl overflow-hidden border border-white/10 shadow-lg group">
          {isHost ? (
            // Current user is Partner 1 (Local Stream)
            localStream && isVideoEnabled ? (
              <video
                ref={localVideoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover -scale-x-100"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center p-3 bg-gradient-to-b from-cinema-darker to-cinema-darkest">
                <div className="relative">
                  <img
                    src={currentUser?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                    alt={currentUser?.name || 'Partner 1'}
                    className="w-14 h-14 rounded-full border-2 border-netflix-red object-cover shadow-md"
                  />
                  {!isAudioEnabled && (
                    <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-netflix-red flex items-center justify-center text-white text-[10px]">
                      <MicOff className="w-3 h-3" />
                    </div>
                  )}
                </div>
                <p className="text-xs font-bold text-white mt-2 truncate max-w-[120px]">{currentUser?.name}</p>
                <span className="text-[10px] text-cinema-muted mt-0.5">
                  {localStream ? (isVideoEnabled ? 'Camera on' : 'Camera off') : 'Camera not connected'}
                </span>
              </div>
            )
          ) : (
            // Current user is Partner 2, so Partner 1 is the remote peer
            remoteStream && partnerMediaState.isVideo ? (
              <video
                ref={remoteVideoRef}
                autoPlay
                playsInline
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center p-3 bg-gradient-to-b from-cinema-darker to-cinema-darkest">
                <div className="relative">
                  <img
                    src={partner1User?.avatar || partnerUser?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                    alt={p1Name}
                    className="w-14 h-14 rounded-full border-2 border-netflix-red object-cover shadow-md"
                  />
                  {!partnerMediaState.isAudio && (
                    <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-netflix-red flex items-center justify-center text-white text-[10px]">
                      <MicOff className="w-3 h-3" />
                    </div>
                  )}
                </div>
                <p className="text-xs font-bold text-white mt-2 truncate max-w-[120px]">{p1Name}</p>
                <span className="text-[10px] text-cinema-muted mt-0.5">
                  {remoteStream ? (partnerMediaState.isVideo ? 'Video on' : 'Camera off') : 'Connecting live feed...'}
                </span>
              </div>
            )
          )}

          {/* Partner 1 Label Badge */}
          <div className="absolute top-2 left-2 flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-black/70 backdrop-blur-md text-[10px] text-white border border-netflix-red/30">
            <span className="w-2 h-2 rounded-full bg-netflix-red" />
            <span className="font-semibold text-netflix-red">Partner 1:</span>
            <span className="truncate max-w-[80px] font-bold">{p1Name}</span>
            {isHost && <span className="text-[9px] text-cinema-muted">(You)</span>}
          </div>

          {/* Muted indicator */}
          {((isHost && !isAudioEnabled) || (!isHost && !partnerMediaState.isAudio && remoteStream)) && (
            <div className="absolute top-2 right-2 p-1 rounded-md bg-netflix-red/80 text-white text-[10px]">
              <MicOff className="w-3 h-3" />
            </div>
          )}
        </div>

        {/* Tile 2: Partner 2 (Joined with Room Code) */}
        <div className="relative aspect-video bg-cinema-darker rounded-2xl overflow-hidden border border-white/10 shadow-lg group">
          {!isHost ? (
            // Current user is Partner 2 (Local Stream)
            localStream && isVideoEnabled ? (
              <video
                ref={localVideoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover -scale-x-100"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center p-3 bg-gradient-to-b from-cinema-darker to-cinema-darkest">
                <div className="relative">
                  <img
                    src={currentUser?.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150'}
                    alt={currentUser?.name || 'Partner 2'}
                    className="w-14 h-14 rounded-full border-2 border-romantic-pink object-cover shadow-md"
                  />
                  {!isAudioEnabled && (
                    <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-netflix-red flex items-center justify-center text-white text-[10px]">
                      <MicOff className="w-3 h-3" />
                    </div>
                  )}
                </div>
                <p className="text-xs font-bold text-white mt-2 truncate max-w-[120px]">{currentUser?.name}</p>
                <span className="text-[10px] text-cinema-muted mt-0.5">
                  {localStream ? (isVideoEnabled ? 'Camera on' : 'Camera off') : 'Camera not connected'}
                </span>
              </div>
            )
          ) : (
            // Current user is Host, so Partner 2 is the remote peer
            p2Name ? (
              remoteStream && partnerMediaState.isVideo ? (
                <video
                  ref={remoteVideoRef}
                  autoPlay
                  playsInline
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center p-3 bg-gradient-to-b from-cinema-darker to-cinema-darkest">
                  <div className="relative">
                    <img
                      src={partner2User?.avatar || partnerUser?.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150'}
                      alt={p2Name}
                      className="w-14 h-14 rounded-full border-2 border-romantic-pink object-cover shadow-md"
                    />
                    {!partnerMediaState.isAudio && (
                      <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-netflix-red flex items-center justify-center text-white text-[10px]">
                        <MicOff className="w-3 h-3" />
                      </div>
                    )}
                  </div>
                  <p className="text-xs font-bold text-white mt-2 truncate max-w-[120px]">{p2Name}</p>
                  <span className="text-[10px] text-cinema-muted mt-0.5">
                    {remoteStream ? (partnerMediaState.isVideo ? 'Video on' : 'Camera off') : 'Connecting live feed...'}
                  </span>
                </div>
              )
            ) : (
              // Partner 2 has not entered the room yet
              <div className="w-full h-full flex flex-col items-center justify-center p-3 text-center bg-gradient-to-b from-cinema-darker/60 to-cinema-darkest border border-dashed border-white/10 rounded-2xl">
                <Heart className="w-8 h-8 text-romantic-pink/40 animate-pulse mb-1.5" />
                <p className="text-xs font-bold text-white">Waiting for Partner 2...</p>
                <p className="text-[10px] text-cinema-muted mt-1 max-w-[150px] leading-tight">
                  Share code <span className="font-mono font-bold text-romantic-pink">#{roomCode}</span> so they can join!
                </p>
              </div>
            )
          )}

          {/* Partner 2 Label Badge */}
          <div className="absolute top-2 left-2 flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-black/70 backdrop-blur-md text-[10px] text-white border border-romantic-pink/30">
            <span className="w-2 h-2 rounded-full bg-romantic-pink" />
            <span className="font-semibold text-romantic-pink">Partner 2:</span>
            <span className="truncate max-w-[80px] font-bold">{p2Name || 'Waiting...'}</span>
            {!isHost && <span className="text-[9px] text-cinema-muted">(You)</span>}
          </div>

          {/* Muted indicator */}
          {((!isHost && !isAudioEnabled) || (isHost && p2Name && !partnerMediaState.isAudio && remoteStream)) && (
            <div className="absolute top-2 right-2 p-1 rounded-md bg-netflix-red/80 text-white text-[10px]">
              <MicOff className="w-3 h-3" />
            </div>
          )}
        </div>
      </div>

      {/* WebRTC Quick Control Bar (Camera toggle, Mic toggle, Connect) */}
      <div className="flex items-center justify-between p-2.5 rounded-xl bg-cinema-darker/80 border border-white/5">
        <div className="flex items-center gap-2">
          {/* Toggle Microphone */}
          <button
            onClick={toggleAudio}
            disabled={!localStream}
            className={`p-2.5 rounded-xl flex items-center gap-1.5 text-xs font-medium transition-all ${
              isAudioEnabled
                ? 'bg-white/10 hover:bg-white/20 text-white'
                : 'bg-netflix-red text-white neon-red-glow'
            } disabled:opacity-40 disabled:cursor-not-allowed`}
            title={isAudioEnabled ? 'Mute Microphone' : 'Unmute Microphone'}
          >
            {isAudioEnabled ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
            <span className="hidden sm:inline">{isAudioEnabled ? 'Mic On' : 'Muted'}</span>
          </button>

          {/* Toggle Camera */}
          <button
            onClick={toggleVideo}
            disabled={!localStream}
            className={`p-2.5 rounded-xl flex items-center gap-1.5 text-xs font-medium transition-all ${
              isVideoEnabled
                ? 'bg-white/10 hover:bg-white/20 text-white'
                : 'bg-netflix-red text-white neon-red-glow'
            } disabled:opacity-40 disabled:cursor-not-allowed`}
            title={isVideoEnabled ? 'Turn Off Camera' : 'Turn On Camera'}
          >
            {isVideoEnabled ? <Video className="w-4 h-4" /> : <VideoOff className="w-4 h-4" />}
            <span className="hidden sm:inline">{isVideoEnabled ? 'Camera On' : 'Camera Off'}</span>
          </button>
        </div>

        {/* Start / Retry Video Call button if no stream */}
        {!localStream && (
          <button
            onClick={initLocalMedia}
            className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-netflix-red to-romantic-pink text-white text-xs font-semibold shadow-md hover:brightness-110"
          >
            Connect Camera & Mic
          </button>
        )}

        {localStream && (
          <div className="text-[11px] text-cinema-muted flex items-center gap-1">
            <Signal className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden sm:inline capitalize">{connectionStatus}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default WebRTCCallingTile;
