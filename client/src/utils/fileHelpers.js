import { MAX_FILE_SIZE, formatFileSize } from './constants.js';

/**
 * Validate file size
 */
export const validateFileSize = (file) => {
  if (file.size > MAX_FILE_SIZE) {
    throw new Error(`File size exceeds maximum limit of ${formatFileSize(MAX_FILE_SIZE)}`);
  }
  return true;
};

/**
 * Read file as ArrayBuffer
 */
export const readFileAsArrayBuffer = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error('Failed to read file'));
    
    reader.readAsArrayBuffer(file);
  });
};

/**
 * Read file as text
 */
export const readFileAsText = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error('Failed to read file'));
    
    reader.readAsText(file);
  });
};

/**
 * Download ArrayBuffer as file
 */
export const downloadArrayBuffer = (arrayBuffer, filename, mimeType = 'application/octet-stream') => {
  const blob = new Blob([arrayBuffer], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

/**
 * Download text as file
 */
export const downloadText = (text, filename, mimeType = 'text/plain') => {
  const blob = new Blob([text], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

/**
 * Get file extension
 */
export const getFileExtension = (filename) => {
  const parts = filename.split('.');
  return parts.length > 1 ? parts.pop().toLowerCase() : '';
};

/**
 * Get file icon based on type
 */
export const getFileIcon = (filename) => {
  const ext = getFileExtension(filename);
  
  const iconMap = {
    // Images
    jpg: '🖼️',
    jpeg: '🖼️',
    png: '🖼️',
    gif: '🖼️',
    svg: '🖼️',
    webp: '🖼️',
    
    // Documents
    pdf: '📄',
    doc: '📝',
    docx: '📝',
    txt: '📝',
    rtf: '📝',
    
    // Spreadsheets
    xls: '📊',
    xlsx: '📊',
    csv: '📊',
    
    // Presentations
    ppt: '📽️',
    pptx: '📽️',
    
    // Archives
    zip: '🗜️',
    rar: '🗜️',
    '7z': '🗜️',
    tar: '🗜️',
    gz: '🗜️',
    
    // Code
    js: '💻',
    jsx: '💻',
    ts: '💻',
    tsx: '💻',
    py: '💻',
    java: '💻',
    cpp: '💻',
    c: '💻',
    html: '💻',
    css: '💻',
    
    // Media
    mp3: '🎵',
    wav: '🎵',
    flac: '🎵',
    mp4: '🎬',
    avi: '🎬',
    mkv: '🎬',
    mov: '🎬',
  };
  
  return iconMap[ext] || '📁';
};

/**
 * Calculate file checksum (SHA-256)
 */
export const calculateChecksum = async (arrayBuffer) => {
  const hashBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
};

/**
 * Split file into chunks
 */
export const splitFileIntoChunks = (file, chunkSize) => {
  const chunks = [];
  let offset = 0;
  
  while (offset < file.size) {
    const chunk = file.slice(offset, offset + chunkSize);
    chunks.push(chunk);
    offset += chunkSize;
  }
  
  return chunks;
};

/**
 * Create Blob from chunks
 */
export const createBlobFromChunks = (chunks, mimeType = 'application/octet-stream') => {
  return new Blob(chunks, { type: mimeType });
};