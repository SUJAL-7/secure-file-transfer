import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';
import Transfer from '../models/Transfer.js';
import FileMetadata from '../models/FileMetadata.js';
import User from '../models/User.js';
import config from '../config/config.js';

/**
 * @desc    Upload encrypted file
 * @route   POST /api/transfers/:id/upload
 * @access  Private
 */
/**
 * @desc    Upload encrypted file
 * @route   POST /api/transfers/:id/upload
 * @access  Private
 */
export const uploadEncryptedFile = async (req, res, next) => {
  let tempFilePath = null;
  
  try {
    const { id } = req.params;

    console.log('📤 Upload request received for transfer:', id);

    // Find transfer
    const transfer = await Transfer.findById(id);

    if (!transfer) {
      // Clean up uploaded file if transfer not found
      if (req.file) {
        await fs.unlink(req.file.path).catch(err => console.error('Error cleaning up:', err));
      }
      return res.status(404).json({
        success: false,
        message: 'Transfer not found',
      });
    }

    // Verify sender
    if (transfer.sender.toString() !== req.user._id.toString()) {
      // Clean up uploaded file
      if (req.file) {
        await fs.unlink(req.file.path).catch(err => console.error('Error cleaning up:', err));
      }
      return res.status(403).json({
        success: false,
        message: 'Not authorized to upload to this transfer',
      });
    }

    // Check if already uploaded
    if (transfer.status !== 'pending') {
      // Clean up uploaded file
      if (req.file) {
        await fs.unlink(req.file.path).catch(err => console.error('Error cleaning up:', err));
      }
      return res.status(400).json({
        success: false,
        message: 'File already uploaded',
      });
    }

    // Check if file was uploaded
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded',
      });
    }

    tempFilePath = req.file.path;

    console.log('📁 File received:', {
      originalName: req.file.originalname,
      size: req.file.size,
      tempPath: tempFilePath,
      targetPath: transfer.filePath,
    });

    // Verify file size matches (allow 10% variance for encryption overhead)
    const sizeDifference = Math.abs(req.file.size - transfer.fileSize);
    const allowedVariance = transfer.fileSize * 0.1;
    
    if (sizeDifference > allowedVariance) {
      console.warn('⚠️ File size mismatch:', {
        expected: transfer.fileSize,
        actual: req.file.size,
        difference: sizeDifference,
      });
    }

    // Ensure upload directory exists
    const uploadDir = path.dirname(transfer.filePath);
    await fs.mkdir(uploadDir, { recursive: true });

    // Rename/move file from temp location to final location
    try {
      await fs.rename(tempFilePath, transfer.filePath);
      console.log('✅ File moved to:', transfer.filePath);
      tempFilePath = null; // Clear temp path since file was moved
    } catch (renameError) {
      console.error('❌ Error renaming file:', renameError);
      // Try copying if rename fails (different filesystems)
      try {
        await fs.copyFile(tempFilePath, transfer.filePath);
        await fs.unlink(tempFilePath);
        console.log('✅ File copied to:', transfer.filePath);
        tempFilePath = null;
      } catch (copyError) {
        console.error('❌ Error copying file:', copyError);
        throw new Error('Failed to save uploaded file');
      }
    }

    // Verify the file exists at the target location
    try {
      const stats = await fs.stat(transfer.filePath);
      console.log('✅ File verified at target location:', {
        path: transfer.filePath,
        size: stats.size,
      });
    } catch (statError) {
      console.error('❌ File not found at target location:', transfer.filePath);
      throw new Error('File upload verification failed');
    }

    // Calculate checksum of encrypted file
    const fileBuffer = await fs.readFile(transfer.filePath);
    const checksum = crypto.createHash('sha256').update(fileBuffer).digest('hex');

    console.log('🔐 File checksum:', checksum);

    // Update file metadata
    await FileMetadata.findOneAndUpdate(
      { transfer: transfer._id },
      { checksum, checksumAlgorithm: 'sha256' }
    );

    // Update transfer status
    transfer.status = 'uploaded';
    await transfer.save();

    console.log('✅ Transfer updated to uploaded status');

    // Emit socket event to recipient (if connected)
    const io = req.app.get('io');
    if (io) {
      io.to(transfer.recipient.toString()).emit('newTransfer', {
        transferId: transfer._id,
        sender: req.user.username,
        filename: transfer.originalFilename,
        fileSize: transfer.fileSize,
      });
      console.log('📡 Socket notification sent to recipient');
    }

    res.status(200).json({
      success: true,
      message: 'File uploaded successfully',
      data: {
        transfer: {
          id: transfer._id,
          status: transfer.status,
          checksum,
        },
      },
    });
  } catch (error) {
    console.error('❌ Upload error:', error);
    
    // Clean up temp file if it still exists
    if (tempFilePath) {
      try {
        await fs.unlink(tempFilePath);
        console.log('🧹 Cleaned up temp file:', tempFilePath);
      } catch (cleanupError) {
        console.error('Error cleaning up temp file:', cleanupError);
      }
    }
    
    next(error);
  }
};

/**
 * @desc    Download encrypted file
 * @route   GET /api/transfers/:id/download
 * @access  Private
 */
export const downloadEncryptedFile = async (req, res, next) => {
  try {
    const { id } = req.params;

    console.log('📥 Download request for transfer:', id);
    console.log('👤 Requested by user:', req.user._id);

    const transfer = await Transfer.findById(id);

    if (!transfer) {
      console.log('❌ Transfer not found');
      return res.status(404).json({
        success: false,
        message: 'Transfer not found',
      });
    }

    console.log('📋 Transfer details:', {
      id: transfer._id,
      sender: transfer.sender,
      recipient: transfer.recipient,
      status: transfer.status,
      filePath: transfer.filePath,
    });

    // Verify user is the recipient
    if (transfer.recipient.toString() !== req.user._id.toString()) {
      console.log('❌ User not authorized:', {
        userId: req.user._id,
        recipientId: transfer.recipient,
      });
      return res.status(403).json({
        success: false,
        message: 'Not authorized to download this file',
      });
    }

    // Check if file exists
    try {
      await fs.access(transfer.filePath);
      console.log('✅ File exists at:', transfer.filePath);
    } catch (error) {
      console.error('❌ File not found at path:', transfer.filePath);
      console.error('Error:', error);
      return res.status(404).json({
        success: false,
        message: 'File not found on server',
      });
    }

    // Check if expired
    if (transfer.isExpired()) {
      console.log('⏰ Transfer expired');
      return res.status(410).json({
        success: false,
        message: 'Transfer has expired',
      });
    }

    // Update download count and timestamp
    transfer.downloadCount += 1;
    if (!transfer.downloadedAt) {
      transfer.downloadedAt = new Date();
    }
    transfer.status = 'downloaded';
    await transfer.save();

    console.log('📊 Download count updated:', transfer.downloadCount);

    // Send encrypted file
    console.log('📤 Sending file...');
    res.download(transfer.filePath, transfer.encryptedFilename, (err) => {
      if (err) {
        console.error('❌ Download error:', err);
        if (!res.headersSent) {
          res.status(500).json({
            success: false,
            message: 'Error downloading file',
          });
        }
      } else {
        console.log('✅ File sent successfully');
      }
    });
  } catch (error) {
    console.error('❌ Download error:', error);
    next(error);
  }
};

// Export all other functions...
export const initiateTransfer = async (req, res, next) => {
  try {
    const {
      recipientId,
      originalFilename,
      fileSize,
      mimeType,
      encryptedAESKey,
      iv,
      signature,
      encryptedMessage,
      expiresIn,
    } = req.body;

    if (!recipientId || !originalFilename || !fileSize || !encryptedAESKey || !iv) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields',
      });
    }

    if (fileSize > config.maxFileSize) {
      return res.status(400).json({
        success: false,
        message: `File size exceeds maximum limit of ${config.maxFileSize / 1024 / 1024}MB`,
      });
    }

    const recipient = await User.findById(recipientId);
    if (!recipient) {
      return res.status(404).json({
        success: false,
        message: 'Recipient not found',
      });
    }

    if (recipientId === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'Cannot send file to yourself',
      });
    }

    const encryptedFilename = `${crypto.randomBytes(32).toString('hex')}.enc`;
    const filePath = path.join(config.uploadPath, encryptedFilename);

    const expiresAt = expiresIn
      ? new Date(Date.now() + expiresIn * 24 * 60 * 60 * 1000)
      : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    const transfer = await Transfer.create({
      sender: req.user._id,
      recipient: recipientId,
      originalFilename,
      encryptedFilename,
      fileSize,
      mimeType: mimeType || 'application/octet-stream',
      encryptedAESKey,
      iv,
      signature,
      filePath,
      encryptedMessage,
      expiresAt,
      status: 'pending',
    });

    await FileMetadata.create({
      transfer: transfer._id,
      encryptionAlgorithm: 'AES-256-GCM',
      keyEncryptionAlgorithm: 'RSA-OAEP',
      userAgent: req.headers['user-agent'],
      ipAddress: req.ip,
    });

    console.log('✅ Transfer initiated:', {
      id: transfer._id,
      filePath,
    });

    res.status(201).json({
      success: true,
      message: 'Transfer initiated successfully',
      data: {
        transferId: transfer._id,
        encryptedFilename,
        uploadUrl: `/api/transfers/${transfer._id}/upload`,
      },
    });
  } catch (error) {
    console.error('❌ Initiate transfer error:', error);
    next(error);
  }
};

export const getReceivedTransfers = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;

    const query = { recipient: req.user._id };
    if (status) {
      query.status = status;
    }

    const transfers = await Transfer.find(query)
      .populate('sender', 'username email avatar')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const count = await Transfer.countDocuments(query);

    res.status(200).json({
      success: true,
      count: transfers.length,
      totalPages: Math.ceil(count / limit),
      currentPage: parseInt(page),
      data: { transfers },
    });
  } catch (error) {
    next(error);
  }
};

export const getSentTransfers = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;

    const query = { sender: req.user._id };
    if (status) {
      query.status = status;
    }

    const transfers = await Transfer.find(query)
      .populate('recipient', 'username email avatar')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const count = await Transfer.countDocuments(query);

    res.status(200).json({
      success: true,
      count: transfers.length,
      totalPages: Math.ceil(count / limit),
      currentPage: parseInt(page),
      data: { transfers },
    });
  } catch (error) {
    next(error);
  }
};

export const getTransferDetails = async (req, res, next) => {
  try {
    const { id } = req.params;

    const transfer = await Transfer.findById(id)
      .populate('sender', 'username email avatar')
      .populate('recipient', 'username email avatar');

    if (!transfer) {
      return res.status(404).json({
        success: false,
        message: 'Transfer not found',
      });
    }

    if (
      transfer.sender._id.toString() !== req.user._id.toString() &&
      transfer.recipient._id.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this transfer',
      });
    }

    const metadata = await FileMetadata.findOne({ transfer: transfer._id });

    res.status(200).json({
      success: true,
      data: {
        transfer,
        metadata,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const deleteTransfer = async (req, res, next) => {
  try {
    const { id } = req.params;

    const transfer = await Transfer.findById(id);

    if (!transfer) {
      return res.status(404).json({
        success: false,
        message: 'Transfer not found',
      });
    }

    if (
      transfer.sender.toString() !== req.user._id.toString() &&
      transfer.recipient.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this transfer',
      });
    }

    try {
      await fs.unlink(transfer.filePath);
    } catch (error) {
      console.error('Error deleting file:', error);
    }

    await FileMetadata.findOneAndDelete({ transfer: transfer._id });

    transfer.status = 'deleted';
    await transfer.save();

    res.status(200).json({
      success: true,
      message: 'Transfer deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

export const getTransferStats = async (req, res, next) => {
  try {
    const userId = req.user._id;

    const [sentCount, receivedCount, sentTotal, receivedTotal] = await Promise.all([
      Transfer.countDocuments({ sender: userId }),
      Transfer.countDocuments({ recipient: userId }),
      Transfer.aggregate([
        { $match: { sender: userId } },
        { $group: { _id: null, total: { $sum: '$fileSize' } } },
      ]),
      Transfer.aggregate([
        { $match: { recipient: userId } },
        { $group: { _id: null, total: { $sum: '$fileSize' } } },
      ]),
    ]);

    res.status(200).json({
      success: true,
      data: {
        sent: {
          count: sentCount,
          totalSize: sentTotal[0]?.total || 0,
        },
        received: {
          count: receivedCount,
          totalSize: receivedTotal[0]?.total || 0,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};