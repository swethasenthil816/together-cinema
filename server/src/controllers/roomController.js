import { createRoom, findRoomByCode, findRoomById, updateRoom, deleteRoom, readStore } from '../utils/dataStore.js';

export const handleCreateRoom = (req, res) => {
  try {
    const { name, activeMovieId } = req.body;
    const room = createRoom({
      name: name || `${req.user.name}'s Cinema Suite ❤️`,
      hostId: req.user.id,
      activeMovieId
    });

    res.status(201).json({
      message: 'Private room created successfully',
      room: {
        ...room,
        host: req.user
      }
    });
  } catch (err) {
    console.error('Create room error:', err);
    res.status(500).json({ error: 'Failed to create room' });
  }
};

export const handleJoinRoom = (req, res) => {
  try {
    const { code } = req.body;
    if (!code) {
      return res.status(400).json({ error: 'Room code is required' });
    }

    const room = findRoomByCode(code.trim());
    if (!room) {
      return res.status(404).json({ error: 'Room not found with this code. Please check and try again.' });
    }

    // Check if user is host
    if (room.hostId === req.user.id) {
      return res.json({
        message: 'Rejoined as host',
        room,
        role: 'host'
      });
    }

    // Check if user is already the participant
    if (room.participantId === req.user.id) {
      return res.json({
        message: 'Rejoined as partner',
        room,
        role: 'partner'
      });
    }

    // Enforce maximum 2 people rule
    if (room.participantId && room.participantId !== req.user.id) {
      return res.status(403).json({
        error: 'This private room is already full (maximum 2 partners allowed).',
        code: 'ROOM_FULL'
      });
    }

    // Assign as participant
    const updated = updateRoom(room.id, { participantId: req.user.id });
    res.json({
      message: 'Joined private movie room successfully',
      room: updated,
      role: 'partner'
    });
  } catch (err) {
    console.error('Join room error:', err);
    res.status(500).json({ error: 'Failed to join room' });
  }
};

export const handleGetRoom = (req, res) => {
  try {
    const { id } = req.params;
    const store = readStore();
    // Allow lookup by id or code
    let room = store.rooms.find(r => r.id === id || r.code.toUpperCase() === id.toUpperCase());

    if (!room) {
      return res.status(404).json({ error: 'Room not found' });
    }

    // Check authorization: must be host or participant, or if room has no participant yet, allow joining
    const isHost = room.hostId === req.user.id;
    const isParticipant = room.participantId === req.user.id;
    const canJoinAsParticipant = !room.participantId;

    if (!isHost && !isParticipant && !canJoinAsParticipant) {
      return res.status(403).json({ error: 'Unauthorized: Private room is reserved for 2 users' });
    }

    // Populate user info
    const hostUser = store.users.find(u => u.id === room.hostId);
    const participantUser = room.participantId ? store.users.find(u => u.id === room.participantId) : null;
    const activeMovie = store.movies.find(m => m.id === room.activeMovieId) || store.movies[0];

    res.json({
      room: {
        ...room,
        host: hostUser ? { id: hostUser.id, name: hostUser.name, avatar: hostUser.avatar } : null,
        participant: participantUser ? { id: participantUser.id, name: participantUser.name, avatar: participantUser.avatar } : null,
        activeMovie
      }
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to get room' });
  }
};

export const handleLeaveRoom = (req, res) => {
  try {
    const { id } = req.params;
    const room = findRoomById(id);
    if (!room) return res.status(404).json({ error: 'Room not found' });

    if (room.participantId === req.user.id) {
      updateRoom(id, { participantId: null });
    } else if (room.hostId === req.user.id) {
      // If host leaves, delete room or mark empty
      deleteRoom(id);
    }

    res.json({ message: 'Left room successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to leave room' });
  }
};

export const handleSetActiveMovie = (req, res) => {
  try {
    const { id } = req.params;
    const { movieId } = req.body;
    const room = findRoomById(id);
    if (!room) return res.status(404).json({ error: 'Room not found' });

    const updated = updateRoom(id, {
      activeMovieId: movieId,
      playbackState: {
        isPlaying: false,
        currentTime: 0,
        playbackRate: 1,
        updatedAt: Date.now()
      }
    });

    res.json({ message: 'Movie updated for room', room: updated });
  } catch (err) {
    res.status(500).json({ error: 'Failed to set active movie' });
  }
};

export const handleGetMyRooms = (req, res) => {
  const store = readStore();
  const myRooms = store.rooms.filter(r => r.hostId === req.user.id || r.participantId === req.user.id);
  res.json({ rooms: myRooms });
};
