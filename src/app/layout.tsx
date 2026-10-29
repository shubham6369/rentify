import type { Metadata, Viewport } from 'next';
import { Plus_Jakarta_Sans } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { AuthModal } from '@/components/AuthModal';
import { NativeBackButtonHandler } from '@/components/NativeBackButtonHandler';


const fontSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
  weight: ['400', '500', '600', '700', '800'],
});

export const metadata: Metadata = {
  metadataBase: new URL('https://rentify-nine-roan.vercel.app'),
  title: 'Rentify | Your Room, Your Way',
  description:
    'Rentify - Your Room, Your Way. Complete multi-category accommodation platform for student hostels, family vacations, hourly day stays, and hotel bookings.',
  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: '/favicon.png', type: 'image/png' },
    ],
    apple: '/apple-touch-icon.png',
  },
  openGraph: {
    title: 'Rentify | Your Room, Your Way',
    description: 'Find your ideal stay: Student Hostels & PGs, Family Stays, Hourly Day Stays & Hotels.',
    url: 'https://rentify-nine-roan.vercel.app',
    siteName: 'Rentify',
    images: [
      {
        url: '/images/rentify-thumbnail.png',
        width: 1200,
        height: 630,
        alt: 'Rentify - Your Room, Your Way',
      },
    ],
    locale: 'en_IN',
    type: 'website',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`h-full ${fontSans.variable}`} suppressHydrationWarning>
      <body className="min-h-screen flex flex-col font-sans bg-slate-50/70 text-slate-900 antialiased selection:bg-indigo-600 selection:text-white" suppressHydrationWarning>
        <AuthProvider>
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
          <AuthModal />
          <NativeBackButtonHandler />
        </AuthProvider>
      </body>
    </html>
  );
}
