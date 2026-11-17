import mongoose from 'mongoose';

/**
 * Movie Metadata Schema
 * IMPORTANT: Video binaries are NEVER stored in MongoDB!
 * Cloudflare R2 / AWS S3 / local static storage handles video files.
 * MongoDB stores ONLY lightweight movie metadata and streaming URLs.
 */
const movieSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true, index: true },
  title: { type: String, required: true },
  description: { type: String, default: '' },
  duration: { type: String, default: 'Custom Feature' },
  durationSeconds: { type: Number, default: 0 },
  size: { type: String, default: '' },
  filename: { type: String, default: '' },
  localPath: { type: String, default: null },
  streamUrl: { type: String, required: true },
  thumbnail: { type: String, default: '' },
  isSample: { type: Boolean, default: false },
  storageType: { type: String, enum: ['local', 'cloud', 'r2', 's3', 'external'], default: 'local' },
  storageKey: { type: String, default: null },
  uploadedBy: { type: String, default: 'system' },
  uploadedByName: { type: String, default: 'Partner' },
  createdAt: { type: String, default: () => new Date().toISOString() }
}, {
  timestamps: false,
  versionKey: false
});

export const Movie = mongoose.models.Movie || mongoose.model('Movie', movieSchema);
export default Movie;
