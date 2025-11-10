import http from 'http';
import fs from 'fs';
import { Server } from 'socket.io';
import app from './app.js';
import connectDB from './config/database.js';
import config from './config/config.js';
import { initializeSocket } from './websocket/socketHandler.js';

// Connect to database
connectDB();

// Ensure uploads directory exists
if (!fs.existsSync(config.uploadPath)) {
  fs.mkdirSync(config.uploadPath, { recursive: true });
  console.log(`✅ Created uploads directory: ${config.uploadPath}`);
}

// Create HTTP server
const server = http.createServer(app);

// Initialize Socket.IO
const io = new Server(server, {
  cors: {
    origin: config.corsOrigin,
    credentials: true,
  },
  pingTimeout: 60000,
});

// Initialize socket handlers
initializeSocket(io);

// Make io accessible to routes
app.set('io', io);

// Start server
server.listen(config.port, () => {
  console.log(`
╔════════════════════════════════════════════════════════════════╗
║                                                                ║
║   🔐 Secure File Transfer Server                               ║
║                                                                ║
║   Server running on port: ${config.port}                               ║
║   Environment: ${config.nodeEnv}                                  ║
║   CORS Origin: ${config.corsOrigin}            ║
║   Upload Path: ${config.uploadPath}                           ║
║                                                                ║
║   API: http://localhost:${config.port}/api                         ║
║   Health: http://localhost:${config.port}/health                   ║
║                                                                ║
╚════════════════════════════════════════════════════════════════╝
  `);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('❌ Unhandled Rejection:', err);
  server.close(() => process.exit(1));
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('❌ Uncaught Exception:', err);
  process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('👋 SIGTERM received. Shutting down gracefully...');
  server.close(() => {
    console.log('✅ Process terminated');
  });
});