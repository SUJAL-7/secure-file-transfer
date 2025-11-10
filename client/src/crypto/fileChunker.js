import { CHUNK_SIZE } from '../utils/constants.js';

/**
 * Split file into chunks for processing
 */
export const chunkFile = (file, chunkSize = CHUNK_SIZE) => {
  const chunks = [];
  let offset = 0;
  
  while (offset < file.size) {
    const end = Math.min(offset + chunkSize, file.size);
    chunks.push({
      index: chunks.length,
      start: offset,
      end: end,
      size: end - offset,
    });
    offset = end;
  }
  
  return chunks;
};

/**
 * Read chunk as ArrayBuffer
 */
export const readChunk = async (file, chunkInfo) => {
  const blob = file.slice(chunkInfo.start, chunkInfo.end);
  return await blob.arrayBuffer();
};

/**
 * Process file in chunks with callback
 */
export const processFileInChunks = async (file, processor, onProgress = null) => {
  const chunks = chunkFile(file);
  const results = [];
  
  for (let i = 0; i < chunks.length; i++) {
    const chunkData = await readChunk(file, chunks[i]);
    const result = await processor(chunkData, chunks[i]);
    results.push(result);
    
    if (onProgress) {
      onProgress({
        current: i + 1,
        total: chunks.length,
        percentage: Math.round(((i + 1) / chunks.length) * 100),
      });
    }
  }
  
  return results;
};

/**
 * Combine chunks into single ArrayBuffer
 */
export const combineChunks = (chunks) => {
  const totalLength = chunks.reduce((acc, chunk) => acc + chunk.byteLength, 0);
  const combined = new Uint8Array(totalLength);
  
  let offset = 0;
  for (const chunk of chunks) {
    combined.set(new Uint8Array(chunk), offset);
    offset += chunk.byteLength;
  }
  
  return combined.buffer;
};