import mongoose from 'mongoose';

// Optional model for additional file metadata and analytics
const fileMetadataSchema = new mongoose.Schema(
  {
    transfer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Transfer',
      required: true,
      unique: true,
    },
    // Checksum for integrity verification (of encrypted file)
    checksum: {
      type: String,
      default: null,
    },
    checksumAlgorithm: {
      type: String,
      enum: ['sha256', 'sha512'],
      default: 'sha256',
    },
    // Chunk information for large files
    isChunked: {
      type: Boolean,
      default: false,
    },
    totalChunks: {
      type: Number,
      default: 1,
    },
    uploadedChunks: {
      type: Number,
      default: 0,
    },
    // Encryption metadata (for verification)
    encryptionAlgorithm: {
      type: String,
      default: 'AES-256-GCM',
    },
    keyEncryptionAlgorithm: {
      type: String,
      default: 'RSA-OAEP',
    },
    // Additional metadata
    userAgent: {
      type: String,
      default: null,
    },
    ipAddress: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

const FileMetadata = mongoose.model('FileMetadata', fileMetadataSchema);

export default FileMetadata;