// frontend/src/app/layout.tsx

import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';

const inter = Inter({ subsets: ['latin', 'cyrillic'] });

export const metadata: Metadata = {
  title: 'Цифровой атлас инновационной инфраструктуры',
  description: 'Интерактивная карта объектов инновационной инфраструктуры Казахстана',
  keywords: 'инновации, технопарк, бизнес-инкубатор, IT-хаб, Казахстан',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru">
      <body className={inter.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}