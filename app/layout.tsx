import type { Metadata } from 'next';
import type { Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Letter Wall Signal',
  description: 'An interactive letter-wall prototype inspired by glowing holiday lights.',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  viewportFit: 'cover',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
