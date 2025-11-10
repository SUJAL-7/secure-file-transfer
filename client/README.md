# Secure File Transfer - Client

React frontend with client-side encryption for secure file transfer.

## Features

- ✅ **100% Client-Side Encryption**: All encryption happens in browser
- ✅ **Web Crypto API**: Native browser cryptography
- ✅ **IndexedDB Storage**: Secure private key storage
- ✅ **Web Workers**: Non-blocking encryption for large files
- ✅ **Real-time Updates**: WebSocket notifications
- ✅ **Modern UI**: Tailwind CSS with responsive design

## Tech Stack

- **React 18**: UI framework
- **Vite**: Build tool and dev server
- **React Router**: Client-side routing
- **Axios**: HTTP client
- **Socket.io**: WebSocket client
- **IDB**: IndexedDB wrapper
- **Tailwind CSS**: Utility-first CSS
- **Lucide React**: Icon library
- **React Hot Toast**: Toast notifications

## Installation

```bash
npm install
```

## Configuration

Create `.env` file:

```env
VITE_API_URL=http://localhost:5000/api
VITE_WS_URL=http://localhost:5000
VITE_MAX_FILE_SIZE=104857600
```

## Development

```bash
npm run dev
```

Open http://localhost:5173

## Build

```bash
npm run build
```

Output in `dist/` folder

## Project Structure

```
src/
├── api/              # API clients
├── components/       # React components
│   ├── common/      # Reusable components
│   ├── auth/        # Authentication components
│   ├── crypto/      # Crypto-related components
│   ├── transfer/    # File transfer components
│   └── layout/      # Layout components
├── context/         # React context providers
├── crypto/          # Encryption/decryption logic
├── db/              # IndexedDB utilities
├── hooks/           # Custom React hooks
├── pages/           # Page components
├── services/        # Business logic services
├── utils/           # Helper utilities
├── workers/         # Web Workers
├── App.jsx          # Main app component
└── main.jsx         # Entry point
```

## Key Features

### Encryption

All encryption uses Web Crypto API:
- **RSA-OAEP-4096**: Asymmetric encryption
- **AES-GCM-256**: Symmetric encryption
- **PBKDF2**: Password-based key derivation

### Key Management

- Generated in browser
- Private key encrypted with user password
- Stored in IndexedDB
- Exportable for backup

### File Transfer Flow

1. Select file and recipient
2. Fetch recipient's public key
3. Encrypt file with AES-256
4. Encrypt AES key with RSA
5. Upload encrypted blob
6. Recipient downloads and decrypts

## Browser Support

Requires modern browsers with:
- Web Crypto API
- IndexedDB
- Web Workers
- ES6+ JavaScript

## Security Notes

- ✅ Private keys never sent to server
- ✅ Files encrypted before upload
- ✅ Server cannot decrypt files
- ✅ Password-protected key storage
- ⚠️ Requires HTTPS in production

## License

MIT