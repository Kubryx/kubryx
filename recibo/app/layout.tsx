import type { Metadata } from 'next';
import Providers from '@/components/Providers';
import EcosystemWrapper from '@/components/EcosystemWrapper';
import { Plus_Jakarta_Sans, JetBrains_Mono } from 'next/font/google';
import { Toaster } from 'sonner';
import './globals.css';

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-jakarta',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
});

export const metadata: Metadata = {
  title: 'Recibo — AI-Powered Payments for LATAM',
  description: 'Get Paid in USDC, Instantly. No banks, no 8% fees.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${plusJakarta.variable} ${jetbrainsMono.variable} antialiased`}>
        <Providers>
          <EcosystemWrapper />
          {children}
          <Toaster
            toastOptions={{
              style: {
                background: '#ffffff',
                border: '1px solid #E5E7EB',
                color: '#0A0F2E',
                fontFamily: 'var(--font-jakarta)'
              },
            }} 
          />
        </Providers>
      </body>
    </html>
  );
}
