import { useContext } from 'react';
import { CryptoContext } from '../context/cryptoContext.js';

export const useCrypto = () => {
  const context = useContext(CryptoContext);
  
  if (!context) {
    throw new Error('useCrypto must be used within CryptoProvider');
  }
  
  return context;
};