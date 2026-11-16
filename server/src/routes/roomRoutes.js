import express from 'express';
import {
  handleCreateRoom,
  handleJoinRoom,
  handleGetRoom,
  handleLeaveRoom,
  handleSetActiveMovie,
  handleGetMyRooms
} from '../controllers/roomController.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

router.post('/create', authMiddleware, handleCreateRoom);
router.post('/join', authMiddleware, handleJoinRoom);
router.get('/my-rooms', authMiddleware, handleGetMyRooms);
router.get('/:id', authMiddleware, handleGetRoom);
router.post('/:id/leave', authMiddleware, handleLeaveRoom);
router.put('/:id/movie', authMiddleware, handleSetActiveMovie);

export default router;
