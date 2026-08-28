// app/layout.tsx - Root Layout
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from '@/components/providers/ThemeProvider';
import { AuthProvider } from '@/components/providers/AuthProvider';
import { NotificationProvider } from '@/components/shared/NotificationProvider';

const inter = Inter({ subsets: ['latin', 'cyrillic'] });

export const metadata: Metadata = {
  title: 'WhisperWave - Secure Messaging',
  description: 'Цифровой океан общения. Защитите свои сообщения с WhisperWave.',
  keywords: 'мессенджер, чат, общение, безопасность, энд-кенд',
  authors: [{ name: 'WhisperWave Team' }],
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-touch-icon.png',
    other: {
      rel: 'mask-icon',
      url: '/safari-pinned-tab.svg',
      color: '#7C3AED',
    },
  },
  openGraph: {
    type: 'website',
    locale: 'ru_RU',
    title: 'WhisperWave - Secure Messaging',
    description: 'Цифровой океан общения',
    images: [
      {
        url: '/opengraph-image.png',
        width: 1200,
        height: 630,
        alt: 'WhisperWave',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'WhisperWave - Secure Messaging',
    description: 'Цифровой океан общения',
  },
  manifest: '/manifest.json',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider>
          <AuthProvider>
            <NotificationProvider>{children}</NotificationProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
