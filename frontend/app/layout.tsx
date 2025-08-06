import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Providers } from './providers';
import './globals.css';

const inter = Inter({ subsets: ['latin', 'cyrillic'] });

export const metadata: Metadata = {
  title: 'Digital Atlas - Цифровой атлас инновационной инфраструктуры',
  description: 'Интерактивная карта объектов инновационной инфраструктуры Казахстана',
  keywords: 'инновации, инфраструктура, Казахстан, технопарк, бизнес-инкубатор',
  authors: [{ name: 'Digital Atlas Team' }],
  viewport: 'width=device-width, initial-scale=1',
  themeColor: '#1976D2',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
      </head>
      <body className={inter.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
