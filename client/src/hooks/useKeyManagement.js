import { useState, useCallback } from 'react';
import { useCrypto } from './useCrypto.js';

export const useKeyManagement = () => {
  const crypto = useCrypto();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Generate keys
  const generateKeys = useCallback(async (password) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await crypto.generateKeys(password);
      setLoading(false);
      return result;
    } catch (err) {
      setError(err.message);
      setLoading(false);
      throw err;
    }
  }, [crypto]);

  // Unlock keys
  const unlockKeys = useCallback(async (password) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await crypto.unlockPrivateKey(password);
      setLoading(false);
      return result;
    } catch (err) {
      setError(err.message);
      setLoading(false);
      throw err;
    }
  }, [crypto]);

  // Export keys
  const exportKeys = useCallback(async (password) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await crypto.exportPrivateKey(password);
      setLoading(false);
      return result;
    } catch (err) {
      setError(err.message);
      setLoading(false);
      throw err;
    }
  }, [crypto]);

  return {
    ...crypto,
    loading,
    error,
    generateKeys,
    unlockKeys,
    exportKeys,
  };
};