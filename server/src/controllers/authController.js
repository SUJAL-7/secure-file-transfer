import crypto from 'crypto';
import User from '../models/User.js';
import { generateToken } from '../middleware/auth.js';

/**
 * @desc    Register new user with public key
 * @route   POST /api/auth/register
 * @access  Public
 */
export const register = async (req, res, next) => {
  try {
    const { username, email, password, publicKey } = req.body;

    // Validate required fields
    if (!username || !email || !password || !publicKey) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields',
      });
    }

    // Validate public key format (basic check)
    if (!publicKey.includes('BEGIN PUBLIC KEY') || !publicKey.includes('END PUBLIC KEY')) {
      return res.status(400).json({
        success: false,
        message: 'Invalid public key format',
      });
    }

    // Generate public key fingerprint
    const publicKeyFingerprint = crypto
      .createHash('sha256')
      .update(publicKey)
      .digest('hex');

    // Create user
    const user = await User.create({
      username,
      email,
      password,
      publicKey,
      publicKeyFingerprint,
    });

    // Generate token
    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user: user.toSafeObject(),
        token,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Login user
 * @route   POST /api/auth/login
 * @access  Public
 */
export const login = async (req, res, next) => {
  try {
    const { username, password } = req.body;

    // Validate required fields
    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide username and password',
      });
    }

    // Get user with password (normally excluded)
    const user = await User.findOne({ username }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Account is deactivated',
      });
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Generate token
    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        user: user.toSafeObject(),
        token,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get current logged in user
 * @route   GET /api/auth/me
 * @access  Private
 */
export const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);

    res.status(200).json({
      success: true,
      data: {
        user: user.toSafeObject(),
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update user public key
 * @route   PUT /api/auth/update-key
 * @access  Private
 */
export const updatePublicKey = async (req, res, next) => {
  try {
    const { publicKey } = req.body;

    if (!publicKey) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a public key',
      });
    }

    // Validate public key format
    if (!publicKey.includes('BEGIN PUBLIC KEY') || !publicKey.includes('END PUBLIC KEY')) {
      return res.status(400).json({
        success: false,
        message: 'Invalid public key format',
      });
    }

    // Generate new fingerprint
    const publicKeyFingerprint = crypto
      .createHash('sha256')
      .update(publicKey)
      .digest('hex');

    // Update user
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { publicKey, publicKeyFingerprint },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: 'Public key updated successfully',
      data: {
        user: user.toSafeObject(),
      },
    });
  } catch (error) {
    next(error);
  }
};