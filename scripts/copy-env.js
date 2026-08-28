// scripts/copy-env.js - Copy .env.local to .env for Vercel build
const fs = require('fs');
const path = require('path');

const envLocalPath = path.join(__dirname, '..', '.env.local');
const envPath = path.join(__dirname, '..', '.env');

try {
  if (fs.existsSync(envLocalPath)) {
    fs.copyFileSync(envLocalPath, envPath);
    console.log('✓ Copied .env.local to .env for Vercel build');
  } else {
    console.warn('⚠ .env.local not found');
  }
} catch (error) {
  console.error('Error copying env file:', error.message);
}
