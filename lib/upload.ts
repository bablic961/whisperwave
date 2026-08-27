// lib/upload.ts - File Upload Utilities
import { NextRequest } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';
import { promises as fs } from 'fs';
import path from 'path';
import { tmpdir } from 'os';
import crypto from 'crypto';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const MAX_FILE_SIZE = parseInt(process.env.MAX_FILE_SIZE || '52428800'); // 50MB
export const MAX_IMAGE_SIZE = parseInt(process.env.MAX_IMAGE_SIZE || '10485760'); // 10MB
export const ALLOWED_IMAGE_TYPES = process.env.ALLOWED_IMAGE_TYPES?.split(',') || [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
];

export interface UploadResult {
  url: string;
  secureUrl: string;
  publicId: string;
  format: string;
  width?: number;
  height?: number;
  size?: number;
  resourceType: string;
}

export interface UploadError {
  code: string;
  message: string;
}

export async function validateFile(
  file: File | { size: number; type: string }
): Promise<UploadError | null> {
  if (file.size > MAX_FILE_SIZE) {
    return {
      code: 'FILE_TOO_LARGE',
      message: `File size exceeds ${MAX_FILE_SIZE / 1024 / 1024}MB limit`,
    };
  }

  return null;
}

export async function validateImage(
  file: File | { size: number; type: string }
): Promise<UploadError | null> {
  const validationError = await validateFile(file);
  if (validationError) return validationError;

  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    return {
      code: 'INVALID_IMAGE_TYPE',
      message: `Invalid image type. Allowed: ${ALLOWED_IMAGE_TYPES.join(', ')}`,
    };
  }

  if (file.size > MAX_IMAGE_SIZE) {
    return {
      code: 'IMAGE_TOO_LARGE',
      message: `Image size exceeds ${MAX_IMAGE_SIZE / 1024 / 1024}MB limit`,
    };
  }

  return null;
}

export async function uploadToCloudinary(
  filePath: string,
  options: { folder?: string; type?: 'image' | 'video' | 'raw' } = {}
): Promise<UploadResult> {
  const { folder = 'whisperwave', type = 'image' } = options;

  const result = await cloudinary.uploader.upload(filePath, {
    folder,
    resource_type: type,
    use_filename: true,
    unique_filename: true,
    overwrite: false,
  });

  return {
    url: result.secure_url,
    secureUrl: result.secure_url,
    publicId: result.public_id,
    format: result.format,
    width: result.width,
    height: result.height,
    size: result.bytes,
    resourceType: result.resource_type,
  };
}

export async function uploadFileFromFormData(
  request: NextRequest,
  options: { folder?: string; type?: 'image' | 'video' | 'raw' | 'auto' } = {}
): Promise<{ result: UploadResult } | { error: UploadError }> {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return { error: { code: 'NO_FILE', message: 'No file provided' } };
    }

    const type = options.type || 'auto';
    let error: UploadError | null = null;

    if (type === 'image' || type === 'auto') {
      error = await validateImage(file);
    } else if (type === 'video' || type === 'raw') {
      error = await validateFile(file);
    }

    if (error) {
      return { error };
    }

    // Create temp file
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const tempPath = path.join(tmpdir(), file.name);

    await fs.writeFile(tempPath, buffer);

    try {
      const result = await uploadToCloudinary(tempPath, {
        folder: options.folder,
        type: type === 'auto' ? 'image' : (type as 'image' | 'video' | 'raw'),
      });
      return { result };
    } finally {
      await fs.unlink(tempPath).catch(() => {});
    }
  } catch (error) {
    console.error('Upload error:', error);
    return {
      error: {
        code: 'UPLOAD_FAILED',
        message: 'Failed to upload file',
      },
    };
  }
}

export async function deleteFromCloudinary(publicId: string): Promise<boolean> {
  try {
    await cloudinary.uploader.destroy(publicId);
    return true;
  } catch (error) {
    console.error('Delete error:', error);
    return false;
  }
}

export function generateAvatarUrl(email: string, size: number = 200): string {
  const hash = crypto.createHash('md5').update(email.trim().toLowerCase()).digest('hex');
  return `https://www.gravatar.com/avatar/${hash}?d=mp&s=${size}`;
}
