import { createContext } from 'react';

export const CryptoContext = createContext({
  hasPublicKey: false,
  publicKeyPEM: null,
  privateKeyPEM: null,
  hasPrivateKey: false,
  loading: true,
  setPrivateKey: () => {},
  clearPrivateKey: () => {},
});