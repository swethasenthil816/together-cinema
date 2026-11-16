import { useState, useEffect, useRef, useCallback } from 'react';
import { getSocket } from '../services/socket';

const ICE_SERVERS = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:stun2.l.google.com:19302' },
    { urls: 'stun:stun.services.mozilla.com' },
  ],
};

export const useWebRTC = (roomId, currentUser) => {
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [partnerMediaState, setPartnerMediaState] = useState({ isVideo: true, isAudio: true });
  const [connectionStatus, setConnectionStatus] = useState('disconnected'); // 'disconnected' | 'connecting' | 'connected' | 'error'
  const [mediaError, setMediaError] = useState(null);

  const pcRef = useRef(null);
  const localStreamRef = useRef(null);
  const remotePeerIdRef = useRef(null);

  // Initialize local user media
  const initLocalMedia = useCallback(async () => {
    try {
      setMediaError(null);
      // Check browser support
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('WebRTC camera/microphone not supported by this browser.');
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          frameRate: { ideal: 24 },
        },
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });

      localStreamRef.current = stream;
      setLocalStream(stream);
      setIsVideoEnabled(true);
      setIsAudioEnabled(true);
      return stream;
    } catch (err) {
      console.warn('Could not acquire local camera/mic stream:', err.message);
      setMediaError(err.message || 'Camera or microphone access denied');
      return null;
    }
  }, []);

  // Create PeerConnection
  const createPeerConnection = useCallback((targetSocketId) => {
    if (pcRef.current) {
      pcRef.current.close();
    }

    const pc = new RTCPeerConnection(ICE_SERVERS);
    pcRef.current = pc;
    remotePeerIdRef.current = targetSocketId;

    // Attach local tracks
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => {
        pc.addTrack(track, localStreamRef.current);
      });
    }

    // Handle remote track
    pc.ontrack = (event) => {
      console.log('📡 Received remote WebRTC track:', event.track.kind);
      if (event.streams && event.streams[0]) {
        setRemoteStream(event.streams[0]);
        setConnectionStatus('connected');
      }
    };

    // Handle ICE candidates
    const socket = getSocket();
    pc.onicecandidate = (event) => {
      if (event.candidate && targetSocketId) {
        socket.emit('webrtc-ice-candidate', {
          targetSocketId,
          candidate: event.candidate,
        });
      }
    };

    pc.onconnectionstatechange = () => {
      console.log('WebRTC connection state:', pc.connectionState);
      if (pc.connectionState === 'connected') {
        setConnectionStatus('connected');
      } else if (pc.connectionState === 'connecting') {
        setConnectionStatus('connecting');
      } else if (['failed', 'disconnected', 'closed'].includes(pc.connectionState)) {
        setConnectionStatus('disconnected');
      }
    };

    return pc;
  }, []);

  // Initiate an offer to partner
  const callPeer = useCallback(async (targetSocketId) => {
    try {
      setConnectionStatus('connecting');
      const pc = createPeerConnection(targetSocketId);
      const offer = await pc.createOffer({
        offerToReceiveAudio: true,
        offerToReceiveVideo: true,
      });
      await pc.setLocalDescription(offer);

      const socket = getSocket();
      socket.emit('webrtc-offer', {
        targetSocketId,
        offer,
        callerUser: currentUser,
      });
    } catch (err) {
      console.error('Error creating WebRTC call offer:', err);
      setConnectionStatus('error');
    }
  }, [createPeerConnection, currentUser]);

  // Toggle Video Track (Camera ON/OFF)
  const toggleVideo = useCallback(() => {
    if (localStreamRef.current) {
      const videoTracks = localStreamRef.current.getVideoTracks();
      if (videoTracks.length > 0) {
        const nextState = !videoTracks[0].enabled;
        videoTracks.forEach(t => { t.enabled = nextState; });
        setIsVideoEnabled(nextState);

        const socket = getSocket();
        socket.emit('webrtc-media-toggle', {
          roomId,
          type: 'video',
          isEnabled: nextState,
          userId: currentUser?.id,
        });
      }
    }
  }, [roomId, currentUser]);

  // Toggle Audio Track (Microphone ON/OFF)
  const toggleAudio = useCallback(() => {
    if (localStreamRef.current) {
      const audioTracks = localStreamRef.current.getAudioTracks();
      if (audioTracks.length > 0) {
        const nextState = !audioTracks[0].enabled;
        audioTracks.forEach(t => { t.enabled = nextState; });
        setIsAudioEnabled(nextState);

        const socket = getSocket();
        socket.emit('webrtc-media-toggle', {
          roomId,
          type: 'audio',
          isEnabled: nextState,
          userId: currentUser?.id,
        });
      }
    }
  }, [roomId, currentUser]);

  // Setup WebRTC socket signaling listeners
  useEffect(() => {
    const socket = getSocket();

    const handlePeerJoined = async ({ peerId }) => {
      console.log('Partner joined room, initiating WebRTC connection to:', peerId);
      await callPeer(peerId);
    };

    const handleOffer = async ({ callerSocketId, offer }) => {
      console.log('Received WebRTC offer from:', callerSocketId);
      try {
        setConnectionStatus('connecting');
        const pc = createPeerConnection(callerSocketId);
        await pc.setRemoteDescription(new RTCSessionDescription(offer));
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);

        socket.emit('webrtc-answer', {
          targetSocketId: callerSocketId,
          answer,
        });
      } catch (err) {
        console.error('Error handling WebRTC offer:', err);
        setConnectionStatus('error');
      }
    };

    const handleAnswer = async ({ answer }) => {
      console.log('Received WebRTC answer');
      if (pcRef.current) {
        try {
          await pcRef.current.setRemoteDescription(new RTCSessionDescription(answer));
        } catch (err) {
          console.error('Error setting remote description from answer:', err);
        }
      }
    };

    const handleIceCandidate = async ({ candidate }) => {
      if (pcRef.current && candidate) {
        try {
          await pcRef.current.addIceCandidate(new RTCIceCandidate(candidate));
        } catch (err) {
          console.error('Error adding ICE candidate:', err);
        }
      }
    };

    const handleMediaToggled = ({ type, isEnabled }) => {
      setPartnerMediaState(prev => ({
        ...prev,
        [type === 'video' ? 'isVideo' : 'isAudio']: isEnabled,
      }));
    };

    const handlePeerLeft = () => {
      console.log('Partner left WebRTC call');
      setRemoteStream(null);
      setConnectionStatus('disconnected');
      if (pcRef.current) {
        pcRef.current.close();
        pcRef.current = null;
      }
    };

    socket.on('webrtc-peer-joined', handlePeerJoined);
    socket.on('webrtc-offer', handleOffer);
    socket.on('webrtc-answer', handleAnswer);
    socket.on('webrtc-ice-candidate', handleIceCandidate);
    socket.on('partner-media-toggled', handleMediaToggled);
    socket.on('webrtc-peer-left', handlePeerLeft);

    return () => {
      socket.off('webrtc-peer-joined', handlePeerJoined);
      socket.off('webrtc-offer', handleOffer);
      socket.off('webrtc-answer', handleAnswer);
      socket.off('webrtc-ice-candidate', handleIceCandidate);
      socket.off('partner-media-toggled', handleMediaToggled);
      socket.off('webrtc-peer-left', handlePeerLeft);
    };
  }, [callPeer, createPeerConnection]);

  // Stop tracks and clean up on unmount
  useEffect(() => {
    return () => {
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach((track) => track.stop());
      }
      if (pcRef.current) {
        pcRef.current.close();
      }
    };
  }, []);

  return {
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
  };
};
