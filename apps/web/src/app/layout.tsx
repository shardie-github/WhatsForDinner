import type { Metadata } from 'next';
import { Inter, Poppins, Playfair_Display } from 'next/font/google';
import './globals.css';
import PWAInstaller from '@/components/PWAInstaller';
import { ThemeProvider } from '@/components/ThemeProvider';
import { Analytics } from '@/components/Analytics';
import { CapacitorInit } from '@/components/CapacitorInit';

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
  title: "What's for Dinner?",
  description:
    'AI-powered meal suggestions based on your pantry and preferences',
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
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  // Try enhanced SW first, fallback to default
                  navigator.serviceWorker.register('/sw-enhanced.js')
                    .then(function(registration) {
                      console.log('Enhanced SW registered: ', registration);
                    })
                    .catch(function() {
                      // Fallback to default SW if enhanced doesn't exist
                      navigator.serviceWorker.register('/sw.js')
                        .then(function(registration) {
                          console.log('SW registered: ', registration);
                        })
                        .catch(function(registrationError) {
                          console.log('SW registration failed: ', registrationError);
                        });
                    });
                });
              }
            `,
          }}
        />
      </head>
      <body className={`${inter.variable} ${poppins.variable} ${playfair.variable} font-sans antialiased`}>
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
            <main className="flex-1 pb-safe-area-inset-bottom">
              {children}
            </main>
            <footer className="border-t bg-background safe-area-inset-bottom">
              <div className="container flex flex-col items-center justify-between gap-4 py-4 sm:py-6 px-4 sm:px-6 md:h-24 md:flex-row md:py-0">
                <div className="flex flex-col items-center gap-3 sm:gap-4 px-4 sm:px-8 md:flex-row md:gap-2 md:px-0">
                  <p className="text-center text-xs sm:text-sm leading-loose text-muted-foreground md:text-left">
                    © 2025 Hardonia Labs. All rights reserved.
                  </p>
                  <div className="flex flex-wrap justify-center gap-3 sm:gap-4 text-xs sm:text-sm">
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
      </body>
    </html>
  );
}
