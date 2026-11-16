import express from 'express';
import {
  handleGetMovies,
  handleGetMovieById,
  handleUploadMovie,
  handleStreamMovie,
  handleDeleteMovie
} from '../controllers/movieController.js';
import { authMiddleware } from '../middleware/auth.js';
import { movieUpload } from '../middleware/upload.js';

const router = express.Router();

router.get('/', authMiddleware, handleGetMovies);
router.get('/:id', authMiddleware, handleGetMovieById);
router.get('/stream/file/:filename', handleStreamMovie); // Public video stream with Range headers
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
