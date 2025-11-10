import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import config from '../config/config.js';

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: [true, 'Username is required'],
      unique: true,
      trim: true,
      lowercase: true,
      minlength: [3, 'Username must be at least 3 characters'],
      maxlength: [30, 'Username cannot exceed 30 characters'],
      match: [/^[a-z0-9_-]+$/, 'Username can only contain lowercase letters, numbers, hyphens and underscores'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [8, 'Password must be at least 8 characters'],
      select: false, // Don't return password by default
    },
    publicKey: {
      type: String,
      required: [true, 'Public key is required'],
      // Store the PEM format public key
    },
    publicKeyFingerprint: {
      type: String,
      required: true,
      // SHA-256 hash of public key for verification
    },
    avatar: {
      type: String,
      default: null,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    lastLogin: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Index for faster queries
userSchema.index({ username: 1 });
userSchema.index({ email: 1 });

// Hash password before saving
userSchema.pre('save', async function (next) {
  // Only hash if password is modified
  if (!this.isModified('password')) {
    return next();
  }

  try {
    const salt = await bcrypt.genSalt(config.bcryptRounds);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare password
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Method to get safe user object (without sensitive data)
userSchema.methods.toSafeObject = function () {
  const user = this.toObject();
  delete user.password;
  delete user.__v;
  return user;
};

// Virtual for sent transfers
userSchema.virtual('sentTransfers', {
  ref: 'Transfer',
  localField: '_id',
  foreignField: 'sender',
});

// Virtual for received transfers
userSchema.virtual('receivedTransfers', {
  ref: 'Transfer',
  localField: '_id',
  foreignField: 'recipient',
});

const User = mongoose.model('User', userSchema);

export default User;