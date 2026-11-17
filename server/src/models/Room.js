import mongoose from 'mongoose';

const roomSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true, index: true },
  code: { type: String, required: true, unique: true, uppercase: true, index: true },
  name: { type: String, required: true },
  hostId: { type: String, required: true },
  hostName: { type: String, default: null },
  hostAvatar: { type: String, default: null },
  participantId: { type: String, default: null },
  participantName: { type: String, default: null },
  participantAvatar: { type: String, default: null },
  activeMovieId: { type: String, default: null },
  playbackState: {
    isPlaying: { type: Boolean, default: false },
    currentTime: { type: Number, default: 0 },
    playbackRate: { type: Number, default: 1 },
    updatedAt: { type: Number, default: () => Date.now() }
  },
  createdAt: { type: String, default: () => new Date().toISOString() }
}, {
  timestamps: false,
  versionKey: false
});

export const Room = mongoose.models.Room || mongoose.model('Room', roomSchema);
export default Room;
