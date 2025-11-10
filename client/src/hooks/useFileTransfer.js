import { useState, useCallback } from 'react';
import { sendEncryptedFile, receiveAndDecryptFile } from '../services/transferService.js';

export const useFileTransfer = () => {
  const [sending, setSending] = useState(false);
  const [receiving, setReceiving] = useState(false);
  const [progress, setProgress] = useState(null);
  const [error, setError] = useState(null);

  // Send file
  const sendFile = useCallback(async (file, recipientId, options = {}) => {
    setSending(true);
    setError(null);
    setProgress({ step: 'starting', progress: 0 });
    
    try {
      const result = await sendEncryptedFile(file, recipientId, options, setProgress);
      setSending(false);
      setProgress(null);
      return result;
    } catch (err) {
      setError(err.message);
      setSending(false);
      setProgress(null);
      throw err;
    }
  }, []);

  // Receive file - now accepts privateKey as parameter
  const receiveFile = useCallback(async (transferId, privateKeyPEM) => {
    console.log('🔽 receiveFile called');
    console.log('Transfer ID:', transferId);
    console.log('Private key provided:', !!privateKeyPEM);
    console.log('Private key length:', privateKeyPEM?.length);

    if (!privateKeyPEM) {
      const errorMsg = 'Private key not provided. Please import your private key first.';
      console.error('❌', errorMsg);
      setError(errorMsg);
      throw new Error(errorMsg);
    }
    
    setReceiving(true);
    setError(null);
    setProgress({ step: 'starting', progress: 0 });
    
    try {
      console.log('✅ Starting file receive with private key');
      const result = await receiveAndDecryptFile(transferId, privateKeyPEM, setProgress);
      setReceiving(false);
      setProgress(null);
      return result;
    } catch (err) {
      console.error('❌ receiveFile error:', err);
      setError(err.message);
      setReceiving(false);
      setProgress(null);
      throw err;
    }
  }, []); // No dependencies on privateKeyPEM from context

  // Reset state
  const reset = useCallback(() => {
    setSending(false);
    setReceiving(false);
    setProgress(null);
    setError(null);
  }, []);

  return {
    sending,
    receiving,
    progress,
    error,
    sendFile,
    receiveFile,
    reset,
  };
};