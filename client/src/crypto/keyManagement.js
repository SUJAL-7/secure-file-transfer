import {
  RSA_KEY_SIZE,
  RSA_HASH,
  AES_KEY_LENGTH,
  AES_ALGORITHM,
} from '../utils/constants.js';
import {
  arrayBufferToBase64,
  base64ToArrayBuffer,
  stringToArrayBuffer,
  arrayBufferToString,
} from '../utils/arrayBufferHelpers.js';

/**
 * Generate RSA key pair
 */
export const generateRSAKeyPair = async () => {
  try {
    const keyPair = await crypto.subtle.generateKey(
      {
        name: 'RSA-OAEP',
        modulusLength: RSA_KEY_SIZE,
        publicExponent: new Uint8Array([1, 0, 1]),
        hash: RSA_HASH,
      },
      true, // extractable
      ['encrypt', 'decrypt']
    );
    
    console.log('✅ RSA key pair generated');
    return keyPair;
  } catch (error) {
    console.error('❌ Failed to generate RSA key pair:', error);
    throw new Error('Failed to generate key pair');
  }
};

/**
 * Export public key to PEM format
 */
export const exportPublicKeyToPEM = async (publicKey) => {
  try {
    const exported = await crypto.subtle.exportKey('spki', publicKey);
    const exportedAsBase64 = arrayBufferToBase64(exported);
    const pem = `-----BEGIN PUBLIC KEY-----\n${exportedAsBase64.match(/.{1,64}/g).join('\n')}\n-----END PUBLIC KEY-----`;
    return pem;
  } catch (error) {
    console.error('❌ Failed to export public key:', error);
    throw error;
  }
};

/**
 * Export private key to PEM format
 */
export const exportPrivateKeyToPEM = async (privateKey) => {
  try {
    const exported = await crypto.subtle.exportKey('pkcs8', privateKey);
    const exportedAsBase64 = arrayBufferToBase64(exported);
    const pem = `-----BEGIN PRIVATE KEY-----\n${exportedAsBase64.match(/.{1,64}/g).join('\n')}\n-----END PRIVATE KEY-----`;
    return pem;
  } catch (error) {
    console.error('❌ Failed to export private key:', error);
    throw error;
  }
};

/**
 * Import public key from PEM format
 */
export const importPublicKeyFromPEM = async (pem) => {
  try {
    const pemContents = pem
      .replace('-----BEGIN PUBLIC KEY-----', '')
      .replace('-----END PUBLIC KEY-----', '')
      .replace(/\s/g, '');
    
    const binaryDer = base64ToArrayBuffer(pemContents);
    
    const publicKey = await crypto.subtle.importKey(
      'spki',
      binaryDer,
      {
        name: 'RSA-OAEP',
        hash: RSA_HASH,
      },
      true,
      ['encrypt']
    );
    
    return publicKey;
  } catch (error) {
    console.error('❌ Failed to import public key:', error);
    throw new Error('Invalid public key format');
  }
};

/**
 * Import private key from PEM format
 */
export const importPrivateKeyFromPEM = async (pem) => {
  try {
    const pemContents = pem
      .replace('-----BEGIN PRIVATE KEY-----', '')
      .replace('-----END PRIVATE KEY-----', '')
      .replace(/\s/g, '');
    
    const binaryDer = base64ToArrayBuffer(pemContents);
    
    const privateKey = await crypto.subtle.importKey(
      'pkcs8',
      binaryDer,
      {
        name: 'RSA-OAEP',
        hash: RSA_HASH,
      },
      true,
      ['decrypt']
    );
    
    return privateKey;
  } catch (error) {
    console.error('❌ Failed to import private key:', error);
    throw new Error('Invalid private key format');
  }
};

/**
 * Generate AES key for file encryption
 */
export const generateAESKey = async () => {
  try {
    const key = await crypto.subtle.generateKey(
      {
        name: AES_ALGORITHM,
        length: AES_KEY_LENGTH,
      },
      true, // extractable
      ['encrypt', 'decrypt']
    );
    
    return key;
  } catch (error) {
    console.error('❌ Failed to generate AES key:', error);
    throw error;
  }
};

/**
 * Export AES key to raw format
 */
export const exportAESKey = async (key) => {
  try {
    const exported = await crypto.subtle.exportKey('raw', key);
    return exported;
  } catch (error) {
    console.error('❌ Failed to export AES key:', error);
    throw error;
  }
};

/**
 * Import AES key from raw format
 */
export const importAESKey = async (rawKey) => {
  try {
    const key = await crypto.subtle.importKey(
      'raw',
      rawKey,
      {
        name: AES_ALGORITHM,
      },
      true,
      ['encrypt', 'decrypt']
    );
    
    return key;
  } catch (error) {
    console.error('❌ Failed to import AES key:', error);
    throw error;
  }
};

/**
 * Encrypt private key with password (for storage)
 */
export const encryptPrivateKey = async (privateKeyPEM, password) => {
  try {
    // Derive key from password
    const passwordKey = await deriveKeyFromPassword(password);
    
    // Generate IV
    const iv = crypto.getRandomValues(new Uint8Array(12));
    
    // Encrypt private key
    const encrypted = await crypto.subtle.encrypt(
      {
        name: AES_ALGORITHM,
        iv,
      },
      passwordKey,
      stringToArrayBuffer(privateKeyPEM)
    );
    
    // Combine IV and encrypted data
    const combined = new Uint8Array(iv.length + encrypted.byteLength);
    combined.set(iv, 0);
    combined.set(new Uint8Array(encrypted), iv.length);
    
    return combined.buffer;
  } catch (error) {
    console.error('❌ Failed to encrypt private key:', error);
    throw error;
  }
};

/**
 * Decrypt private key with password
 */
export const decryptPrivateKey = async (encryptedPrivateKey, password) => {
  try {
    // Derive key from password
    const passwordKey = await deriveKeyFromPassword(password);
    
    // Extract IV and encrypted data
    const data = new Uint8Array(encryptedPrivateKey);
    const iv = data.slice(0, 12);
    const encrypted = data.slice(12);
    
    // Decrypt private key
    const decrypted = await crypto.subtle.decrypt(
      {
        name: AES_ALGORITHM,
        iv,
      },
      passwordKey,
      encrypted
    );
    
    return arrayBufferToString(decrypted);
  } catch (error) {
    console.error('❌ Failed to decrypt private key:', error);
    throw new Error('Invalid password or corrupted key');
  }
};

/**
 * Derive encryption key from password using PBKDF2
 */
const deriveKeyFromPassword = async (password, salt = null) => {
  // Use fixed salt for password-based key derivation (or store salt with encrypted data)
  const actualSalt = salt || stringToArrayBuffer('secure-file-transfer-salt');
  
  // Import password as key material
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    stringToArrayBuffer(password),
    'PBKDF2',
    false,
    ['deriveBits', 'deriveKey']
  );
  
  // Derive AES key from password
  const key = await crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: actualSalt,
      iterations: 100000,
      hash: 'SHA-256',
    },
    keyMaterial,
    {
      name: AES_ALGORITHM,
      length: 256,
    },
    true,
    ['encrypt', 'decrypt']
  );
  
  return key;
};

/**
 * Calculate public key fingerprint
 */
export const calculatePublicKeyFingerprint = async (publicKeyPEM) => {
  try {
    const hash = await crypto.subtle.digest(
      'SHA-256',
      stringToArrayBuffer(publicKeyPEM)
    );
    
    const hashArray = Array.from(new Uint8Array(hash));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    
    return hashHex;
  } catch (error) {
    console.error('❌ Failed to calculate fingerprint:', error);
    throw error;
  }
};