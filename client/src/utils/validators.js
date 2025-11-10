import { PATTERNS } from './constants.js';

/**
 * Validate username
 */
export const validateUsername = (username) => {
  if (!username || username.trim().length < 3) {
    return 'Username must be at least 3 characters';
  }
  
  if (username.length > 30) {
    return 'Username cannot exceed 30 characters';
  }
  
  if (!PATTERNS.USERNAME.test(username)) {
    return 'Username can only contain lowercase letters, numbers, hyphens and underscores';
  }
  
  return null;
};

/**
 * Validate email
 */
export const validateEmail = (email) => {
  if (!email || !email.trim()) {
    return 'Email is required';
  }
  
  if (!PATTERNS.EMAIL.test(email)) {
    return 'Please provide a valid email address';
  }
  
  return null;
};

/**
 * Validate password
 */
export const validatePassword = (password) => {
  if (!password || password.length < 8) {
    return 'Password must be at least 8 characters';
  }
  
  if (!/[a-z]/.test(password)) {
    return 'Password must contain at least one lowercase letter';
  }
  
  if (!/[A-Z]/.test(password)) {
    return 'Password must contain at least one uppercase letter';
  }
  
  if (!/\d/.test(password)) {
    return 'Password must contain at least one number';
  }
  
  return null;
};

/**
 * Validate confirm password
 */
export const validateConfirmPassword = (password, confirmPassword) => {
  if (password !== confirmPassword) {
    return 'Passwords do not match';
  }
  
  return null;
};

/**
 * Validate file
 */
export const validateFile = (file, maxSize) => {
  if (!file) {
    return 'Please select a file';
  }
  
  if (file.size === 0) {
    return 'File is empty';
  }
  
  if (file.size > maxSize) {
    return `File size exceeds maximum limit of ${Math.round(maxSize / 1024 / 1024)}MB`;
  }
  
  return null;
};

/**
 * Validate public key format
 */
export const validatePublicKey = (publicKey) => {
  if (!publicKey) {
    return 'Public key is required';
  }
  
  if (!publicKey.includes('BEGIN PUBLIC KEY') || !publicKey.includes('END PUBLIC KEY')) {
    return 'Invalid public key format';
  }
  
  return null;
};

/**
 * Validate private key format
 */
export const validatePrivateKey = (privateKey) => {
  if (!privateKey) {
    return 'Private key is required';
  }
  
  if (!privateKey.includes('BEGIN PRIVATE KEY') || !privateKey.includes('END PRIVATE KEY')) {
    return 'Invalid private key format';
  }
  
  return null;
};