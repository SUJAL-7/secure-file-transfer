import { io } from 'socket.io-client';
import { WS_URL, LS_TOKEN } from '../utils/constants.js';

let socket = null;
let listeners = {};

/**
 * Connect to WebSocket server
 */
export const connectWebSocket = () => {
  const token = localStorage.getItem(LS_TOKEN);
  
  if (!token) {
    console.warn('⚠️ No token found, cannot connect to WebSocket');
    return null;
  }
  
  if (socket && socket.connected) {
    console.log('✅ WebSocket already connected');
    return socket;
  }
  
  socket = io(WS_URL, {
    auth: {
      token,
    },
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    reconnectionAttempts: 5,
  });
  
  socket.on('connect', () => {
    console.log('✅ WebSocket connected');
    socket.emit('user:online');
  });
  
  socket.on('disconnect', (reason) => {
    console.log('❌ WebSocket disconnected:', reason);
  });
  
  socket.on('connect_error', (error) => {
    console.error('❌ WebSocket connection error:', error);
  });
  
  // Setup event listeners
  setupListeners();
  
  return socket;
};

/**
 * Disconnect from WebSocket server
 */
export const disconnectWebSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
    listeners = {};
    console.log('✅ WebSocket disconnected');
  }
};

/**
 * Setup event listeners
 */
const setupListeners = () => {
  if (!socket) return;
  
  // New transfer notification
  socket.on('newTransfer', (data) => {
    notifyListeners('newTransfer', data);
  });
  
  // Transfer status update
  socket.on('transferStatus', (data) => {
    notifyListeners('transferStatus', data);
  });
  
  // User status update
  socket.on('user:status', (data) => {
    notifyListeners('userStatus', data);
  });
  
  // Typing indicators
  socket.on('typing:start', (data) => {
    notifyListeners('typingStart', data);
  });
  
  socket.on('typing:stop', (data) => {
    notifyListeners('typingStop', data);
  });
};

/**
 * Subscribe to event
 */
export const subscribe = (event, callback) => {
  if (!listeners[event]) {
    listeners[event] = [];
  }
  listeners[event].push(callback);
  
  // Return unsubscribe function
  return () => {
    listeners[event] = listeners[event].filter((cb) => cb !== callback);
  };
};

/**
 * Notify all listeners for an event
 */
const notifyListeners = (event, data) => {
  if (listeners[event]) {
    listeners[event].forEach((callback) => callback(data));
  }
};

/**
 * Emit event to server
 */
export const emit = (event, data) => {
  if (socket && socket.connected) {
    socket.emit(event, data);
  } else {
    console.warn('⚠️ WebSocket not connected, cannot emit event:', event);
  }
};

/**
 * Get socket instance
 */
export const getSocket = () => socket;