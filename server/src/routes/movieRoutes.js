import express from 'express';
import {
  handleGetMovies,
  handleGetMovieById,
  handleGetMovieSignedUrl,
  handleGetUploadUrl,
  handleConfirmUpload,
  handleInitiateMultipart,
  handleGetMultipartPartUrl,
  handleCompleteMultipart,
  handleAbortMultipart,
  handleUploadMovie,
  handleStreamMovie,
  handleStreamCloudMovie,
  handleDeleteMovie
} from '../controllers/movieController.js';
import { authMiddleware } from '../middleware/auth.js';
import { movieUpload } from '../middleware/upload.js';

const router = express.Router();

router.get('/', authMiddleware, handleGetMovies);
router.get('/stream/file/:filename', handleStreamMovie); // Local video stream with Range headers
router.get('/stream/cloud/:key', handleStreamCloudMovie); // Cloud private signed URL stream redirect
router.get('/:id/signed-url', authMiddleware, handleGetMovieSignedUrl); // Direct secure signed URL for playback
router.get('/:id', authMiddleware, handleGetMovieById);

// Single PUT direct cloud storage upload (up to 5GB)
router.post('/upload-url', authMiddleware, handleGetUploadUrl);
router.post('/confirm-upload', authMiddleware, handleConfirmUpload);

// Multipart / chunked cloud storage upload (for multi-gigabyte files)
router.post('/multipart/initiate', authMiddleware, handleInitiateMultipart);
router.post('/multipart/part-url', authMiddleware, handleGetMultipartPartUrl);
router.post('/multipart/complete', authMiddleware, handleCompleteMultipart);
router.post('/multipart/abort', authMiddleware, handleAbortMultipart);

// Fallback direct server upload
router.post(
  '/upload',
  authMiddleware,
  movieUpload.fields([
    { name: 'movie', maxCount: 1 },
    { name: 'thumbnail', maxCount: 1 }
  ]),
  handleUploadMovie
);

router.delete('/:id', authMiddleware, handleDeleteMovie);

export default router;
