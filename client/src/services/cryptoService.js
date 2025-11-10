import {
  generateRSAKeyPair,
  exportPublicKeyToPEM,
  exportPrivateKeyToPEM,
  encryptPrivateKey,
  decryptPrivateKey,
  calculatePublicKeyFingerprint,
} from '../crypto/keyManagement.js';
import { storeKeyPair, getKeyPair, hasKeyPair, deleteKeyPair } from '../db/keyStorage.js';
import { downloadText } from '../utils/fileHelpers.js';

/**
 * Generate and store new key pair
 */
export const generateAndStoreKeyPair = async (userId, password) => {
  try {
    // Generate RSA key pair
    const keyPair = await generateRSAKeyPair();
    
    // Export keys to PEM
    const publicKeyPEM = await exportPublicKeyToPEM(keyPair.publicKey);
    const privateKeyPEM = await exportPrivateKeyToPEM(keyPair.privateKey);
    
    // Encrypt private key with password
    const encryptedPrivateKey = await encryptPrivateKey(privateKeyPEM, password);
    
    // Export public key as raw for storage
    const publicKeyRaw = await crypto.subtle.exportKey('spki', keyPair.publicKey);
    
    // Store in IndexedDB
    await storeKeyPair(userId, publicKeyRaw, encryptedPrivateKey, publicKeyPEM);
    
    // Calculate fingerprint
    const fingerprint = await calculatePublicKeyFingerprint(publicKeyPEM);
    
    return {
      publicKeyPEM,
      privateKeyPEM,
      fingerprint,
    };
  } catch (error) {
    console.error('❌ Failed to generate and store key pair:', error);
    throw error;
  }
};

/**
 * Get decrypted private key
 */
export const getDecryptedPrivateKey = async (userId, password) => {
  try {
    const keyPair = await getKeyPair(userId);
    
    if (!keyPair) {
      throw new Error('Key pair not found');
    }
    
    const privateKeyPEM = await decryptPrivateKey(keyPair.encryptedPrivateKey, password);
    
    return {
      privateKeyPEM,
      publicKeyPEM: keyPair.publicKeyPEM,
    };
  } catch (error) {
    console.error('❌ Failed to decrypt private key:', error);
    throw new Error('Invalid password or corrupted key');
  }
};

/**
 * Check if user has key pair
 */
export const checkKeyPairExists = async (userId) => {
  return await hasKeyPair(userId);
};

/**
 * Export private key to file
 */
export const exportPrivateKeyToFile = async (userId, password) => {
  try {
    const { privateKeyPEM } = await getDecryptedPrivateKey(userId, password);
    
    // Add metadata
    const keyFile = `${privateKeyPEM}\n\n# User ID: ${userId}\n# Generated: ${new Date().toISOString()}\n# Keep this file safe and secure!`;
    
    // Download as file
    const filename = `private_key_${userId}_${Date.now()}.pem`;
    downloadText(keyFile, filename, 'text/plain');
    
    return true;
  } catch (error) {
    console.error('❌ Failed to export private key:', error);
    throw error;
  }
};

/**
 * Import private key from PEM string
 */
export const importPrivateKeyFromString = async (userId, privateKeyPEM, password) => {
  try {
    // Validate format
    if (!privateKeyPEM.includes('BEGIN PRIVATE KEY')) {
      throw new Error('Invalid private key format');
    }
    
    // Encrypt with password
    const encryptedPrivateKey = await encryptPrivateKey(privateKeyPEM, password);
    
    // Note: We don't have the public key here
    // User should have it from their account or regenerate key pair
    
    return {
      encryptedPrivateKey,
    };
  } catch (error) {
    console.error('❌ Failed to import private key:', error);
    throw error;
  }
};

/**
 * Delete user's key pair
 */
export const removeKeyPair = async (userId) => {
  try {
    await deleteKeyPair(userId);
    return true;
  } catch (error) {
    console.error('❌ Failed to delete key pair:', error);
    throw error;
  }
};

/**
 * Verify password can decrypt private key
 */
export const verifyPassword = async (userId, password) => {
  try {
    await getDecryptedPrivateKey(userId, password);
    return true;
  } catch (error) {
    console.log(error)
    return false;
  }
};