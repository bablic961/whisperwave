// lib/utils/file.ts - File Utilities
import path from 'path';

export function formatFileSize(bytes: number, decimals: number = 2): string {
  if (bytes === 0) return '0 B';

  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(decimals)) + ' ' + sizes[i];
}

export function getFileExtension(filename: string): string {
  return path.extname(filename).toLowerCase();
}

export function getFileNameWithoutExtension(filename: string): string {
  return path.basename(filename, path.extname(filename));
}

export function isValidImageFile(fileType: string): boolean {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];
  return allowedTypes.includes(fileType);
}

export function isValidVideoFile(fileType: string): boolean {
  const allowedTypes = ['video/mp4', 'video/webm', 'video/ogg', 'video/quicktime'];
  return allowedTypes.includes(fileType);
}

export function isValidAudioFile(fileType: string): boolean {
  const allowedTypes = ['audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/mp4', 'audio/webm'];
  return allowedTypes.includes(fileType);
}

export function isValidDocumentFile(fileType: string): boolean {
  const allowedTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'text/plain',
    'text/csv',
  ];
  return allowedTypes.includes(fileType);
}

export function getFileIcon(fileType: string, fileName: string): string {
  const extension = getFileExtension(fileName);

  if (isValidImageFile(fileType)) return 'image';
  if (isValidVideoFile(fileType)) return 'video';
  if (isValidAudioFile(fileType)) return 'audio';
  if (extension === '.pdf') return 'pdf';
  if (extension === '.doc' || extension === '.docx') return 'word';
  if (extension === '.xls' || extension === '.xlsx') return 'excel';
  if (extension === '.ppt' || extension === '.pptx') return 'powerpoint';
  if (extension === '.txt' || extension === '.csv') return 'text';
  if (extension === '.zip' || extension === '.rar' || extension === '.7z') return 'archive';

  return 'file';
}

export function generateUniqueFilename(originalName: string): string {
  const extension = getFileExtension(originalName);
  const basename = getFileNameWithoutExtension(originalName);
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);

  return `${basename}-${timestamp}-${random}${extension}`;
}

export function compressImageBase64(base64: string, maxWidth: number = 1920, maxHeight: number = 1080): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image();
    img.src = base64;

    img.onload = () => {
      const canvas = document.createElement('canvas');
      let width = img.width;
      let height = img.height;

      if (width > maxWidth) {
        height = Math.round((height * maxWidth) / width);
        width = maxWidth;
      }

      if (height > maxHeight) {
        width = Math.round((width * maxHeight) / height);
        height = maxHeight;
      }

      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      ctx?.drawImage(img, 0, 0, width, height);

      resolve(canvas.toDataURL('image/jpeg', 0.8));
    };
  });
}

export function validateFileExtension(fileName: string, allowedExtensions: string[]): boolean {
  const ext = getFileExtension(fileName).toLowerCase();
  return allowedExtensions.includes(ext);
}
