import axios from './axios.js';

/**
 * Initiate a new transfer
 */
export const initiateTransfer = async (transferData) => {
  return await axios.post('/transfers/initiate', transferData);
};

/**
 * Upload encrypted file
 */
export const uploadEncryptedFile = async (transferId, file, onProgress = null) => {
  const formData = new FormData();
  formData.append('file', file);
  
  return await axios.post(`/transfers/${transferId}/upload`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    onUploadProgress: (progressEvent) => {
      if (onProgress && progressEvent.total) {
        const percentCompleted = Math.round(
          (progressEvent.loaded * 100) / progressEvent.total
        );
        onProgress(percentCompleted);
      }
    },
  });
};

/**
 * Get received transfers
 */
export const getReceivedTransfers = async (params = {}) => {
  return await axios.get('/transfers/received', { params });
};

/**
 * Get sent transfers
 */
export const getSentTransfers = async (params = {}) => {
  return await axios.get('/transfers/sent', { params });
};

/**
 * Get transfer details
 */
export const getTransferDetails = async (transferId) => {
  return await axios.get(`/transfers/${transferId}`);
};

/**
 * Download encrypted file
 */
export const downloadEncryptedFile = async (transferId, onProgress = null) => {
  return await axios.get(`/transfers/${transferId}/download`, {
    responseType: 'blob',
    onDownloadProgress: (progressEvent) => {
      if (onProgress && progressEvent.total) {
        const percentCompleted = Math.round(
          (progressEvent.loaded * 100) / progressEvent.total
        );
        onProgress(percentCompleted);
      }
    },
  });
};

/**
 * Delete transfer
 */
export const deleteTransfer = async (transferId) => {
  return await axios.delete(`/transfers/${transferId}`);
};

/**
 * Get transfer statistics
 */
export const getTransferStats = async () => {
  return await axios.get('/transfers/stats');
};