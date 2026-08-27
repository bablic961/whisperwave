// lib/utils/date.ts - Date Utilities
export function formatDate(date: Date | string, format: string = 'full'): string {
  const d = new Date(date);

  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  };

  switch (format) {
    case 'short':
      return new Intl.DateTimeFormat('ru-RU', {
        day: 'numeric',
        month: 'numeric',
        year: '2-digit',
      }).format(d);
    case 'time':
      return new Intl.DateTimeFormat('ru-RU', {
        hour: '2-digit',
        minute: '2-digit',
      }).format(d);
    case 'date':
      return new Intl.DateTimeFormat('ru-RU', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      }).format(d);
    case 'full':
    default:
      return new Intl.DateTimeFormat('ru-RU', options).format(d);
  }
}

export function formatTimeAgo(date: Date | string): string {
  const d = new Date(date);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);
  const diffWeeks = Math.floor(diffDays / 7);
  const diffMonths = Math.floor(diffDays / 30);
  const diffYears = Math.floor(diffDays / 365);

  if (diffSeconds < 60) {
    return 'только что';
  }
  if (diffMinutes < 60) {
    return `${diffMinutes} ${pluralize(diffMinutes, ['минуту', 'минуты', 'минут'])} назад`;
  }
  if (diffHours < 24) {
    return `${diffHours} ${pluralize(diffHours, ['час', 'часа', 'часов'])} назад`;
  }
  if (diffDays < 7) {
    return `${diffDays} ${pluralize(diffDays, ['день', 'дня', 'дней'])} назад`;
  }
  if (diffWeeks < 4) {
    return `${diffWeeks} ${pluralize(diffWeeks, ['неделю', 'недели', 'недель'])} назад`;
  }
  if (diffMonths < 12) {
    return `${diffMonths} ${pluralize(diffMonths, ['месяц', 'месяца', 'месяцев'])} назад`;
  }
  return `${diffYears} ${pluralize(diffYears, ['год', 'года', 'лет'])} назад`;
}

export function pluralize(count: number, forms: [string, string, string]): string {
  const formIndex = [1, 21, 31, 41, 51, 61, 71, 81, 91].includes(count) ? 0 :
                    [2, 3, 4, 22, 23, 24, 32, 33, 34, 42, 43, 44, 52, 53, 54, 62, 63, 64, 72, 73, 74, 82, 83, 84, 92, 93, 94].includes(count) ? 1 : 2;
  return forms[formIndex];
}

export function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

export function getFirstDayOfMonth(year: number, month: number): number {
  return new Date(year, month, 1).getDay();
}

export function isToday(date: Date | string): boolean {
  const d = new Date(date);
  const today = new Date();
  return d.getDate() === today.getDate() &&
         d.getMonth() === today.getMonth() &&
         d.getFullYear() === today.getFullYear();
}

export function isYesterday(date: Date | string): boolean {
  const d = new Date(date);
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return d.getDate() === yesterday.getDate() &&
         d.getMonth() === yesterday.getMonth() &&
         d.getFullYear() === yesterday.getFullYear();
}

export function areSameDay(date1: Date | string, date2: Date | string): boolean {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  return d1.getDate() === d2.getDate() &&
         d1.getMonth() === d2.getMonth() &&
         d1.getFullYear() === d2.getFullYear();
}

export function addDays(date: Date | string, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
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
