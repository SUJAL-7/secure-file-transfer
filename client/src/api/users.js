import axios from './axios.js';

/**
 * Search users
 */
export const searchUsers = async (query) => {
  return await axios.get('/users/search', {
    params: { q: query },
  });
};

/**
 * Get user by username
 */
export const getUserByUsername = async (username) => {
  return await axios.get(`/users/username/${username}`);
};

/**
 * Get user's public key
 */
export const getUserPublicKey = async (userId) => {
  return await axios.get(`/users/${userId}/public-key`);
};

/**
 * Get current user's profile
 */
export const getUserProfile = async () => {
  return await axios.get('/users/profile');
};

/**
 * Update user profile
 */
export const updateUserProfile = async (profileData) => {
  return await axios.put('/users/profile', profileData);
};

/**
 * Update user's public key
 */
export const updateUserPublicKey = async (data) => {
  return await axios.put('/users/public-key', data);
};