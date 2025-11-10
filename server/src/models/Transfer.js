import mongoose from 'mongoose';

const transferSchema = new mongoose.Schema(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    // Encrypted file metadata (filename is also encrypted on client)
    originalFilename: {
      type: String,
      required: true,
    },
    encryptedFilename: {
      type: String,
      required: true,
      unique: true,
    },
    fileSize: {
      type: Number,
      required: true,
    },
    mimeType: {
      type: String,
      default: 'application/octet-stream',
    },
    // Encrypted AES key (encrypted with recipient's public RSA key)
    encryptedAESKey: {
      type: String,
      required: true,
    },
    // IV for AES encryption (not secret, but needed for decryption)
    iv: {
      type: String,
      required: true,
    },
    // Optional: Digital signature to verify sender
    signature: {
      type: String,
      default: null,
    },
    // File storage path on server
    filePath: {
      type: String,
      required: true,
    },
    // Transfer status
    status: {
      type: String,
      enum: ['pending', 'uploaded', 'downloaded', 'expired', 'deleted'],
      default: 'pending',
      index: true,
    },
    // Download tracking
    downloadedAt: {
      type: Date,
      default: null,
    },
    downloadCount: {
      type: Number,
      default: 0,
    },
    // Expiration (optional feature)
    expiresAt: {
      type: Date,
      default: () => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days default
      index: true,
    },
    // Optional message from sender (also should be encrypted on client)
    encryptedMessage: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Compound indexes for efficient queries
transferSchema.index({ sender: 1, createdAt: -1 });
transferSchema.index({ recipient: 1, createdAt: -1 });
transferSchema.index({ status: 1, expiresAt: 1 });

// Method to check if transfer is expired
transferSchema.methods.isExpired = function () {
  return this.expiresAt && new Date() > this.expiresAt;
};

// Static method to cleanup expired transfers
transferSchema.statics.cleanupExpired = async function () {
  const expiredTransfers = await this.find({
    expiresAt: { $lt: new Date() },
    status: { $nin: ['expired', 'deleted'] },
  });

  for (const transfer of expiredTransfers) {
    transfer.status = 'expired';
    await transfer.save();
    // TODO: Delete actual file from disk
  }

  return expiredTransfers.length;
};

const Transfer = mongoose.model('Transfer', transferSchema);

export default Transfer;