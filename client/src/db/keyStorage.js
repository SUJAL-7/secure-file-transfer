import { getDB } from './indexedDB.js';
import { KEYSTORE_NAME } from '../utils/constants.js';
import { arrayBufferToBase64, base64ToArrayBuffer } from '../utils/arrayBufferHelpers.js';

/**
 * Store key pair in IndexedDB
 */
export const storeKeyPair = async (userId, publicKey, encryptedPrivateKey, publicKeyPEM) => {
  try {
    const db = await getDB();
    
    const keyData = {
      id: `key_${userId}`,
      userId,
      publicKey: arrayBufferToBase64(publicKey),
      encryptedPrivateKey: arrayBufferToBase64(encryptedPrivateKey),
      publicKeyPEM,
      createdAt: new Date().toISOString(),
    };
    
    await db.put(KEYSTORE_NAME, keyData);
    console.log('✅ Key pair stored in IndexedDB');
    return true;
  } catch (error) {
    console.error('❌ Failed to store key pair:', error);
    throw error;
  }
};

/**
 * Get key pair from IndexedDB
 */
export const getKeyPair = async (userId) => {
  try {
    const db = await getDB();
    const keyData = await db.get(KEYSTORE_NAME, `key_${userId}`);
    
    if (!keyData) {
      return null;
    }
    
    return {
      userId: keyData.userId,
      publicKey: base64ToArrayBuffer(keyData.publicKey),
      encryptedPrivateKey: base64ToArrayBuffer(keyData.encryptedPrivateKey),
      publicKeyPEM: keyData.publicKeyPEM,
      createdAt: keyData.createdAt,
    };
  } catch (error) {
    console.error('❌ Failed to get key pair:', error);
    throw error;
  }
};

/**
 * Check if key pair exists
 */
export const hasKeyPair = async (userId) => {
  try {
    const db = await getDB();
    const keyData = await db.get(KEYSTORE_NAME, `key_${userId}`);
    return !!keyData;
  } catch (error) {
    console.error('❌ Failed to check key pair:', error);
    return false;
  }
};

/**
 * Delete key pair from IndexedDB
 */
export const deleteKeyPair = async (userId) => {
  try {
    const db = await getDB();
    await db.delete(KEYSTORE_NAME, `key_${userId}`);
    console.log('✅ Key pair deleted from IndexedDB');
    return true;
  } catch (error) {
    console.error('❌ Failed to delete key pair:', error);
    throw error;
  }
};

/**
 * Get all key pairs
 */
export const getAllKeyPairs = async () => {
  try {
    const db = await getDB();
    const keys = await db.getAll(KEYSTORE_NAME);
    return keys;
  } catch (error) {
    console.error('❌ Failed to get all key pairs:', error);
    throw error;
  }
};