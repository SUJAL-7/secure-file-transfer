# 🔐 Secure File Transfer System

A full-stack end-to-end encrypted file transfer application that allows users to securely send and receive files using RSA-4096 and AES-256-GCM encryption.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Node](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)
![React](https://img.shields.io/badge/react-18.2.0-blue.svg)

## 📋 Table of Contents

- [Features](#-features)
- [Security Architecture](#-security-architecture)
- [Tech Stack](#-tech-stack)
- [Prerequisites](#-prerequisites)
- [Installation](#-installation)
- [Configuration](#-configuration)
- [Running the Application](#-running-the-application)
- [Project Structure](#-project-structure)
- [API Documentation](#-api-documentation)
- [Usage Guide](#-usage-guide)
- [Security Best Practices](#-security-best-practices)
- [Troubleshooting](#-troubleshooting)
- [Contributing](#-contributing)
- [License](#-license)

## ✨ Features

### 🔒 Security Features
- **End-to-End Encryption**: Files are encrypted on the client-side before upload
- **Hybrid Encryption**: RSA-4096 for key exchange, AES-256-GCM for file encryption
- **Zero-Knowledge Architecture**: Server never has access to unencrypted files or private keys
- **Private Key Management**: Users keep their private keys - never stored on server or browser
- **Secure Key Generation**: Client-side cryptographic key generation using Web Crypto API

### 📁 File Transfer Features
- **Encrypted File Upload**: Files encrypted before leaving your device
- **Secure File Download**: Files decrypted only with the correct private key
- **File Size Support**: Up to 50MB per file (configurable)
- **Transfer Expiration**: Auto-delete files after 7 days (configurable)
- **Transfer History**: Track sent and received files
- **Real-time Notifications**: WebSocket notifications for new file transfers
- **File Type Support**: All file types supported (encrypted as binary)

### 👤 User Features
- **User Authentication**: JWT-based secure authentication
- **User Search**: Find and send files to other users
- **Profile Management**: View and manage encryption keys
- **Dashboard**: Overview of all transfers and statistics

## 🏗️ Security Architecture

### Encryption Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                         SENDER SIDE                              │
├─────────────────────────────────────────────────────────────────┤
│ 1. User selects file                                             │
│ 2. Generate random AES-256 key                                   │
│ 3. Encrypt file with AES-256-GCM                                 │
│ 4. Fetch recipient's RSA public key from server                  │
│ 5. Encrypt AES key with recipient's RSA-4096 public key          │
│ 6. Upload: [Encrypted File + Encrypted AES Key + IV]             │
└─────────────────────────────────────────────────────────────────┘
                                ↓
┌─────────────────────────────────────────────────────────────────┐
│                         SERVER SIDE                              │
├─────────────────────────────────────────────────────────────────┤
│ • Stores encrypted file on disk                                  │
│ • Stores encrypted AES key and IV in database                    │
│ • Never has access to unencrypted data                           │
│ • Cannot decrypt files (no private keys)                         │
└─────────────────────────────────────────────────────────────────┘
                                ↓
┌─────────────────────────────────────────────────────────────────┐
│                       RECIPIENT SIDE                             │
├─────────────────────────────────────────────────────────────────┤
│ 1. User imports their private key PEM file                       │
│ 2. Download encrypted file from server                           │
│ 3. Decrypt AES key using RSA-4096 private key                    │
│ 4. Decrypt file using AES-256-GCM with decrypted key             │
│ 5. Save decrypted file to user's device                          │
│ 6. Clear private key from memory                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Key Management

- **Public Keys**: Stored on server, used by others to encrypt files
- **Private Keys**: Downloaded by user, never stored anywhere except user's secure location
- **Key Format**: RSA-4096 keys in PEM format
- **Key Usage**: Import private key only when decrypting files

## 🛠️ Tech Stack

### Frontend
- **React 18** - UI library
- **React Router** - Client-side routing
- **Axios** - HTTP client
- **Socket.io Client** - Real-time communication
- **Tailwind CSS** - Styling
- **Web Crypto API** - Browser cryptography
- **IndexedDB** - Client-side storage (for public keys only)
- **Lucide React** - Icons
- **React Hot Toast** - Notifications
- **Vite** - Build tool

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **Socket.io** - Real-time communication
- **Multer** - File upload handling
- **Helmet** - Security headers
- **express-mongo-sanitize** - NoSQL injection prevention
- **express-rate-limit** - Rate limiting

## 📦 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js**: >= 18.0.0
- **npm**: >= 9.0.0
- **MongoDB**: >= 6.0.0 (local or cloud instance)
- **Modern Browser**: Chrome, Firefox, Safari, or Edge (with Web Crypto API support)

## 🚀 Installation

### 1. Clone the Repository

```bash
git clone https://github.com/SUJAL-7/secure-file-transfer.git
cd secure-file-transfer
```

### 2. Install Server Dependencies

```bash
cd server
npm install
```

### 3. Install Client Dependencies

```bash
cd ../client
npm install
```

## ⚙️ Configuration

### Server Configuration

Create a `.env` file in the `server` directory:

```env
# Server Configuration
NODE_ENV=development
PORT=5000

# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/secure-file-transfer

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRE=7d

# CORS Configuration
CORS_ORIGIN=http://localhost:5173

# File Upload Configuration
MAX_FILE_SIZE=52428800
UPLOAD_PATH=./uploads

# Security
BCRYPT_ROUNDS=12
```

**Important**: Change `JWT_SECRET` to a strong, random string in production!

### Client Configuration

The client is configured in `client/vite.config.js`. Update the proxy settings if your server runs on a different port:

```javascript
export default defineConfig({
  // ...
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
      '/socket.io': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        ws: true,
      },
    },
  },
});
```

### MongoDB Setup

#### Option 1: Local MongoDB

Install MongoDB locally and ensure it's running:

```bash
# Start MongoDB service
# On macOS (with Homebrew)
brew services start mongodb-community

# On Linux (systemd)
sudo systemctl start mongod

# On Windows
# Start MongoDB service from Services app
```

#### Option 2: MongoDB Atlas (Cloud)

1. Create a free account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a new cluster
3. Get your connection string
4. Update `MONGODB_URI` in `.env`:

```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/secure-file-transfer?retryWrites=true&w=majority
```

## 🎯 Running the Application

### Development Mode

#### 1. Start the Server

```bash
cd server
npm run dev
```

The server will start on `http://localhost:5000`

You should see:
```
✅ MongoDB Connected
╔════════════════════════════════════════════════════════════════╗
║                                                                ║
║   🔐 Secure File Transfer Server                               ║
║                                                                ║
║   Server running on port: 5000                                 ║
║   Environment: development                                     ║
║   CORS Origin: http://localhost:5173                           ║
║                                                                ║
╚════════════════════════════════════════════════════════════════╝
```

#### 2. Start the Client

In a new terminal:

```bash
cd client
npm run dev
```

The client will start on `http://localhost:5173`

#### 3. Access the Application

Open your browser and navigate to: `http://localhost:5173`

## 📁 Project Structure

```
secure-file-transfer/
├── client/                          # Frontend React application
│   ├── public/                      # Static assets
│   ├── src/
│   │   ├── api/                     # API client functions
│   │   ├── components/              # React components
│   │   ├── context/                 # React Context
│   │   ├── crypto/                  # Cryptography functions
│   │   ├── db/                      # IndexedDB utilities
│   │   ├── hooks/                   # Custom React hooks
│   │   ├── pages/                   # Page components
│   │   ├── services/                # Service layer
│   │   ├── utils/                   # Utility functions
│   │   └── main.jsx                 # Entry point
│   └── package.json
│
├── server/                          # Backend Node.js application
│   ├── src/
│   │   ├── config/                  # Configuration files
│   │   ├── controllers/             # Route controllers
│   │   ├── middleware/              # Express middleware
│   │   ├── models/                  # MongoDB models
│   │   ├── routes/                  # API routes
│   │   ├── websocket/               # WebSocket handlers
│   │   └── server.js                # Server entry point
│   ├── uploads/                     # Uploaded encrypted files
│   └── package.json
│
└── README.md
```

## 📡 API Documentation

### Authentication Endpoints

#### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "username": "johndoe",
  "email": "john@example.com",
  "password": "SecurePass123!",
  "publicKey": "-----BEGIN PUBLIC KEY-----\n...\n-----END PUBLIC KEY-----"
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "SecurePass123!"
}
```

### Transfer Endpoints

#### Initiate Transfer
```http
POST /api/transfers/initiate
Authorization: Bearer {token}
Content-Type: application/json

{
  "recipientId": "recipient_user_id",
  "originalFilename": "document.pdf",
  "fileSize": 1024000,
  "encryptedAESKey": "base64_encrypted_aes_key",
  "iv": "base64_iv"
}
```

#### Upload Encrypted File
```http
POST /api/transfers/:id/upload
Authorization: Bearer {token}
Content-Type: multipart/form-data

file: [encrypted file binary]
```

#### Download Encrypted File
```http
GET /api/transfers/:id/download
Authorization: Bearer {token}
```

## 📚 Usage Guide

### 1. User Registration

1. Navigate to the application URL
2. Click "Register" or "Sign Up"
3. Fill in username, email, and password
4. Click "Create Account"

### 2. Key Generation

After registration, you'll be prompted to generate encryption keys:

1. Click "Generate Key Pair"
2. Enter a password for verification
3. **IMPORTANT**: Download your private key immediately
4. Store the private key file securely

**⚠️ Critical**: Your private key will NOT be stored anywhere. If you lose it, you cannot decrypt files sent to you!

### 3. Sending a File

1. Click "Send File" from the dashboard
2. Search for the recipient by username
3. Select the recipient from search results
4. Choose a file to upload
5. Click "Encrypt & Send"

### 4. Receiving a File

1. Go to "Received Files"
2. Click "Download" on the file
3. Import your private key (browse file or paste)
4. Click "Import & Decrypt"
5. File is automatically decrypted and downloaded

## 🔐 Security Best Practices

### For Users

1. **Private Key Storage**
   - Store in a password manager
   - Keep encrypted backups
   - Never share with anyone

2. **Password Security**
   - Use strong, unique passwords
   - Consider using a password manager

3. **File Security**
   - Only send files to trusted recipients
   - Delete sensitive transfers after download
   - Be aware of file expiration times

### For Administrators

1. **Server Security**
   - Use strong JWT secrets
   - Enable HTTPS with valid SSL certificates
   - Keep dependencies updated
   - Implement firewall rules

2. **Database Security**
   - Use MongoDB authentication
   - Regular backups
   - Enable encryption at rest

## 🐛 Troubleshooting

### MongoDB Connection Failed

**Error**: `MongooseError: connect ECONNREFUSED`

**Solutions**:
1. Check if MongoDB is running
2. Verify MongoDB URI in `.env`
3. Check MongoDB port (default: 27017)

### File Upload Fails

**Error**: `PayloadTooLargeError`

**Solutions**:
1. Check `MAX_FILE_SIZE` in `.env`
2. Verify file size is within limit

### Decryption Fails

**Error**: `Invalid private key`

**Possible Causes**:
1. Wrong private key
2. Corrupted file
3. File sent to different user

**Solutions**:
1. Verify correct private key
2. Try re-downloading the file
3. Check browser console for errors

## 🤝 Contributing

Contributions are welcome! Please follow these guidelines:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

### Areas for Contribution

- Unit and integration tests
- Two-factor authentication (2FA)
- File compression
- Multi-recipient transfers
- Dark mode
- Mobile app
- Email notifications

## 📄 License

This project is licensed under the MIT License.

```
MIT License

Copyright (c) 2025 SUJAL-7

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

## 🙏 Acknowledgments

- Web Crypto API for browser-based cryptography
- MongoDB for database
- Express.js for backend framework
- React for frontend framework
- Tailwind CSS for styling

## 📞 Support

For questions, issues, or feature requests:

- **GitHub Issues**: [Open an issue](https://github.com/SUJAL-7/secure-file-transfer/issues)

---

**Built with ❤️ by SUJAL-7**

**⭐ Star this repo if you find it useful!**

**🔐 Remember: Your security is in your hands. Keep your private keys safe!**"# secure-file-transfer" 
