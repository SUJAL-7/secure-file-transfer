import crypto from 'crypto';
import User from '../models/User.js';

/**
 * @desc    Search users by username
 * @route   GET /api/users/search?q=username
 * @access  Private
 */
export const searchUsers = async (req, res, next) => {
  try {
    const { q } = req.query;

    if (!q || q.trim().length < 2) {
      return res.status(400).json({
        success: false,
        message: 'Search query must be at least 2 characters',
      });
    }

    // Search users by username (case-insensitive, partial match)
    const users = await User.find({
      username: { $regex: q.trim(), $options: 'i' },
      _id: { $ne: req.user._id }, // Exclude current user
    })
      .select('username email avatar createdAt')
      .limit(20);

    res.status(200).json({
      success: true,
      count: users.length,
      data: { users },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get user's public key
 * @route   GET /api/users/:id/public-key
 * @access  Private
 */
export const getUserPublicKey = async (req, res, next) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id).select('username publicKey publicKeyFingerprint');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    res.status(200).json({
      success: true,
      data: {
        userId: user._id,
        username: user.username,
        publicKey: user.publicKey,
        publicKeyFingerprint: user.publicKeyFingerprint,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get user by username
 * @route   GET /api/users/username/:username
 * @access  Private
 */
export const getUserByUsername = async (req, res, next) => {
  try {
    const { username } = req.params;

    const user = await User.findOne({ username: username.toLowerCase() })
      .select('username email avatar publicKeyFingerprint createdAt');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    res.status(200).json({
      success: true,
      data: { user },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update user's public key
 * @route   PUT /api/users/public-key
 * @access  Private
 */
export const updateUserPublicKey = async (req, res, next) => {
  try {
    const { publicKey } = req.body;

    console.log('📝 Update public key request received');
    console.log('User ID:', req.user._id);

    if (!publicKey) {
      return res.status(400).json({
        success: false,
        message: 'Public key is required',
      });
    }

    // Validate public key format
    if (!publicKey.includes('-----BEGIN PUBLIC KEY-----') || 
        !publicKey.includes('-----END PUBLIC KEY-----')) {
      return res.status(400).json({
        success: false,
        message: 'Invalid public key format',
      });
    }

    console.log('✅ Public key format validated');

    // Calculate fingerprint
    const publicKeyFingerprint = crypto
      .createHash('sha256')
      .update(publicKey)
      .digest('hex')
      .substring(0, 40);

    console.log('🔐 Public key fingerprint:', publicKeyFingerprint);

    // Update user
    const user = await User.findByIdAndUpdate(
      req.user._id,
      {
        publicKey,
        publicKeyFingerprint,
      },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    console.log('✅ Public key updated successfully for user:', user.username);

    res.status(200).json({
      success: true,
      message: 'Public key updated successfully',
      data: { user },
    });
  } catch (error) {
    console.error('❌ Update public key error:', error);
    next(error);
  }
};

/**
 * @desc    Get current user profile
 * @route   GET /api/users/me
 * @access  Private
 */
export const getCurrentUserProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id)
      .select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    res.status(200).json({
      success: true,
      data: { user },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update user profile
 * @route   PUT /api/users/me
 * @access  Private
 */
export const updateUserProfile = async (req, res, next) => {
  try {
    const { email, avatar } = req.body;

    const updateData = {};
    if (email) updateData.email = email;
    if (avatar !== undefined) updateData.avatar = avatar;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: { user },
    });
  } catch (error) {
    next(error);
  }
};