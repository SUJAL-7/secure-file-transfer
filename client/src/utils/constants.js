// API Configuration
export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
export const WS_URL = import.meta.env.VITE_WS_URL || 'http://localhost:5000';
export const MAX_FILE_SIZE = parseInt(import.meta.env.VITE_MAX_FILE_SIZE) || 104857600; // 100MB
export const APP_NAME = import.meta.env.VITE_APP_NAME || 'Secure File Transfer';

// Crypto Configuration
export const RSA_KEY_SIZE = 4096;
export const RSA_HASH = 'SHA-256';
export const AES_KEY_LENGTH = 256;
export const AES_ALGORITHM = 'AES-GCM';
export const AES_IV_LENGTH = 12; // 96 bits for GCM

// Key Storage
export const DB_NAME = 'SecureFileTransferDB';
export const DB_VERSION = 1;
export const KEYSTORE_NAME = 'keystore';
export const SETTINGS_STORE = 'settings';

// Local Storage Keys
export const LS_TOKEN = 'sft_token';
export const LS_USER = 'sft_user';
export const LS_THEME = 'sft_theme';

// File Transfer
export const CHUNK_SIZE = 1024 * 1024; // 1MB chunks
export const MAX_CONCURRENT_UPLOADS = 3;

// Transfer Status
export const TRANSFER_STATUS = {
  PENDING: 'pending',
  UPLOADING: 'uploading',
  UPLOADED: 'uploaded',
  DOWNLOADED: 'downloaded',
  EXPIRED: 'expired',
  DELETED: 'deleted',
  FAILED: 'failed',
};

// Expiration Options (in days)
export const EXPIRATION_OPTIONS = [
  { label: '1 hour', value: 1 / 24 },
  { label: '6 hours', value: 6 / 24 },
  { label: '1 day', value: 1 },
  { label: '3 days', value: 3 },
  { label: '7 days', value: 7 },
  { label: '14 days', value: 14 },
  { label: '30 days', value: 30 },
];

// File Size Formatting
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
};

// Date Formatting
export const formatDate = (date) => {
  const d = new Date(date);
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

// Time Ago Formatting
export const timeAgo = (date) => {
  const seconds = Math.floor((new Date() - new Date(date)) / 1000);
  
  let interval = seconds / 31536000;
  if (interval > 1) return Math.floor(interval) + ' years ago';
  
  interval = seconds / 2592000;
  if (interval > 1) return Math.floor(interval) + ' months ago';
  
  interval = seconds / 86400;
  if (interval > 1) return Math.floor(interval) + ' days ago';
  
  interval = seconds / 3600;
  if (interval > 1) return Math.floor(interval) + ' hours ago';
  
  interval = seconds / 60;
  if (interval > 1) return Math.floor(interval) + ' minutes ago';
  
  return Math.floor(seconds) + ' seconds ago';
};

// Error Messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network error. Please check your connection.',
  UNAUTHORIZED: 'Please login to continue.',
  FILE_TOO_LARGE: `File size exceeds maximum limit of ${formatFileSize(MAX_FILE_SIZE)}.`,
  INVALID_FILE: 'Invalid file type.',
  ENCRYPTION_FAILED: 'Encryption failed. Please try again.',
  DECRYPTION_FAILED: 'Decryption failed. Invalid key or corrupted file.',
  KEY_NOT_FOUND: 'Private key not found. Please import your key.',
  UPLOAD_FAILED: 'Upload failed. Please try again.',
  DOWNLOAD_FAILED: 'Download failed. Please try again.',
};

// Success Messages
export const SUCCESS_MESSAGES = {
  FILE_UPLOADED: 'File uploaded successfully!',
  FILE_DOWNLOADED: 'File downloaded successfully!',
  FILE_DELETED: 'File deleted successfully!',
  KEY_GENERATED: 'Key pair generated successfully!',
  KEY_IMPORTED: 'Private key imported successfully!',
  KEY_EXPORTED: 'Private key exported successfully!',
  LOGIN_SUCCESS: 'Login successful!',
  REGISTER_SUCCESS: 'Registration successful!',
};

// Regex Patterns
export const PATTERNS = {
  USERNAME: /^[a-z0-9_-]+$/,
  EMAIL: /^\S+@\S+\.\S+$/,
};