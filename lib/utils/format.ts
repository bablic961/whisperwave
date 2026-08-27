// lib/utils/format.ts - Formatting Utilities
export function formatPrice(amount: number, currency: string = 'RUB'): string {
  const symbols: Record<string, string> = {
    USD: '$',
    EUR: '€',
    RUB: '₽',
    GBP: '£',
    JPY: '¥',
  };

  const symbol = symbols[currency] || currency;

  return new Intl.NumberFormat('ru-RU', {
    style: 'decimal',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount) + ' ' + symbol;
}

export function formatNumber(number: number): string {
  return new Intl.NumberFormat('ru-RU').format(number);
}

export function formatBytes(bytes: number, decimals: number = 2): string {
  if (bytes === 0) return '0 Байт';

  const k = 1024;
  const sizes = ['Байт', 'КБ', 'МБ', 'ГБ', 'ТБ'];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(decimals)) + ' ' + sizes[i];
}

export function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;

  if (h > 0) {
    return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  }
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export function sanitizeInput(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export function escapeRegExp(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;
  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  let lastArgs: Parameters<T>;
  return function (this: any, ...args: Parameters<T>) {
    if (!inThrottle) {
      func.apply(this, lastArgs || args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    } else {
      lastArgs = args;
    }
  };
}

export function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

export function mergeDeep<T extends object>(target: T, ...sources: Partial<T>[]): T {
  if (!sources.length) return target;
  const source = sources.shift();

  if (source === undefined) return target;

  Object.keys(source).forEach((key) => {
    const targetValue = target[key as keyof T];
    const sourceValue = source[key as keyof T];

    if (isPlainObject(targetValue) && isPlainObject(sourceValue)) {
      target[key as keyof T] = mergeDeep(
        { ...targetValue },
        sourceValue
      ) as any;
    } else {
      target[key as keyof T] = sourceValue as any;
    }
  });

  return target;
}

function isPlainObject(obj: any): obj is object {
  return (
    obj &&
    typeof obj === 'object' &&
    !Array.isArray(obj) &&
    Object.prototype.toString.call(obj) === '[object Object]'
  );
}

export function getRandomId(prefix: string = ''): string {
  return prefix + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

export function generateColorFromId(id: string): string {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = id.charCodeAt(i) + ((hash << 5) - hash);
  }

  const hue = Math.abs(hash % 360);
  return `hsl(${hue}, 70%, 60%)`;
}

export function getInitials(name: string, maxChars: number = 2): string {
  const names = name.trim().split(' ');
  if (names.length === 0) return '';
  if (names.length === 1) return names[0].substring(0, maxChars).toUpperCase();

  const first = names[0].charAt(0);
  const last = names[names.length - 1].charAt(0);

  return (first + last).toUpperCase().substring(0, maxChars);
}

export function generatePassword(length: number = 12): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function isValidPassword(password: string): { valid: boolean; message?: string } {
  if (password.length < 8) {
    return { valid: false, message: 'Пароль должен содержать минимум 8 символов' };
  }
  if (!/[A-Z]/.test(password)) {
    return { valid: false, message: 'Пароль должен содержать хотя бы одну заглавную букву' };
  }
  if (!/[a-z]/.test(password)) {
    return { valid: false, message: 'Пароль должен содержать хотя бы одну строчную букву' };
  }
  if (!/[0-9]/.test(password)) {
    return { valid: false, message: 'Пароль должен содержать хотя бы одну цифру' };
  }
  return { valid: true };
}

export function isValidUsername(username: string): { valid: boolean; message?: string } {
  if (username.length < 3) {
    return { valid: false, message: 'Имя пользователя должно содержать минимум 3 символа' };
  }
  if (username.length > 30) {
    return { valid: false, message: 'Имя пользователя не должно превышать 30 символов' };
  }
  if (!/^[a-zA-Z0-9_-]+$/.test(username)) {
    return { valid: false, message: 'Имя пользователя может содержать только латиницу, цифры, подчеркивания и дефисы' };
  }
  return { valid: true };
}
