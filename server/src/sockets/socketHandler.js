import { updateRoom, findRoomById, addChatMessage, getRoomMessages } from '../utils/dataStore.js';

// Active room participant tracking in memory
// Map: roomId -> Set of { socketId, userId, userName, userAvatar }
const roomParticipants = new Map();

// Map: socketId -> { roomId, userId, userName }
const socketUserMap = new Map();

export const setupSocketHandlers = (io) => {
  io.on('connection', (socket) => {
    // ----------------------------------------------------
    // ROOM JOIN & LEAVE
    // ----------------------------------------------------
    socket.on('join-room', ({ roomId, user }) => {
      if (!roomId || !user) return;

      socket.join(roomId);
      socketUserMap.set(socket.id, { roomId, userId: user.id, userName: user.name });

      if (!roomParticipants.has(roomId)) {
        roomParticipants.set(roomId, new Map());
      }
      const participants = roomParticipants.get(roomId);

      // Check room capacity (max 2 people)
      if (participants.size >= 2 && !participants.has(user.id)) {
        socket.emit('room-error', { message: 'Room is already full (maximum 2 partners).' });
        socket.leave(roomId);
        return;
      }

      participants.set(user.id, {
        socketId: socket.id,
        user
      });

      const memberList = Array.from(participants.values()).map(p => p.user);

      // Notify the room of current members
      io.to(roomId).emit('room-members-updated', {
        members: memberList,
        count: memberList.length
      });

      // Send recent chat messages to joining user
      const messages = getRoomMessages(roomId);
      socket.emit('chat-history', { messages });

      // If both partners are now present, emit cute celebratory event!
      if (memberList.length === 2) {
        io.to(roomId).emit('romantic-both-joined', {
          message: 'Both of you are here! Your romantic movie date has officially started! ❤️🎬',
          users: memberList
        });
      }

      // Notify other peer in room for WebRTC peer connection
      socket.to(roomId).emit('webrtc-peer-joined', {
        peerId: socket.id,
        user
      });
    });

    socket.on('leave-room', ({ roomId, userId }) => {
      handleUserLeave(socket, io, roomId, userId);
    });

    // ----------------------------------------------------
    // SYNCHRONIZED MOVIE PLAYER
    // ----------------------------------------------------

    // Play event
    socket.on('player-play', ({ roomId, currentTime, timestamp }) => {
      // Broadcast to partner (prevent sync loop by using socket.to)
      socket.to(roomId).emit('sync-player-play', {
        currentTime,
        timestamp: timestamp || Date.now(),
        fromSocketId: socket.id
      });
    });

    // Pause event
    socket.on('player-pause', ({ roomId, currentTime, timestamp }) => {
      socket.to(roomId).emit('sync-player-pause', {
        currentTime,
        timestamp: timestamp || Date.now(),
        fromSocketId: socket.id
      });
    });

    // Seek event
    socket.on('player-seek', ({ roomId, currentTime, timestamp }) => {
      socket.to(roomId).emit('sync-player-seek', {
        currentTime,
        timestamp: timestamp || Date.now(),
        fromSocketId: socket.id
      });
    });

    // Playback rate (speed) sync
    socket.on('player-rate', ({ roomId, playbackRate }) => {
      socket.to(roomId).emit('sync-player-rate', {
        playbackRate,
        fromSocketId: socket.id
      });
    });

    // Buffering state (if one partner buffers, partner's player gently pauses)
    socket.on('player-buffering', ({ roomId, isBuffering, currentTime, userName }) => {
      socket.to(roomId).emit('sync-player-buffering', {
        isBuffering,
        currentTime,
        userName,
        fromSocketId: socket.id
      });
    });

    // Active movie switch in room
    socket.on('room-change-movie', ({ roomId, movie, changedBy }) => {
      updateRoom(roomId, {
        activeMovieId: movie.id,
        playbackState: { isPlaying: false, currentTime: 0, playbackRate: 1, updatedAt: Date.now() }
      });
      io.to(roomId).emit('sync-movie-changed', {
        movie,
        changedBy
      });
    });

    // Request initial playback state from existing partner
    socket.on('player-request-state', ({ roomId }) => {
      socket.to(roomId).emit('player-give-state', {
        requesterSocketId: socket.id
      });
    });

    // Respond with state directly to the new joiner
    socket.on('player-send-state', ({ targetSocketId, isPlaying, currentTime, playbackRate }) => {
      io.to(targetSocketId).emit('sync-player-state', {
        isPlaying,
        currentTime,
        playbackRate
      });
    });

    // ----------------------------------------------------
    // WEBRTC SIGNALING (Live 2-way Video & Audio Calling)
    // ----------------------------------------------------

    socket.on('webrtc-offer', ({ targetSocketId, offer, callerUser }) => {
      io.to(targetSocketId).emit('webrtc-offer', {
        callerSocketId: socket.id,
        offer,
        callerUser
      });
    });

    socket.on('webrtc-answer', ({ targetSocketId, answer }) => {
      io.to(targetSocketId).emit('webrtc-answer', {
        responderSocketId: socket.id,
        answer
      });
    });

    socket.on('webrtc-ice-candidate', ({ targetSocketId, candidate }) => {
      io.to(targetSocketId).emit('webrtc-ice-candidate', {
        senderSocketId: socket.id,
        candidate
      });
    });

    socket.on('webrtc-media-toggle', ({ roomId, type, isEnabled, userId }) => {
      socket.to(roomId).emit('partner-media-toggled', {
        type, // 'video' or 'audio'
        isEnabled,
        userId
      });
    });

    // ----------------------------------------------------
    // REAL-TIME CHAT & ROMANTIC REACTIONS
    // ----------------------------------------------------

    socket.on('chat-send-message', ({ roomId, message }) => {
      const savedMsg = addChatMessage({
        roomId,
        senderId: message.senderId,
        senderName: message.senderName,
        senderAvatar: message.senderAvatar,
        text: message.text,
        type: message.type || 'text'
      });

      io.to(roomId).emit('chat-new-message', { message: savedMsg });
    });

    socket.on('chat-typing', ({ roomId, isTyping, userName }) => {
      socket.to(roomId).emit('chat-typing-status', {
        isTyping,
        userName,
        fromSocketId: socket.id
      });
    });

    // Romantic Reaction: Hearts, confetti, kisses, sparkles
    socket.on('send-romantic-reaction', ({ roomId, reactionType, senderName, coordinates }) => {
      io.to(roomId).emit('romantic-reaction-received', {
        reactionType, // 'heart', 'kiss', 'sparkle', 'popcorn', 'hug'
        senderName,
        coordinates,
        timestamp: Date.now()
      });
    });

    // ----------------------------------------------------
    // DISCONNECT HANDLING
    // ----------------------------------------------------
    socket.on('disconnect', () => {
      const userInfo = socketUserMap.get(socket.id);
      if (userInfo) {
        handleUserLeave(socket, io, userInfo.roomId, userInfo.userId);
        socketUserMap.delete(socket.id);
      }
    });
  });
};

const handleUserLeave = (socket, io, roomId, userId) => {
  if (!roomId || !roomParticipants.has(roomId)) return;

  const participants = roomParticipants.get(roomId);
  participants.delete(userId);

  socket.leave(roomId);

  const memberList = Array.from(participants.values()).map(p => p.user);

  io.to(roomId).emit('room-members-updated', {
    members: memberList,
    count: memberList.length
  });

  // Inform remaining partner that WebRTC peer left
  socket.to(roomId).emit('webrtc-peer-left', {
    peerSocketId: socket.id,
    userId
  });

  if (participants.size === 0) {
    roomParticipants.delete(roomId);
  }
};
