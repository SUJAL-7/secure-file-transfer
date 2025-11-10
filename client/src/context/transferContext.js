import { createContext } from 'react';

export const TransferContext = createContext({
  receivedTransfers: [],
  sentTransfers: [],
  stats: null,
  loading: true,
  newTransferCount: 0,
  fetchReceivedTransfers: async () => {},
  fetchSentTransfers: async () => {},
  fetchStats: async () => {},
  fetchAllData: async () => {},
  clearNewTransferCount: () => {},
});