import { encryptFile, encryptAESKey } from './encryption.js';
import { decryptAESKey, decryptFile } from './decryption.js';
import { importPublicKeyFromPEM, importPrivateKeyFromPEM } from './keyManagement.js';
import { arrayBufferToBase64, base64ToArrayBuffer } from '../utils/arrayBufferHelpers.js';

/**
 * Hybrid encryption: Encrypt file with AES, encrypt AES key with RSA
 */
export const hybridEncrypt = async (fileArrayBuffer, recipientPublicKeyPEM, onProgress = null) => {
  try {
    // Step 1: Encrypt file with AES
    if (onProgress) onProgress({ step: 'encrypting', progress: 0 });
    
    const { encryptedData, aesKey, iv } = await encryptFile(
      fileArrayBuffer,
      (progress) => {
        if (onProgress) onProgress({ step: 'encrypting', progress: progress * 0.7 });
      }
    );
    
    // Step 2: Import recipient's public key
    if (onProgress) onProgress({ step: 'encrypting', progress: 70 });
    const recipientPublicKey = await importPublicKeyFromPEM(recipientPublicKeyPEM);
    
    // Step 3: Encrypt AES key with recipient's RSA public key
    if (onProgress) onProgress({ step: 'encrypting', progress: 80 });
    const encryptedAESKey = await encryptAESKey(aesKey, recipientPublicKey);
    
    if (onProgress) onProgress({ step: 'encrypting', progress: 100 });
    
    return {
      encryptedFile: encryptedData,
      encryptedAESKey: arrayBufferToBase64(encryptedAESKey),
      iv: arrayBufferToBase64(iv),
    };
  } catch (error) {
    console.error('❌ Hybrid encryption failed:', error);
    throw new Error(`Encryption failed: ${error.message}`);
  }
};

/**
 * Hybrid decryption: Decrypt AES key with RSA, decrypt file with AES
 */
export const hybridDecrypt = async (
  encryptedFileArrayBuffer,
  encryptedAESKeyBase64,
  ivBase64,
  privateKeyPEM,
  onProgress = null
) => {
  try {
    console.log('🔓 Starting hybrid decryption...');
    
    // Step 1: Import private key
    if (onProgress) onProgress({ step: 'decrypting', progress: 0 });
    console.log('📝 Importing private key...');
    
    const privateKey = await importPrivateKeyFromPEM(privateKeyPEM);
    console.log('✅ Private key imported successfully');
    
    // Step 2: Decrypt AES key with RSA private key
    if (onProgress) onProgress({ step: 'decrypting', progress: 20 });
    console.log('🔑 Decrypting AES key...');
    console.log('Encrypted AES Key (base64):', encryptedAESKeyBase64?.substring(0, 50) + '...');
    
    const encryptedAESKey = base64ToArrayBuffer(encryptedAESKeyBase64);
    console.log('Encrypted AES Key (ArrayBuffer):', encryptedAESKey.byteLength, 'bytes');
    
    const decryptedAESKey = await decryptAESKey(encryptedAESKey, privateKey);
    console.log('✅ AES key decrypted successfully:', decryptedAESKey.byteLength, 'bytes');
    
    // Step 3: Decrypt file with AES key
    if (onProgress) onProgress({ step: 'decrypting', progress: 40 });
    console.log('📄 Decrypting file...');
    console.log('IV (base64):', ivBase64?.substring(0, 50) + '...');
    console.log('Encrypted file size:', encryptedFileArrayBuffer.byteLength, 'bytes');
    
    const iv = base64ToArrayBuffer(ivBase64);
    console.log('IV (ArrayBuffer):', iv.byteLength, 'bytes');
    
    const decryptedFile = await decryptFile(
      encryptedFileArrayBuffer,
      decryptedAESKey,
      iv,
      (progress) => {
        if (onProgress) onProgress({ step: 'decrypting', progress: 40 + progress * 0.6 });
      }
    );
    
    console.log('✅ File decrypted successfully:', decryptedFile.byteLength, 'bytes');
    
    if (onProgress) onProgress({ step: 'decrypting', progress: 100 });
    
    return decryptedFile;
  } catch (error) {
    console.error('❌ Hybrid decryption failed:', error);
    console.error('Error details:', {
      name: error.name,
      message: error.message,
      stack: error.stack,
    });
    
    // Provide more specific error messages
    if (error.message.includes('private key')) {
      throw new Error('Invalid private key. Please make sure you unlocked the correct key.');
    } else if (error.message.includes('decrypt')) {
      throw new Error('Decryption failed. The file may be corrupted or you may not have the correct key.');
    } else {
      throw new Error(`Decryption failed: ${error.message}`);
    }
  }
};

/**
 * Encrypt file for multiple recipients
 */
export const encryptForMultipleRecipients = async (
  fileArrayBuffer,
  recipientPublicKeys,
  onProgress = null
) => {
  try {
    // Step 1: Encrypt file with AES (once)
    const { encryptedData, aesKey, iv } = await encryptFile(fileArrayBuffer);
    
    // Step 2: Encrypt AES key for each recipient
    const encryptedKeys = {};
    
    for (let i = 0; i < recipientPublicKeys.length; i++) {
      const { userId, publicKeyPEM } = recipientPublicKeys[i];
      const publicKey = await importPublicKeyFromPEM(publicKeyPEM);
      const encryptedAESKey = await encryptAESKey(aesKey, publicKey);
      
      encryptedKeys[userId] = arrayBufferToBase64(encryptedAESKey);
      
      if (onProgress) {
        onProgress({
          step: 'encrypting',
          progress: Math.round(((i + 1) / recipientPublicKeys.length) * 100),
        });
      }
    }
    
    return {
      encryptedFile: encryptedData,
      encryptedKeys, // Object with userId: encryptedKey pairs
      iv: arrayBufferToBase64(iv),
    };
  } catch (error) {
    console.error('❌ Multi-recipient encryption failed:', error);
    throw error;
  }
};