# Secure File Transfer - Server

Backend API for secure file transfer application. Handles user authentication, public key storage, and encrypted file relay.

## Features

- ✅ User authentication with JWT
- ✅ Public key storage and retrieval
- ✅ Encrypted file storage (server cannot decrypt)
- ✅ Real-time notifications via WebSocket
- ✅ Transfer metadata management
- ✅ File expiration and cleanup
- ✅ Rate limiting and security

## API Endpoints

### Authentication

```
POST   /api/auth/register      - Register new user with public key
POST   /api/auth/login         - Login user
GET    /api/auth/me            - Get current user
PUT    /api/auth/update-key    - Update public key
```

### Users

```
GET    /api/users/search       - Search users (query: ?q=username)
GET    /api/users/profile      - Get current user profile
PUT    /api/users/profile      - Update user profile
GET    /api/users/:id/public-key - Get user's public key
GET    /api/users/username/:username - Get user by username
```

### Transfers

```
POST   /api/transfers/initiate      - Initiate transfer (create metadata)
POST   /api/transfers/:id/upload    - Upload encrypted file
GET    /api/transfers/received      - Get received transfers
GET    /api/transfers/sent          - Get sent transfers
GET    /api/transfers/stats         - Get transfer statistics
GET    /api/transfers/:id           - Get transfer details
GET    /api/transfers/:id/download  - Download encrypted file
DELETE /api/transfers/:id           - Delete transfer
```

## WebSocket Events

### Client → Server

```javascript
socket.emit('user:online');
socket.emit('typing:start', { recipientId });
socket.emit('typing:stop', { recipientId });
socket.emit('transfer:check');
```

### Server → Client

```javascript
socket.on('newTransfer', (data) => {
  // New file received
});

socket.on('transferStatus', (data) => {
  // Transfer status updated
});

socket.on('user:status', (data) => {
  // User online/offline
});
```

## Installation

```bash
npm install
```

## Configuration

Create `.env` file:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/secure-file-transfer
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRE=7d
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173
MAX_FILE_SIZE=104857600
UPLOAD_PATH=./uploads
```

## Run

```bash
# Development
npm run dev

# Production
npm start
```

## Security

- Passwords hashed with bcrypt
- JWT authentication
- Rate limiting enabled
- Helmet.js security headers
- CORS configured
- Input validation
- File size limits
- **Server never sees private keys or unencrypted files**

## Database Models

### User
- username, email, password (hashed)
- publicKey, publicKeyFingerprint
- avatar, isActive, lastLogin

### Transfer
- sender, recipient (refs to User)
- originalFilename, encryptedFilename
- fileSize, mimeType
- encryptedAESKey, iv, signature
- status, downloadCount, expiresAt

### FileMetadata
- transfer (ref)
- checksum, checksumAlgorithm
- encryptionAlgorithm, keyEncryptionAlgorithm
- isChunked, totalChunks

## License

MIT