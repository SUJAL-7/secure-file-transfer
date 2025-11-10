import { useEffect, useState, useCallback } from 'react';
import {
  connectWebSocket,
  disconnectWebSocket,
  subscribe,
  emit,
} from '../services/websocketService.js';
import { useAuth } from './useAuth.js';

export const useWebSocket = () => {
  const { isAuthenticated } = useAuth();
  const [connected, setConnected] = useState(false);

  // Connect on mount if authenticated
  useEffect(() => {
    if (isAuthenticated) {
      const socket = connectWebSocket();
      
      if (socket) {
        socket.on('connect', () => setConnected(true));
        socket.on('disconnect', () => setConnected(false));
      }
    }
    
    return () => {
      disconnectWebSocket();
      setConnected(false);
    };
  }, [isAuthenticated]);

  // Subscribe to event
  const on = useCallback((event, callback) => {
    return subscribe(event, callback);
  }, []);

  // Emit event
  const send = useCallback((event, data) => {
    emit(event, data);
  }, []);

  return {
    connected,
    on,
    send,
  };
};