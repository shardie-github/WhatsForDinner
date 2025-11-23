import type { Metadata } from 'next';
import { Inter, Poppins, Playfair_Display } from 'next/font/google';
import { createComponentLogger } from '@whats-for-dinner/utils';

const logger = createComponentLogger('layout');
import './globals.css';
import PWAInstaller from '@/components/PWAInstaller';
import { ThemeProvider } from '@/components/ThemeProvider';
import { Analytics } from '@/components/Analytics';
import { CapacitorInit } from '@/components/CapacitorInit';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { CoreWebVitals } from '@/components/CoreWebVitals';
import { PerformanceDashboard } from '@/components/PerformanceDashboard';
import { ThemeToggle } from '@/components/ThemeToggle';
import { GDPRConsent } from '@/components/GDPRConsent';
import { PrivacyHUD } from '@/components/privacy/PrivacyHUD';
import { LiveRegion, SkipToMainContent } from '@/lib/accessibility';
import { Toaster } from "@/components/ui/toaster";
import { ToastProvider } from "@/components/ui/toast";
import { ConsentProvider } from '@/app/providers/consent-provider';
import { WebsiteStructuredData, OrganizationStructuredData } from '@/components/StructuredData';
import dynamic from 'next/dynamic';
import { TrustFooterLinks } from '@/components/TrustFooterLinks';

// Lazy load integrations
const IntegrationsLoader = dynamic(
  () => import('@/components/integrations').then((mod) => ({ default: mod.IntegrationsLoader })),
  { ssr: false }
);

// Lazy load agent suggestions drawer (privacy-gated, client-only)
const SuggestionsDrawer = dynamic(
  () => import('@/components/agent/SuggestionsDrawer').then((mod) => ({ default: mod.default })),
  { ssr: false }
);

// Phase 2: Initialize intelligent prefetching
if (typeof window !== 'undefined') {
  import('@/lib/performance/prefetch').then(({ intelligentPrefetcher }) => {
    intelligentPrefetcher.setupLinkPrefetching();
  });
}

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' });
const poppins = Poppins({ 
  subsets: ['latin'], 
  weight: ['400', '500', '600', '700'],
  variable: '--font-display' 
});
const playfair = Playfair_Display({ 
  subsets: ['latin'], 
  variable: '--font-serif' 
});

export const metadata: Metadata = {
  title: {
    default: "What's for Dinner? - AI Meal Planning from Your Pantry",
    template: "%s | What's for Dinner?",
  },
  description:
    'Get AI-powered meal suggestions in 30 seconds based on ingredients you already have. Stop wasting food, save time, and reduce decision fatigue. Free meal planning app.',
  keywords: [
    'meal planning',
    'recipe generator',
    'pantry cooking',
    'meal prep',
    'food waste reduction',
    'quick dinner ideas',
    'AI recipes',
    'pantry staples recipes',
    'meal planning app',
    'recipe suggestions',
  ],
  authors: [{ name: "What's for Dinner?" }],
  creator: "What's for Dinner?",
  publisher: "What's for Dinner?",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://whatsfordinner.com',
    siteName: "What's for Dinner?",
    title: "What's for Dinner? - AI Meal Planning from Your Pantry",
    description: 'Get AI-powered meal suggestions in 30 seconds based on ingredients you already have.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: "What's for Dinner? - AI Meal Planning",
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: "What's for Dinner? - AI Meal Planning",
    description: 'Get AI-powered meal suggestions in 30 seconds based on ingredients you already have.',
    images: ['/og-image.png'],
    creator: '@whatsfordinner',
  },
  manifest: '/manifest.json',
  themeColor: '#10B981',
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 5,
    userScalable: true,
    viewportFit: 'cover',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: "What's for Dinner?",
  },
  icons: {
    icon: [
      { url: '/icon-192x192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icon-512x512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [
      { url: '/icon-192x192.png', sizes: '192x192', type: 'image/png' },
    ],
  },
  formatDetection: {
    telephone: false,
  },
  mobileWebApp: {
    capable: true,
    statusBarStyle: 'default',
  },
  alternates: {
    canonical: 'https://whatsfordinner.com',
  },
  category: 'Food & Cooking',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // [STAKE+TRUST:BEGIN:i18n_attributes]
  // TODO: Replace with actual i18n locale detection
  const locale = "en"; // Future: Get from i18n system or user preference
  const direction = "ltr"; // Future: Support RTL languages (ar, he, fa, ur)
  // [STAKE+TRUST:END:i18n_attributes]
  
  return (
    <html lang={locale} dir={direction}>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  // Try enhanced SW first, fallback to default
                  navigator.serviceWorker.register('/sw-enhanced.js')
                    .then(function(registration) {
                      logger.info('Enhanced SW registered: ', { registration });
                    })
                    .catch(function() {
                      // Fallback to default SW if enhanced doesn't exist
                      navigator.serviceWorker.register('/sw.js')
                        .then(function(registration) {
                          logger.info('SW registered: ', { registration });
                        })
                        .catch(function(registrationError) {
                          logger.info('SW registration failed: ', { registrationError });
                        });
                    });
                });
              }
            `,
          }}
        />
        {/* [STAKE+TRUST:BEGIN:reduced_motion] */}
        <style dangerouslySetInnerHTML={{
          __html: `
            @media (prefers-reduced-motion: reduce) {
              *,
              *::before,
              *::after {
                animation-duration: 0.01ms !important;
                animation-iteration-count: 1 !important;
                transition-duration: 0.01ms !important;
                scroll-behavior: auto !important;
              }
            }
          `
        }} />
        {/* [STAKE+TRUST:END:reduced_motion] */}
      </head>
      <body className={`${inter.variable} ${poppins.variable} ${playfair.variable} font-sans antialiased`}>
        <SkipToMainContent />
        <LiveRegion />
        <ErrorBoundary>
          <ConsentProvider>
            <ThemeProvider>
              <div className="min-h-screen bg-background text-foreground safe-area-inset">
              <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 safe-area-inset-top">
                <div className="container flex h-14 sm:h-16 items-center justify-between px-4 sm:px-6">
                  <div className="flex items-center space-x-2">
                    <span className="text-xl sm:text-2xl">🥘</span>
                    <h1 className="text-lg sm:text-xl font-display font-bold text-brand-600">
                      What's for Dinner?
                    </h1>
                  </div>
                  <div className="flex items-center space-x-2 sm:space-x-4">
                    <ThemeToggle />
                  </div>
                </div>
              </header>
              <main id="main-content" className="flex-1 pb-safe-area-inset-bottom">
                {children}
              </main>
              <footer className="border-t bg-background safe-area-inset-bottom">
                <div className="container flex flex-col items-center justify-between gap-4 py-4 sm:py-6 px-4 sm:px-6 md:h-24 md:flex-row md:py-0">
                  <div className="flex flex-col items-center gap-3 sm:gap-4 px-4 sm:px-8 md:flex-row md:gap-2 md:px-0">
                    <p className="text-center text-xs sm:text-sm leading-loose text-muted-foreground md:text-left">
                      © 2025 Hardonia Labs. All rights reserved.
                    </p>
                    <div className="flex flex-wrap justify-center gap-3 sm:gap-4 text-xs sm:text-sm">
                      {/* [STAKE+TRUST:BEGIN:footer_trust_links] */}
                      <TrustFooterLinks />
                      {/* [STAKE+TRUST:END:footer_trust_links] */}
                      <a href="/support" className="text-muted-foreground hover:text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded px-1">
                        Support
                      </a>
                      <a href="/status" className="text-muted-foreground hover:text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded px-1">
                        Status
                      </a>
                      <a href="/terms-of-service" className="text-muted-foreground hover:text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded px-1">
                        Terms
                      </a>
                      <a href="/privacy-policy" className="text-muted-foreground hover:text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded px-1">
                        Privacy
                      </a>
                    </div>
                  </div>
                </div>
              </footer>
            </div>
            </ThemeProvider>
            <PWAInstaller />
            <Analytics />
            <CapacitorInit />
            <CoreWebVitals />
            <PerformanceDashboard compact />
            <GDPRConsent />
            <PrivacyHUD />
            <WebsiteStructuredData />
            <OrganizationStructuredData />
            <IntegrationsLoader />
            {/* Agent Suggestions: show drawer site-wide when enabled and consent granted */}
            <SuggestionsDrawer />
            <ToastProvider>
              <Toaster />
            </ToastProvider>
          </ConsentProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
