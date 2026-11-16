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

      {/* Two Webcam Video Screens */}
      <div className="grid grid-cols-2 gap-3">
        {/* Remote Partner Video Screen */}
        <div className="relative aspect-video bg-cinema-darker rounded-2xl overflow-hidden border border-white/10 shadow-lg group">
          {remoteStream && partnerMediaState.isVideo ? (
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
                  src={partnerUser?.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150'}
                  alt={partnerUser?.name || 'Partner'}
                  className="w-14 h-14 rounded-full border-2 border-romantic-pink/50 object-cover shadow-md"
                />
                {!partnerMediaState.isAudio && (
                  <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-netflix-red flex items-center justify-center text-white text-[10px]">
                    <MicOff className="w-3 h-3" />
                  </div>
                )}
              </div>
              <p className="text-xs font-semibold text-white mt-2 truncate max-w-[120px]">
                {partnerUser?.name || 'Waiting for Partner...'}
              </p>
              <span className="text-[10px] text-cinema-muted mt-0.5">
                {remoteStream ? (partnerMediaState.isVideo ? 'Video on' : 'Camera off') : 'Connecting live feed...'}
              </span>
            </div>
          )}

          {/* Connection Status & Name Badge */}
          <div className="absolute top-2 left-2 flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-md text-[10px] text-white">
            <span className={`w-2 h-2 rounded-full ${
              connectionStatus === 'connected' ? 'bg-emerald-500 animate-pulse' : 'bg-amber-400'
            }`} />
            <span className="truncate max-w-[80px] font-medium">{partnerUser?.name || 'Partner'}</span>
          </div>

          {/* Partner muted indicator */}
          {!partnerMediaState.isAudio && remoteStream && (
            <div className="absolute top-2 right-2 p-1 rounded-md bg-netflix-red/80 text-white text-[10px]">
              <MicOff className="w-3 h-3" />
            </div>
          )}
        </div>

        {/* Local User (You) Video Screen */}
        <div className="relative aspect-video bg-cinema-darker rounded-2xl overflow-hidden border border-white/10 shadow-lg group">
          {localStream && isVideoEnabled ? (
            <video
              ref={localVideoRef}
              autoPlay
              playsInline
              muted // Always mute local video so user doesn't hear their own echo
              className="w-full h-full object-cover -scale-x-100" // Mirrored webcam
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center p-3 bg-gradient-to-b from-cinema-darker to-cinema-darkest">
              <div className="relative">
                <img
                  src={currentUser?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                  alt={currentUser?.name || 'You'}
                  className="w-14 h-14 rounded-full border-2 border-netflix-red/50 object-cover shadow-md"
                />
                {!isAudioEnabled && (
                  <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-netflix-red flex items-center justify-center text-white text-[10px]">
                    <MicOff className="w-3 h-3" />
                  </div>
                )}
              </div>
              <p className="text-xs font-semibold text-white mt-2">You</p>
              <span className="text-[10px] text-cinema-muted mt-0.5">
                {localStream ? (isVideoEnabled ? 'Camera on' : 'Camera off') : 'Camera not connected'}
              </span>
            </div>
          )}

          {/* Local User Badge */}
          <div className="absolute top-2 left-2 flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-md text-[10px] text-white">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span className="font-medium">You</span>
          </div>

          {/* Self Muted indicator */}
          {!isAudioEnabled && (
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
