/**
 * Convert ArrayBuffer to Base64 string
 */
export const arrayBufferToBase64 = (buffer) => {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
};

/**
 * Convert Base64 string to ArrayBuffer
 */
export const base64ToArrayBuffer = (base64) => {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
};

/**
 * Convert string to ArrayBuffer
 */
export const stringToArrayBuffer = (str) => {
  const encoder = new TextEncoder();
  return encoder.encode(str);
};

/**
 * Convert ArrayBuffer to string
 */
export const arrayBufferToString = (buffer) => {
  const decoder = new TextDecoder();
  return decoder.decode(buffer);
};

/**
 * Convert ArrayBuffer to Hex string
 */
export const arrayBufferToHex = (buffer) => {
  const bytes = new Uint8Array(buffer);
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
};

/**
 * Convert Hex string to ArrayBuffer
 */
export const hexToArrayBuffer = (hex) => {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.substr(i, 2), 16);
  }
  return bytes.buffer;
};

/**
 * Concatenate multiple ArrayBuffers
 */
export const concatenateArrayBuffers = (buffers) => {
  const totalLength = buffers.reduce((acc, buf) => acc + buf.byteLength, 0);
  const result = new Uint8Array(totalLength);
  let offset = 0;
  
  for (const buffer of buffers) {
    result.set(new Uint8Array(buffer), offset);
    offset += buffer.byteLength;
  }
  
  return result.buffer;
};

/**
 * Compare two ArrayBuffers
 */
export const compareArrayBuffers = (buf1, buf2) => {
  if (buf1.byteLength !== buf2.byteLength) return false;
  
  const arr1 = new Uint8Array(buf1);
  const arr2 = new Uint8Array(buf2);
  
  for (let i = 0; i < arr1.length; i++) {
    if (arr1[i] !== arr2[i]) return false;
  }
  
  return true;
};

/**
 * Generate random bytes
 */
export const generateRandomBytes = (length) => {
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  return array.buffer;
};