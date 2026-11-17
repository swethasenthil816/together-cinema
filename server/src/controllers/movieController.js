import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { getMovies, findMovieById, createMovie, deleteMovie } from '../utils/dataStore.js';
import { streamVideoFile } from '../utils/videoStreamer.js';
import {
  isCloudStorageConfigured,
  createPresignedUploadUrl,
  createPresignedDownloadUrl,
  getCloudObjectStream,
  deleteCloudObject,
  getStorageConfig,
  initiateMultipartUpload,
  getMultipartPartUploadUrl,
  completeMultipartUpload,
  abortMultipartUpload
} from '../services/storageService.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const getBaseUploadDir = () => {
  return process.env.UPLOAD_DIR
    ? path.resolve(process.env.UPLOAD_DIR)
    : path.resolve(__dirname, '../../uploads');
};

export const handleGetMovies = (req, res) => {
  try {
    const { search } = req.query;
    let movies = getMovies();
    if (search && search.trim()) {
      const q = search.trim().toLowerCase();
      movies = movies.filter(m =>
        m.title.toLowerCase().includes(q) ||
        (m.description && m.description.toLowerCase().includes(q))
      );
    }
    res.json({ movies });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch movies' });
  }
};

export const handleGetMovieById = (req, res) => {
  try {
    const { id } = req.params;
    const movie = findMovieById(id);
    if (!movie) {
      return res.status(404).json({ error: 'Movie not found' });
    }
    res.json({ movie });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch movie' });
  }
};

/**
 * Get secure signed playback URL for a movie (private Cloudflare R2 / AWS S3)
 * Generates a signed GET URL with 6-hour expiration so both participants
 * in a private room can stream and seek without public bucket exposure.
 */
export const handleGetMovieSignedUrl = async (req, res) => {
  try {
    const { id } = req.params;
    const movie = findMovieById(id);
    if (!movie) {
      return res.status(404).json({ error: 'Movie not found' });
    }

    if (movie.storageKey && isCloudStorageConfigured()) {
      const signedUrl = await createPresignedDownloadUrl(movie.storageKey, 21600); // 6 hours
      return res.json({
        signedUrl,
        expiresIn: 21600,
        storageType: movie.storageType || 'r2'
      });
    }

    // If sample movie or local movie
    return res.json({
      signedUrl: movie.streamUrl,
      expiresIn: null,
      storageType: movie.storageType || 'local'
    });
  } catch (err) {
    console.error('Error generating signed playback URL:', err);
    res.status(500).json({ error: 'Failed to generate secure playback URL' });
  }
};

/**
 * Request a presigned cloud upload URL for single PUT direct client-to-cloud upload (R2 / S3)
 * Supports files up to 5GB without hitting Render reverse proxy timeouts.
 */
export const handleGetUploadUrl = async (req, res) => {
  try {
    if (!isCloudStorageConfigured()) {
      return res.json({
        isCloud: false,
        message: 'Cloud storage is not configured. Falling back to direct server upload.'
      });
    }

    const { filename, contentType = 'video/mp4' } = req.body;
    if (!filename) {
      return res.status(400).json({ error: 'Filename is required' });
    }

    const uploadInfo = await createPresignedUploadUrl({ filename, contentType });
    res.json({
      isCloud: true,
      ...uploadInfo
    });
  } catch (err) {
    console.error('Presigned URL error:', err);
    res.status(500).json({ error: 'Failed to generate cloud upload URL', details: err.message });
  }
};

// ----------------------------------------------------
// MULTIPART RESUMABLE UPLOAD CONTROLLERS
// ----------------------------------------------------

export const handleInitiateMultipart = async (req, res) => {
  try {
    if (!isCloudStorageConfigured()) {
      return res.status(400).json({ error: 'Cloud storage is not configured' });
    }
    const { filename, contentType = 'video/mp4' } = req.body;
    const result = await initiateMultipartUpload({ filename, contentType });
    res.json(result);
  } catch (err) {
    console.error('Initiate multipart error:', err);
    res.status(500).json({ error: 'Failed to initiate multipart upload', details: err.message });
  }
};

export const handleGetMultipartPartUrl = async (req, res) => {
  try {
    if (!isCloudStorageConfigured()) {
      return res.status(400).json({ error: 'Cloud storage is not configured' });
    }
    const { key, uploadId, partNumber } = req.body;
    const result = await getMultipartPartUploadUrl({ key, uploadId, partNumber });
    res.json(result);
  } catch (err) {
    console.error('Get part upload URL error:', err);
    res.status(500).json({ error: 'Failed to generate part upload URL', details: err.message });
  }
};

export const handleCompleteMultipart = async (req, res) => {
  try {
    if (!isCloudStorageConfigured()) {
      return res.status(400).json({ error: 'Cloud storage is not configured' });
    }
    const { key, uploadId, parts, title, description, duration, size, filename } = req.body;
    const completeResult = await completeMultipartUpload({ key, uploadId, parts });

    const config = getStorageConfig();
    const newMovie = createMovie({
      title: (title || filename || 'Uploaded Movie').trim(),
      description: description || 'Uploaded movie ready for private streaming.',
      duration: duration || 'Custom Feature',
      durationSeconds: 0,
      size: size || 'Cloud Stored',
      filename: filename || path.basename(key),
      localPath: null,
      streamUrl: completeResult.streamUrl,
      thumbnail: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=800&auto=format&fit=crop&q=80',
      isSample: false,
      storageType: config.provider || 'r2',
      storageKey: key,
      uploadedBy: req.user ? req.user.id : 'user',
      uploadedByName: req.user ? req.user.name : 'Partner'
    });

    res.status(201).json({
      message: 'Multipart movie upload completed and saved to Shared Library!',
      movie: newMovie
    });
  } catch (err) {
    console.error('Complete multipart upload error:', err);
    res.status(500).json({ error: 'Failed to complete multipart upload', details: err.message });
  }
};

export const handleAbortMultipart = async (req, res) => {
  try {
    const { key, uploadId } = req.body;
    await abortMultipartUpload({ key, uploadId });
    res.json({ message: 'Multipart upload aborted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to abort multipart upload' });
  }
};

/**
 * Confirm single PUT cloud upload once file has finished uploading
 * Stores lightweight metadata in MongoDB Atlas (NEVER stores binary movie files in MongoDB).
 */
export const handleConfirmUpload = async (req, res) => {
  try {
    const { title, description, duration, key, streamUrl, filename, size, thumbnail } = req.body;

    if (!key) {
      return res.status(400).json({ error: 'Storage key is required to confirm upload' });
    }

    const config = getStorageConfig();
    const finalStreamUrl = streamUrl || `/api/movies/stream/cloud/${encodeURIComponent(key)}`;

    const newMovie = createMovie({
      title: (title || filename || 'Uploaded Movie').trim(),
      description: description || 'Uploaded movie ready for private streaming.',
      duration: duration || 'Custom Feature',
      durationSeconds: 0,
      size: size || 'Cloud Stored',
      filename: filename || path.basename(key),
      localPath: null,
      streamUrl: finalStreamUrl,
      thumbnail: thumbnail || 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=800&auto=format&fit=crop&q=80',
      isSample: false,
      storageType: config.provider || 'r2',
      storageKey: key,
      uploadedBy: req.user ? req.user.id : 'user',
      uploadedByName: req.user ? req.user.name : 'Partner'
    });

    res.status(201).json({
      message: 'Movie verified and added to Shared Library successfully!',
      movie: newMovie
    });
  } catch (err) {
    console.error('Confirm cloud upload error:', err);
    res.status(500).json({ error: 'Failed to confirm cloud movie upload' });
  }
};

/**
 * Stream video from Cloudflare R2 / AWS S3 using secure signed URLs
 * Supports byte-range requests and allows BOTH room participants to stream simultaneously.
 */
export const handleStreamCloudMovie = async (req, res) => {
  try {
    const key = decodeURIComponent(req.params.key);
    const config = getStorageConfig();

    // If public development URL is explicitly configured, redirect
    if (config.publicUrl) {
      return res.redirect(302, `${config.publicUrl}/${key}`);
    }

    // For private R2 buckets, generate a secure 6-hour presigned GET URL and redirect 302
    const presignedGetUrl = await createPresignedDownloadUrl(key, 21600);
    return res.redirect(302, presignedGetUrl);
  } catch (err) {
    console.error('Cloud streaming error:', err);
    res.status(500).json({ error: 'Failed to stream cloud video', details: err.message });
  }
};

/**
 * Standard multipart form upload (falls back to local uploads if R2/S3 is not configured)
 */
export const handleUploadMovie = (req, res) => {
  try {
    const movieFile = req.files && req.files['movie'] ? req.files['movie'][0] : null;
    const thumbFile = req.files && req.files['thumbnail'] ? req.files['thumbnail'][0] : null;

    if (!movieFile) {
      return res.status(400).json({ error: 'Movie video file (MP4 or WebM) is required' });
    }

    const { title, description, duration } = req.body;
    const movieTitle = title ? title.trim() : path.parse(movieFile.originalname).name;

    const sizeInMB = (movieFile.size / (1024 * 1024)).toFixed(1);
    const sizeStr = movieFile.size > 1024 * 1024 * 1024
      ? `${(movieFile.size / (1024 * 1024 * 1024)).toFixed(2)} GB`
      : `${sizeInMB} MB`;

    const filename = movieFile.filename;
    const localPath = movieFile.path;

    const thumbnail = thumbFile
      ? `/uploads/thumbnails/${thumbFile.filename}`
      : 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=800&auto=format&fit=crop&q=80';

    const newMovie = createMovie({
      title: movieTitle,
      description: description || 'Uploaded movie ready for private streaming.',
      duration: duration || 'Custom Feature',
      durationSeconds: 0,
      size: sizeStr,
      filename,
      localPath,
      streamUrl: `/api/movies/stream/file/${filename}`,
      thumbnail,
      isSample: false,
      storageType: 'local',
      storageKey: null,
      uploadedBy: req.user ? req.user.id : 'user',
      uploadedByName: req.user ? req.user.name : 'Partner'
    });

    res.status(201).json({
      message: 'Movie uploaded and added to Shared Library successfully!',
      movie: newMovie
    });
  } catch (err) {
    console.error('Upload movie error:', err);
    res.status(500).json({ error: 'Failed to upload movie' });
  }
};

/**
 * Local file streaming with HTTP 206 Range support
 */
export const handleStreamMovie = (req, res) => {
  try {
    const { filename } = req.params;
    const safeFilename = path.basename(filename);
    const baseUploadDir = getBaseUploadDir();
    const filePath = path.join(baseUploadDir, 'movies', safeFilename);

    streamVideoFile(req, res, filePath);
  } catch (err) {
    console.error('Streaming error:', err);
    res.status(500).json({ error: 'Failed to stream video' });
  }
};

export const handleDeleteMovie = async (req, res) => {
  try {
    const { id } = req.params;
    const movie = findMovieById(id);
    if (!movie) {
      return res.status(404).json({ error: 'Movie not found' });
    }

    if (movie.isSample) {
      return res.status(400).json({ error: 'Sample library movies cannot be deleted' });
    }

    if (movie.storageKey) {
      await deleteCloudObject(movie.storageKey);
    }

    deleteMovie(id);
    res.json({ message: 'Movie deleted from library successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete movie' });
  }
};
