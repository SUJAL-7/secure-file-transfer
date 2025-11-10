import dotenv from 'dotenv';

dotenv.config();

const config = {
  port: process.env.PORT || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  
  // Database
  mongodbUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/secure-file-transfer',
  
  // JWT
  jwtSecret: process.env.JWT_SECRET || 'fallback-secret-change-in-production',
  jwtExpire: process.env.JWT_EXPIRE || '7d',
  
  // CORS
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  
  // File Upload
  maxFileSize: parseInt(process.env.MAX_FILE_SIZE) || 104857600, // 100MB default
  uploadPath: process.env.UPLOAD_PATH || './uploads',
  
  // Rate Limiting
  rateLimitWindow: parseInt(process.env.RATE_LIMIT_WINDOW) || 15, // minutes
  rateLimitMax: parseInt(process.env.RATE_LIMIT_MAX) || 100,
  
  // Security
  bcryptRounds: 10,
};

// Validation
if (!config.jwtSecret || config.jwtSecret === 'fallback-secret-change-in-production') {
  if (config.nodeEnv === 'production') {
    console.error('❌ FATAL: JWT_SECRET must be set in production!');
    process.exit(1);
  } else {
    console.warn('⚠️  WARNING: Using default JWT_SECRET. Change for production!');
  }
}

export default config;