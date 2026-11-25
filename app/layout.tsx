import type { Metadata, Viewport } from 'next';
import { DataProvider } from '@/lib/store';
import './globals.css';

export const metadata: Metadata = {
  title: 'استیلا | کافه و دیسکو',
  description: 'منوی دیجیتال کافه و دیسکو استیلا — سفارش خود را بسازید و به گارسون نشان دهید.',
};

export const viewport: Viewport = {
  themeColor: '#0c0a10',
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fa" dir="rtl">
      <head>
        <link rel="preload" href="/fonts/PeydaWebVF.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
      </head>
      <body className="font-sans antialiased">
        <DataProvider>{children}</DataProvider>
      </body>
    </html>
  );
}
