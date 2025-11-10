import jwt from 'jsonwebtoken';
import config from '../config/config.js';

/**
 * Socket.IO authentication middleware
 */
const authenticateSocket = async (socket, next) => {
  try {
    const token = socket.handshake.auth.token;

    if (!token) {
      return next(new Error('Authentication error: No token provided'));
    }

    // Verify token
    const decoded = jwt.verify(token, config.jwtSecret);
    socket.userId = decoded.id;
    next();
  } catch (error) {
    next(new Error('Authentication error: Invalid token'));
  }
};

/**
 * Initialize Socket.IO
 */
export const initializeSocket = (io) => {
  // Use authentication middleware
  io.use(authenticateSocket);

  io.on('connection', (socket) => {
    console.log(`✅ User connected: ${socket.userId}`);

    // Join user's personal room (for notifications)
    socket.join(socket.userId);

    // Handle user status
    socket.on('user:online', () => {
      socket.broadcast.emit('user:status', {
        userId: socket.userId,
        status: 'online',
      });
    });

    // Handle typing indicators (optional feature)
    socket.on('typing:start', (data) => {
      socket.to(data.recipientId).emit('typing:start', {
        userId: socket.userId,
      });
    });

    socket.on('typing:stop', (data) => {
      socket.to(data.recipientId).emit('typing:stop', {
        userId: socket.userId,
      });
    });

    // Handle transfer notifications (triggered by server, not client)
    // Client can request notification check
    socket.on('transfer:check', async () => {
      // Could fetch unread transfers and emit to client
      // This is handled by REST API, but can add real-time sync here
    });

    // Handle disconnection
    socket.on('disconnect', () => {
      console.log(`❌ User disconnected: ${socket.userId}`);
      socket.broadcast.emit('user:status', {
        userId: socket.userId,
        status: 'offline',
      });
    });

    // Error handling
    socket.on('error', (error) => {
      console.error('Socket error:', error);
    });
  });

  return io;
};

/**
 * Emit transfer notification to recipient
 */
export const notifyTransfer = (io, recipientId, transferData) => {
  io.to(recipientId.toString()).emit('newTransfer', transferData);
};

/**
 * Emit transfer status update
 */
export const notifyTransferStatus = (io, userId, transferId, status) => {
  io.to(userId.toString()).emit('transferStatus', {
    transferId,
    status,
  });
};