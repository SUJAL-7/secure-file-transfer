import express from 'express';
import {
  searchUsers,
  getUserPublicKey,
  getUserByUsername,
  updateUserPublicKey,
  getCurrentUserProfile,
  updateUserProfile,
} from '../controllers/userController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// All routes are protected
router.use(protect);

// User routes
router.get('/search', searchUsers);
router.get('/me', getCurrentUserProfile);
router.put('/me', updateUserProfile);
router.put('/public-key', updateUserPublicKey);
router.get('/username/:username', getUserByUsername);
router.get('/:id/public-key', getUserPublicKey);

export default router;