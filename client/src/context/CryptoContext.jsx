import { useState, useCallback, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth.js';
import { CryptoContext } from './cryptoContext.js';

export function CryptoProvider({ children }) {
  const { user } = useAuth();
  const [publicKeyPEM, setPublicKeyPEM] = useState(null);
  const [privateKeyPEM, setPrivateKeyPEM] = useState(null);
  const [loading, setLoading] = useState(false);

  // Load public key from server on mount
  useEffect(() => {
    const loadPublicKey = async () => {
      if (!user) {
        setLoading(false);
        return;
      }
      
      try {
        console.log('🔍 Loading public key from server...');
        // Public key is stored in user object from server
        setPublicKeyPEM(user.publicKey);
        console.log('✅ Public key loaded');
      } catch (error) {
        console.error('❌ Failed to load public key:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadPublicKey();
  }, [user]);

  // Set private key from imported file
  const setPrivateKey = useCallback((pemContent) => {
    console.log('🔑 Setting private key from import');
    setPrivateKeyPEM(pemContent);
  }, []);

  // Clear private key
  const clearPrivateKey = useCallback(() => {
    console.log('🗑️ Clearing private key from memory');
    setPrivateKeyPEM(null);
  }, []);

  const value = {
    hasPublicKey: !!publicKeyPEM,
    publicKeyPEM,
    privateKeyPEM,
    hasPrivateKey: !!privateKeyPEM,
    loading,
    setPrivateKey,
    clearPrivateKey,
  };

  return <CryptoContext.Provider value={value}>{children}</CryptoContext.Provider>;
}