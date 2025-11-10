/**
 * Web Worker for file decryption
 * Runs decryption in background thread to avoid blocking UI
 */

const AES_ALGORITHM = 'AES-GCM';

self.addEventListener('message', async (event) => {
  const { type, payload } = event.data;
  
  try {
    switch (type) {
      case 'DECRYPT_FILE':
        await decryptFile(payload);
        break;
        
      case 'DECRYPT_CHUNK':
        await decryptChunk(payload);
        break;
        
      default:
        self.postMessage({
          type: 'ERROR',
          error: 'Unknown message type',
        });
    }
  } catch (error) {
    self.postMessage({
      type: 'ERROR',
      error: error.message,
    });
  }
});

/**
 * Decrypt entire file
 */
async function decryptFile({ encryptedData, aesKeyRaw, iv, jobId }) {
  try {
    // Import AES key
    const aesKey = await crypto.subtle.importKey(
      'raw',
      aesKeyRaw,
      {
        name: AES_ALGORITHM,
      },
      false,
      ['decrypt']
    );
    
    self.postMessage({
      type: 'PROGRESS',
      jobId,
      progress: 50,
    });
    
    // Decrypt file
    const decryptedData = await crypto.subtle.decrypt(
      {
        name: AES_ALGORITHM,
        iv: new Uint8Array(iv),
      },
      aesKey,
      encryptedData
    );
    
    self.postMessage({
      type: 'DECRYPT_COMPLETE',
      jobId,
      result: decryptedData,
    }, [decryptedData]); // Transfer ownership
    
  } catch (error) {
    console.log(error)
    self.postMessage({
      type: 'ERROR',
      jobId,
      error: 'Decryption failed. Invalid key or corrupted file.',
    });
  }
}

/**
 * Decrypt single chunk
 */
async function decryptChunk({ encryptedChunk, aesKey, iv, chunkIndex, jobId }) {
  try {
    // Import AES key
    const key = await crypto.subtle.importKey(
      'raw',
      aesKey,
      {
        name: AES_ALGORITHM,
      },
      false,
      ['decrypt']
    );
    
    // Decrypt chunk
    const decryptedChunk = await crypto.subtle.decrypt(
      {
        name: AES_ALGORITHM,
        iv: new Uint8Array(iv),
      },
      key,
      encryptedChunk
    );
    
    self.postMessage({
      type: 'CHUNK_DECRYPTED',
      jobId,
      chunkIndex,
      decryptedChunk,
    }, [decryptedChunk]); // Transfer ownership
    
  } catch (error) {
    self.postMessage({
      type: 'ERROR',
      jobId,
      chunkIndex,
      error: error.message,
    });
  }
}