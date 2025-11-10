import { AES_ALGORITHM } from '../utils/constants.js';
import {
  base64ToArrayBuffer,
  arrayBufferToString,
} from '../utils/arrayBufferHelpers.js';
import { importAESKey } from './keyManagement.js';

/**
 * Decrypt AES key with RSA private key
 */
export const decryptAESKey = async (encryptedKey, rsaPrivateKey) => {
  try {
    console.log('🔑 Decrypting AES key with RSA private key...');
    console.log('Encrypted key size:', encryptedKey.byteLength, 'bytes');
    
    const decryptedKey = await crypto.subtle.decrypt(
      {
        name: 'RSA-OAEP',
      },
      rsaPrivateKey,
      encryptedKey
    );
    
    console.log('✅ AES key decrypted, size:', decryptedKey.byteLength, 'bytes');
    return decryptedKey;
  } catch (error) {
    console.error('❌ AES key decryption failed:', error);
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    throw new Error('Failed to decrypt encryption key. Make sure you have the correct private key.');
  }
};

/**
 * Decrypt file with AES-GCM
 */
export const decryptFile = async (encryptedData, aesKeyRaw, iv, onProgress = null) => {
  try {
    console.log('📄 Decrypting file with AES-GCM...');
    console.log('Encrypted data size:', encryptedData.byteLength, 'bytes');
    console.log('AES key size:', aesKeyRaw.byteLength, 'bytes');
    console.log('IV size:', iv.byteLength, 'bytes');
    
    // Import AES key
    const aesKey = await importAESKey(aesKeyRaw);
    console.log('✅ AES key imported');
    
    // Decrypt file
    const decryptedData = await crypto.subtle.decrypt(
      {
        name: AES_ALGORITHM,
        iv: new Uint8Array(iv),
      },
      aesKey,
      encryptedData
    );
    
    console.log('✅ File decrypted, size:', decryptedData.byteLength, 'bytes');
    
    if (onProgress) onProgress(100);
    
    return decryptedData;
  } catch (error) {
    console.error('❌ File decryption failed:', error);
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    
    if (error.name === 'OperationError') {
      throw new Error('Decryption failed. The file may be corrupted or the encryption key is invalid.');
    }
    
    throw new Error(`Decryption failed: ${error.message}`);
  }
};

/**
 * Decrypt text message with RSA private key
 */
export const decryptMessage = async (encryptedMessageBase64, rsaPrivateKey) => {
  try {
    const encryptedData = base64ToArrayBuffer(encryptedMessageBase64);
    
    const decrypted = await crypto.subtle.decrypt(
      {
        name: 'RSA-OAEP',
      },
      rsaPrivateKey,
      encryptedData
    );
    
    return arrayBufferToString(decrypted);
  } catch (error) {
    console.error('❌ Message decryption failed:', error);
    throw new Error('Message decryption failed');
  }
};

/**
 * Verify digital signature
 */
export const verifySignature = async (data, signatureBase64, publicKey) => {
  try {
    const signature = base64ToArrayBuffer(signatureBase64);
    
    // Import public key for verification
    const verifyKey = await crypto.subtle.importKey(
      'spki',
      publicKey,
      {
        name: 'RSA-PSS',
        hash: 'SHA-256',
      },
      true,
      ['verify']
    );
    
    const isValid = await crypto.subtle.verify(
      {
        name: 'RSA-PSS',
        saltLength: 32,
      },
      verifyKey,
      signature,
      data
    );
    
    return isValid;
  } catch (error) {
    console.error('❌ Signature verification failed:', error);
    return false;
  }
};