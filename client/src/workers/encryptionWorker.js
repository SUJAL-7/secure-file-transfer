/**
 * Web Worker for file encryption
 * Runs encryption in background thread to avoid blocking UI
 */

// Import crypto utilities (in worker context)
const AES_ALGORITHM = 'AES-GCM';
const AES_KEY_LENGTH = 256;
const AES_IV_LENGTH = 12;

self.addEventListener('message', async (event) => {
  const { type, payload } = event.data;
  
  try {
    switch (type) {
      case 'ENCRYPT_FILE':
        await encryptFile(payload);
        break;
        
      case 'ENCRYPT_CHUNK':
        await encryptChunk(payload);
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
 * Encrypt entire file
 */
async function encryptFile({ fileArrayBuffer, jobId }) {
  try {
    // Generate AES key
    const aesKey = await crypto.subtle.generateKey(
      {
        name: AES_ALGORITHM,
        length: AES_KEY_LENGTH,
      },
      true,
      ['encrypt', 'decrypt']
    );
    
    // Generate IV
    const iv = crypto.getRandomValues(new Uint8Array(AES_IV_LENGTH));
    
    // Encrypt file
    self.postMessage({
      type: 'PROGRESS',
      jobId,
      progress: 50,
    });
    
    const encryptedData = await crypto.subtle.encrypt(
      {
        name: AES_ALGORITHM,
        iv,
      },
      aesKey,
      fileArrayBuffer
    );
    
    // Export AES key
    const exportedKey = await crypto.subtle.exportKey('raw', aesKey);
    
    self.postMessage({
      type: 'ENCRYPT_COMPLETE',
      jobId,
      result: {
        encryptedData,
        aesKey: exportedKey,
        iv: iv.buffer,
      },
    }, [encryptedData, exportedKey]); // Transfer ownership
    
  } catch (error) {
    self.postMessage({
      type: 'ERROR',
      jobId,
      error: error.message,
    });
  }
}

/**
 * Encrypt single chunk
 */
async function encryptChunk({ chunkData, aesKey, iv, chunkIndex, jobId }) {
  try {
    // Import AES key
    const key = await crypto.subtle.importKey(
      'raw',
      aesKey,
      {
        name: AES_ALGORITHM,
      },
      false,
      ['encrypt']
    );
    
    // Encrypt chunk
    const encryptedChunk = await crypto.subtle.encrypt(
      {
        name: AES_ALGORITHM,
        iv: new Uint8Array(iv),
      },
      key,
      chunkData
    );
    
    self.postMessage({
      type: 'CHUNK_ENCRYPTED',
      jobId,
      chunkIndex,
      encryptedChunk,
    }, [encryptedChunk]); // Transfer ownership
    
  } catch (error) {
    self.postMessage({
      type: 'ERROR',
      jobId,
      chunkIndex,
      error: error.message,
    });
  }
}