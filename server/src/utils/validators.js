import { body, param, query, validationResult } from 'express-validator';

/**
 * Validation middleware to check for errors
 */
export const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation error',
      errors: errors.array(),
    });
  }
  next();
};

/**
 * Auth validation rules
 */
export const registerValidation = [
  body('username')
    .trim()
    .isLength({ min: 3, max: 30 })
    .withMessage('Username must be 3-30 characters')
    .matches(/^[a-z0-9_-]+$/)
    .withMessage('Username can only contain lowercase letters, numbers, hyphens and underscores'),
  body('email')
    .trim()
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
  body('publicKey')
    .notEmpty()
    .withMessage('Public key is required')
    .contains('BEGIN PUBLIC KEY')
    .withMessage('Invalid public key format'),
];

export const loginValidation = [
  body('username').trim().notEmpty().withMessage('Username is required'),
  body('password').notEmpty().withMessage('Password is required'),
];

/**
 * Transfer validation rules
 */
export const initiateTransferValidation = [
  body('recipientId')
    .notEmpty()
    .withMessage('Recipient ID is required')
    .isMongoId()
    .withMessage('Invalid recipient ID'),
  body('originalFilename')
    .trim()
    .notEmpty()
    .withMessage('Filename is required'),
  body('fileSize')
    .isInt({ min: 1 })
    .withMessage('File size must be greater than 0'),
  body('encryptedAESKey')
    .notEmpty()
    .withMessage('Encrypted AES key is required'),
  body('iv')
    .notEmpty()
    .withMessage('IV is required'),
];

/**
 * User validation rules
 */
export const searchUsersValidation = [
  query('q')
    .trim()
    .isLength({ min: 2 })
    .withMessage('Search query must be at least 2 characters'),
];

/**
 * MongoDB ObjectId validation
 */
export const idParamValidation = [
  param('id').isMongoId().withMessage('Invalid ID format'),
];