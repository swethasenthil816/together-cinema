import { createRoom, findRoomByCode, findRoomById, updateRoom, deleteRoom, readStore } from '../utils/dataStore.js';

export const handleCreateRoom = (req, res) => {
  try {
    const { name, activeMovieId } = req.body;
    const room = createRoom({
      name: name || `${req.user.name}'s Cinema Suite ❤️`,
      hostId: req.user.id,
      hostName: req.user.name,
      hostAvatar: req.user.avatar,
      activeMovieId
    });

    res.status(201).json({
      message: 'Private room created successfully',
      room: {
        ...room,
        host: {
          id: req.user.id,
          name: req.user.name,
          avatar: req.user.avatar,
          partnerRole: 'Partner 1'
        },
        participant: null
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

    // Check if user is host (Partner 1)
    if (room.hostId === req.user.id) {
      return res.json({
        message: 'Rejoined as Partner 1 (Host)',
        room,
        role: 'host',
        partnerRole: 'Partner 1'
      });
    }

    // Check if user is already the participant (Partner 2)
    if (room.participantId === req.user.id) {
      return res.json({
        message: 'Rejoined as Partner 2',
        room,
        role: 'partner',
        partnerRole: 'Partner 2'
      });
    }

    // Enforce maximum 2 people rule
    if (room.participantId && room.participantId !== req.user.id) {
      return res.status(403).json({
        error: 'This private room is already full (maximum 2 partners allowed).',
        code: 'ROOM_FULL'
      });
    }

    // Assign as participant (Partner 2) using their actual username
    const updated = updateRoom(room.id, {
      participantId: req.user.id,
      participantName: req.user.name,
      participantAvatar: req.user.avatar
    });

    res.json({
      message: 'Joined private movie room successfully as Partner 2',
      room: updated,
      role: 'partner',
      partnerRole: 'Partner 2'
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
    const canJoinAsParticipant = !room.participantId && !isHost;

    if (!isHost && !isParticipant && !canJoinAsParticipant) {
      return res.status(403).json({ error: 'Unauthorized: Private room is reserved for 2 users' });
    }

    // If joining as the 2nd person (Partner 2), register them in the room
    if (canJoinAsParticipant) {
      room = updateRoom(room.id, {
        participantId: req.user.id,
        participantName: req.user.name,
        participantAvatar: req.user.avatar
      }) || room;
    }

    // Populate user info with explicit Partner 1 and Partner 2 designations
    const hostUser = store.users.find(u => u.id === room.hostId);
    const participantUser = room.participantId ? store.users.find(u => u.id === room.participantId) : null;
    const activeMovie = store.movies.find(m => m.id === room.activeMovieId) || store.movies[0];

    const hostData = hostUser
      ? { id: hostUser.id, name: hostUser.name, avatar: hostUser.avatar, partnerRole: 'Partner 1' }
      : (room.hostName ? { id: room.hostId, name: room.hostName, avatar: room.hostAvatar, partnerRole: 'Partner 1' } : null);

    const participantData = participantUser
      ? { id: participantUser.id, name: participantUser.name, avatar: participantUser.avatar, partnerRole: 'Partner 2' }
      : (room.participantName ? { id: room.participantId, name: room.participantName, avatar: room.participantAvatar, partnerRole: 'Partner 2' } : null);

    res.json({
      room: {
        ...room,
        host: hostData,
        participant: participantData,
        partner1: hostData,
        partner2: participantData,
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
