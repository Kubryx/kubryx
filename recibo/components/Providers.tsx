'use client';

import { useEffect, useState } from 'react';
import { WagmiProvider } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RainbowKitProvider, darkTheme, type Locale } from '@rainbow-me/rainbowkit';
import { config } from '@/lib/wagmi';
import '@rainbow-me/rainbowkit/styles.css';

// Map the language chosen in the GoogleTranslate widget (stored in the
// `googtrans` cookie as `/en/<lang>`) to a RainbowKit locale so the
// Connect Wallet button + modal follow the same language as the page.
const SUPPORTED_LOCALES: Locale[] = ['en', 'es', 'pt'];

function getLocaleFromCookie(): Locale {
  if (typeof document === 'undefined') return 'en';
  const match = document.cookie.match(/(^|;) ?googtrans=([^;]*)(;|$)/);
  const target = match?.[2]?.split('/')[2];
  return (target && SUPPORTED_LOCALES.includes(target as Locale)) ? (target as Locale) : 'en';
}

export default function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: { queries: { retry: 2, staleTime: 10_000 } },
  }));

  // Start with 'en' for a stable SSR/first render, then sync to the cookie
  // on the client. Switching language reloads the page, so this stays in sync.
  const [locale, setLocale] = useState<Locale>('en');
  useEffect(() => {
    setLocale(getLocaleFromCookie());
  }, []);

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider
          theme={darkTheme({
            accentColor: '#C8FF00',
            accentColorForeground: '#000000',
            borderRadius: 'large',
            fontStack: 'system',
          })}
          locale={locale}
        >
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
