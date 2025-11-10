import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import config from '../config/config.js';
import {
  initiateTransfer,
  uploadEncryptedFile,
  getReceivedTransfers,
  getSentTransfers,
  getTransferDetails,
  downloadEncryptedFile,
  deleteTransfer,
  getTransferStats,
} from '../controllers/transferController.js';
import { protect } from '../middleware/auth.js';
import { uploadLimiter, downloadLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

// Ensure upload directory exists
if (!fs.existsSync(config.uploadPath)) {
  fs.mkdirSync(config.uploadPath, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, config.uploadPath);
  },
  filename: (req, file, cb) => {
    // Save with a temporary name first
    // The controller will rename it to the proper encrypted filename
    const transferId = req.params.id;
    cb(null, `temp_${transferId}_${Date.now()}.enc`);
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: config.maxFileSize,
  },
  fileFilter: (req, file, cb) => {
    // Accept any file type since they're encrypted
    cb(null, true);
  },
});

// All routes are protected
router.use(protect);

// Transfer routes
router.post('/initiate', uploadLimiter, initiateTransfer);
router.post('/:id/upload', uploadLimiter, upload.single('file'), uploadEncryptedFile);
router.get('/received', getReceivedTransfers);
router.get('/sent', getSentTransfers);
router.get('/stats', getTransferStats);
router.get('/:id', getTransferDetails);
router.get('/:id/download', downloadLimiter, downloadEncryptedFile);
router.delete('/:id', deleteTransfer);

export default router;