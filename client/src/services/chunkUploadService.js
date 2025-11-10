import { chunkFile, readChunk } from '../crypto/fileChunker.js';
import { CHUNK_SIZE, MAX_CONCURRENT_UPLOADS } from '../utils/constants.js';

/**
 * Upload file in chunks with retry logic
 */
export const uploadFileInChunks = async (
  file,
  uploadChunkFn,
  onProgress = null
) => {
  const chunks = chunkFile(file, CHUNK_SIZE);
  const totalChunks = chunks.length;
  let uploadedChunks = 0;
  
  // Upload chunks in batches
  for (let i = 0; i < chunks.length; i += MAX_CONCURRENT_UPLOADS) {
    const batch = chunks.slice(i, i + MAX_CONCURRENT_UPLOADS);
    
    await Promise.all(
      batch.map(async (chunkInfo) => {
        const chunkData = await readChunk(file, chunkInfo);
        await uploadChunkFn(chunkData, chunkInfo);
        
        uploadedChunks++;
        
        if (onProgress) {
          onProgress({
            uploaded: uploadedChunks,
            total: totalChunks,
            percentage: Math.round((uploadedChunks / totalChunks) * 100),
          });
        }
      })
    );
  }
  
  return {
    success: true,
    totalChunks,
  };
};

/**
 * Upload single chunk with retry
 */
export const uploadChunkWithRetry = async (
  uploadFn,
  chunkData,
  chunkInfo,
  maxRetries = 3
) => {
  let lastError;
  
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await uploadFn(chunkData, chunkInfo);
    } catch (error) {
      lastError = error;
      console.warn(`⚠️ Chunk ${chunkInfo.index} upload failed (attempt ${attempt + 1}/${maxRetries})`);
      
      // Wait before retry (exponential backoff)
      if (attempt < maxRetries - 1) {
        await new Promise((resolve) => setTimeout(resolve, Math.pow(2, attempt) * 1000));
      }
    }
  }
  
  throw lastError;
};