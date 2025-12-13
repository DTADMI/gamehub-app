import './globals.css';

import {Analytics} from '@vercel/analytics/next';
import type {Metadata} from 'next';
import {Geist, Geist_Mono} from 'next/font/google';

import {Footer} from '@/components/Footer';
import {Header} from '@/components/Header';
import {Providers} from '@/components/Providers';

const _geist = Geist({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: 'GameHub',
  description: 'GameHub — Play my web games and explore my projects in one place.',
  icons: {
    icon: '/icon.svg',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`font-sans antialiased`}>
        <Providers>
          <Header />
          {children}
          <Footer />
          <Analytics />
        </Providers>
      </body>
    </html>
  );
}
