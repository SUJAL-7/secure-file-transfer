import axios from './axios.js';

/**
 * Register new user
 */
export const registerUser = async (userData) => {
  return await axios.post('/auth/register', userData);
};

/**
 * Login user
 */
export const loginUser = async (credentials) => {
  return await axios.post('/auth/login', credentials);
};

/**
 * Get current user
 */
export const getCurrentUser = async () => {
  return await axios.get('/auth/me');
};

/**
 * Update public key
 */
export const updatePublicKey = async (publicKey) => {
  return await axios.put('/auth/update-key', { publicKey });
};

/**
 * Logout (client-side only)
 */
export const logoutUser = () => {
  localStorage.removeItem('sft_token');
  localStorage.removeItem('sft_user');
};