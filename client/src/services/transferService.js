import {
  initiateTransfer,
  uploadEncryptedFile,
  downloadEncryptedFile,
  getTransferDetails,
} from '../api/transfers.js';
import { getUserPublicKey } from '../api/users.js';
import { hybridEncrypt, hybridDecrypt } from '../crypto/hybridCrypto.js';
import { readFileAsArrayBuffer, downloadArrayBuffer } from '../utils/fileHelpers.js';

/**
 * Send encrypted file to recipient
 */
export const sendEncryptedFile = async (
  file,
  recipientId,
  options = {},
  onProgress = null
) => {
  try {
    // Step 1: Get recipient's public key
    if (onProgress) onProgress({ step: 'fetching-key', progress: 0 });
    const { data } = await getUserPublicKey(recipientId);
    const recipientPublicKey = data.publicKey;
    
    // Step 2: Read file
    if (onProgress) onProgress({ step: 'reading-file', progress: 10 });
    const fileArrayBuffer = await readFileAsArrayBuffer(file);
    
    // Step 3: Encrypt file (hybrid encryption)
    const encryptResult = await hybridEncrypt(
      fileArrayBuffer,
      recipientPublicKey,
      (progressData) => {
        if (onProgress) {
          onProgress({
            step: 'encrypting',
            progress: 10 + progressData.progress * 0.5,
          });
        }
      }
    );
    
    // Step 4: Initiate transfer on server
    if (onProgress) onProgress({ step: 'initiating', progress: 60 });
    const transferData = {
      recipientId,
      originalFilename: file.name,
      fileSize: encryptResult.encryptedFile.byteLength,
      mimeType: file.type,
      encryptedAESKey: encryptResult.encryptedAESKey,
      iv: encryptResult.iv,
      encryptedMessage: options.message || null,
      expiresIn: options.expiresIn || 7,
    };
    
    const { data: initData } = await initiateTransfer(transferData);
    
    // Step 5: Upload encrypted file
    if (onProgress) onProgress({ step: 'uploading', progress: 70 });
    const encryptedBlob = new Blob([encryptResult.encryptedFile]);
    const encryptedFile = new File([encryptedBlob], initData.encryptedFilename, {
      type: 'application/octet-stream',
    });
    
    await uploadEncryptedFile(initData.transferId, encryptedFile, (uploadProgress) => {
      if (onProgress) {
        onProgress({
          step: 'uploading',
          progress: 70 + uploadProgress * 0.3,
        });
      }
    });
    
    if (onProgress) onProgress({ step: 'complete', progress: 100 });
    
    return {
      transferId: initData.transferId,
      success: true,
    };
  } catch (error) {
    console.error('❌ Failed to send encrypted file:', error);
    throw error;
  }
};

/**
 * Receive and decrypt file
 */
export const receiveAndDecryptFile = async (
  transferId,
  privateKeyPEM,
  onProgress = null
) => {
  try {
    console.log('📥 Starting file receive and decrypt process...');
    console.log('Transfer ID:', transferId);
    
    // Step 1: Get transfer details
    if (onProgress) onProgress({ step: 'fetching-details', progress: 0 });
    console.log('📋 Fetching transfer details...');
    
    const { data: transferDetails } = await getTransferDetails(transferId);
    console.log('✅ Transfer details fetched:', {
      filename: transferDetails.transfer.originalFilename,
      fileSize: transferDetails.transfer.fileSize,
      sender: transferDetails.transfer.sender,
      recipient: transferDetails.transfer.recipient,
      hasEncryptedKey: !!transferDetails.transfer.encryptedAESKey,
      hasIV: !!transferDetails.transfer.iv,
      encryptedKeyLength: transferDetails.transfer.encryptedAESKey?.length,
    });
    
    console.log('🔑 Private key info:', {
      hasPrivateKey: !!privateKeyPEM,
      privateKeyLength: privateKeyPEM?.length,
      privateKeyStart: privateKeyPEM?.substring(0, 50),
    });
    
    // Step 2: Download encrypted file
    if (onProgress) onProgress({ step: 'downloading', progress: 10 });
    console.log('⬇️ Downloading encrypted file...');
    
    const encryptedBlob = await downloadEncryptedFile(transferId, (downloadProgress) => {
      if (onProgress) {
        onProgress({
          step: 'downloading',
          progress: 10 + downloadProgress * 0.3,
        });
      }
    });
    
    console.log('✅ Encrypted file downloaded:', encryptedBlob.size, 'bytes');
    
    // Step 3: Read blob as ArrayBuffer
    if (onProgress) onProgress({ step: 'reading', progress: 40 });
    console.log('📖 Reading encrypted blob...');
    
    const encryptedArrayBuffer = await encryptedBlob.arrayBuffer();
    console.log('✅ Blob read as ArrayBuffer:', encryptedArrayBuffer.byteLength, 'bytes');
    
    // Step 4: Decrypt file
    console.log('🔓 Starting decryption with:', {
      encryptedSize: encryptedArrayBuffer.byteLength,
      encryptedKeyLength: transferDetails.transfer.encryptedAESKey?.length,
      ivLength: transferDetails.transfer.iv?.length,
      hasPrivateKey: !!privateKeyPEM,
    });
    
    const decryptedArrayBuffer = await hybridDecrypt(
      encryptedArrayBuffer,
      transferDetails.transfer.encryptedAESKey,
      transferDetails.transfer.iv,
      privateKeyPEM,
      (progressData) => {
        if (onProgress) {
          onProgress({
            step: 'decrypting',
            progress: 40 + progressData.progress * 0.5,
          });
        }
      }
    );
    
    console.log('✅ File decrypted successfully');
    
    // Step 5: Download decrypted file
    if (onProgress) onProgress({ step: 'saving', progress: 90 });
    console.log('💾 Saving decrypted file...');
    
    downloadArrayBuffer(
      decryptedArrayBuffer,
      transferDetails.transfer.originalFilename,
      transferDetails.transfer.mimeType
    );
    
    console.log('✅ File saved successfully');
    
    if (onProgress) onProgress({ step: 'complete', progress: 100 });
    
    return {
      success: true,
      filename: transferDetails.transfer.originalFilename,
    };
  } catch (error) {
    console.error('❌ Failed to receive and decrypt file:', error);
    console.error('Full error:', {
      name: error.name,
      message: error.message,
      stack: error.stack,
    });
    throw error;
  }
};