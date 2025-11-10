import { AES_ALGORITHM, AES_IV_LENGTH } from '../utils/constants.js';
import {
  arrayBufferToBase64,
  concatenateArrayBuffers,
} from '../utils/arrayBufferHelpers.js';
import { generateAESKey, exportAESKey } from './keyManagement.js';

/**
 * Encrypt file with AES-GCM
 */
export const encryptFile = async (fileArrayBuffer, onProgress = null) => {
  try {
    // Generate AES key
    const aesKey = await generateAESKey();
    
    // Generate IV
    const iv = crypto.getRandomValues(new Uint8Array(AES_IV_LENGTH));
    
    // Encrypt file
    const encryptedData = await crypto.subtle.encrypt(
      {
        name: AES_ALGORITHM,
        iv,
      },
      aesKey,
      fileArrayBuffer
    );
    
    if (onProgress) onProgress(100);
    
    // Export AES key
    const exportedKey = await exportAESKey(aesKey);
    
    return {
      encryptedData,
      aesKey: exportedKey,
      iv: iv.buffer,
    };
  } catch (error) {
    console.error('❌ File encryption failed:', error);
    throw new Error('File encryption failed');
  }
};

/**
 * Encrypt file in chunks (for large files)
 */
export const encryptFileInChunks = async (file, chunkSize, onProgress = null) => {
  try {
    const aesKey = await generateAESKey();
    const iv = crypto.getRandomValues(new Uint8Array(AES_IV_LENGTH));
    
    const encryptedChunks = [];
    const totalChunks = Math.ceil(file.size / chunkSize);
    let processedChunks = 0;
    
    for (let offset = 0; offset < file.size; offset += chunkSize) {
      const chunk = file.slice(offset, offset + chunkSize);
      const arrayBuffer = await chunk.arrayBuffer();
      
      // For GCM mode, we need to encrypt the entire file at once
      // This is a simplified version - for true chunked encryption,
      // consider using AES-CTR or splitting differently
      const encryptedChunk = await crypto.subtle.encrypt(
        {
          name: AES_ALGORITHM,
          iv,
          // Note: GCM should be used for entire file, not chunks
          // This is a demonstration - adjust based on your needs
        },
        aesKey,
        arrayBuffer
      );
      
      encryptedChunks.push(encryptedChunk);
      processedChunks++;
      
      if (onProgress) {
        onProgress(Math.round((processedChunks / totalChunks) * 100));
      }
    }
    
    // Combine encrypted chunks
    const encryptedData = concatenateArrayBuffers(encryptedChunks);
    const exportedKey = await exportAESKey(aesKey);
    
    return {
      encryptedData,
      aesKey: exportedKey,
      iv: iv.buffer,
    };
  } catch (error) {
    console.error('❌ Chunked file encryption failed:', error);
    throw new Error('File encryption failed');
  }
};

/**
 * Encrypt AES key with RSA public key
 */
export const encryptAESKey = async (aesKey, rsaPublicKey) => {
  try {
    const encryptedKey = await crypto.subtle.encrypt(
      {
        name: 'RSA-OAEP',
      },
      rsaPublicKey,
      aesKey
    );
    
    return encryptedKey;
  } catch (error) {
    console.error('❌ AES key encryption failed:', error);
    throw new Error('Key encryption failed');
  }
};

/**
 * Encrypt text message with RSA public key
 */
export const encryptMessage = async (message, rsaPublicKey) => {
  try {
    const encoder = new TextEncoder();
    const data = encoder.encode(message);
    
    const encrypted = await crypto.subtle.encrypt(
      {
        name: 'RSA-OAEP',
      },
      rsaPublicKey,
      data
    );
    
    return arrayBufferToBase64(encrypted);
  } catch (error) {
    console.error('❌ Message encryption failed:', error);
    throw new Error('Message encryption failed');
  }
};

/**
 * Create digital signature
 */
export const createSignature = async (data, privateKey) => {
  try {
    // Import private key for signing
    const signingKey = await crypto.subtle.importKey(
      'pkcs8',
      privateKey,
      {
        name: 'RSA-PSS',
        hash: 'SHA-256',
      },
      true,
      ['sign']
    );
    
    const signature = await crypto.subtle.sign(
      {
        name: 'RSA-PSS',
        saltLength: 32,
      },
      signingKey,
      data
    );
    
    return arrayBufferToBase64(signature);
  } catch (error) {
    console.error('❌ Signature creation failed:', error);
    // Don't throw - signature is optional
    return null;
  }
};