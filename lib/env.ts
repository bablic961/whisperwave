// lib/env.ts - Environment variable validation
const env = {
  // Database
  DATABASE_URL: process.env.DATABASE_URL || '',

  // JWT
  JWT_SECRET: process.env.JWT_SECRET || '',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
  REFRESH_TOKEN_EXPIRES_IN: process.env.REFRESH_TOKEN_EXPIRES_IN || '30d',

  // App
  NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  NEXT_PUBLIC_APP_NAME: process.env.NEXT_PUBLIC_APP_NAME || 'WhisperWave',
  NEXT_PUBLIC_APP_URL_PROD: process.env.NEXT_PUBLIC_APP_URL_PROD || 'http://localhost:3000',

  // Redis
  REDIS_URL: process.env.REDIS_URL || '',

  // Cloudinary
  CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME || '',
  CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY || '',
  CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET || '',

  // Email (SMTP)
  SMTP_HOST: process.env.SMTP_HOST || '',
  SMTP_PORT: parseInt(process.env.SMTP_PORT || '587'),
  SMTP_USER: process.env.SMTP_USER || '',
  SMTP_PASS: process.env.SMTP_PASS || '',
  SMTP_FROM: process.env.SMTP_FROM || '',

  // Socket.io
  SOCKETIO_CORS_ORIGIN: process.env.SOCKETIO_CORS_ORIGIN || '*',

  // Encryption
  ENCRYPTION_KEY: process.env.ENCRYPTION_KEY || '',

  // Rate Limiting
  RATE_LIMIT_WINDOW_MS: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'),
  RATE_LIMIT_MAX_REQUESTS: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'),

  // Upload
  MAX_FILE_SIZE: parseInt(process.env.MAX_FILE_SIZE || '52428800'),
  MAX_IMAGE_SIZE: parseInt(process.env.MAX_IMAGE_SIZE || '10485760'),
  ALLOWED_IMAGE_TYPES: process.env.ALLOWED_IMAGE_TYPES || 'image/jpeg,image/png,image/gif,image/webp',
};

// Validation
const requiredEnvVars = [
  'DATABASE_URL',
  'JWT_SECRET',
];

const missingEnvVars = requiredEnvVars.filter((key) => !env[key as keyof typeof env]);

if (missingEnvVars.length > 0) {
  console.error('Missing required environment variables:', missingEnvVars.join(', '));
}

export { env };
