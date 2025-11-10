import { useState, useCallback, useEffect } from 'react';
import {
  getReceivedTransfers,
  getSentTransfers,
  getTransferStats,
} from '../api/transfers.js';
import { useAuth } from '../hooks/useAuth.js';
import { subscribe } from '../services/websocketService.js';
import { TransferContext } from './transferContext.js';

export function TransferProvider({ children }) {
  const { isAuthenticated } = useAuth();
  const [receivedTransfers, setReceivedTransfers] = useState([]);
  const [sentTransfers, setSentTransfers] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [newTransferCount, setNewTransferCount] = useState(0);

  // Fetch received transfers
  const fetchReceivedTransfers = useCallback(async () => {
    try {
      const { data } = await getReceivedTransfers();
      setReceivedTransfers(data.transfers);
    } catch (error) {
      console.error('❌ Failed to fetch received transfers:', error);
    }
  }, []);

  // Fetch sent transfers
  const fetchSentTransfers = useCallback(async () => {
    try {
      const { data } = await getSentTransfers();
      setSentTransfers(data.transfers);
    } catch (error) {
      console.error('❌ Failed to fetch sent transfers:', error);
    }
  }, []);

  // Fetch stats
  const fetchStats = useCallback(async () => {
    try {
      const { data } = await getTransferStats();
      setStats(data);
    } catch (error) {
      console.error('❌ Failed to fetch stats:', error);
    }
  }, []);

  // Fetch all data
  const fetchAllData = useCallback(async () => {
    setLoading(true);
    await Promise.all([
      fetchReceivedTransfers(),
      fetchSentTransfers(),
      fetchStats(),
    ]);
    setLoading(false);
  }, [fetchReceivedTransfers, fetchSentTransfers, fetchStats]);

  // Initialize on mount
  useEffect(() => {
    if (isAuthenticated) {
      fetchAllData();
    }
  }, [isAuthenticated, fetchAllData]);

  // Subscribe to WebSocket events
  useEffect(() => {
    if (!isAuthenticated) return;
    
    const unsubscribe = subscribe('newTransfer', (data) => {
      console.log('📥 New transfer received:', data);
      setNewTransferCount((prev) => prev + 1);
      fetchReceivedTransfers();
    });
    
    return unsubscribe;
  }, [isAuthenticated, fetchReceivedTransfers]);

  // Clear new transfer count
  const clearNewTransferCount = useCallback(() => {
    setNewTransferCount(0);
  }, []);

  const value = {
    receivedTransfers,
    sentTransfers,
    stats,
    loading,
    newTransferCount,
    fetchReceivedTransfers,
    fetchSentTransfers,
    fetchStats,
    fetchAllData,
    clearNewTransferCount,
  };

  return <TransferContext.Provider value={value}>{children}</TransferContext.Provider>;
}