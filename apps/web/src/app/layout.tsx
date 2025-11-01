import type { Metadata } from 'next';
import { Inter, Poppins, Playfair_Display } from 'next/font/google';
import './globals.css';
import PWAInstaller from '@/components/PWAInstaller';
import { ThemeProvider } from '@/components/ThemeProvider';
import { Analytics } from '@/components/Analytics';

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
  viewport:
    'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: "What's for Dinner?",
  },
  icons: {
    icon: '/icon-192x192.png',
    apple: '/icon-192x192.png',
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
                  navigator.serviceWorker.register('/sw.js')
                    .then(function(registration) {
                      console.log('SW registered: ', registration);
                    })
                    .catch(function(registrationError) {
                      console.log('SW registration failed: ', registrationError);
                    });
                });
              }
            `,
          }}
        />
      </head>
      <body className={`${inter.variable} ${poppins.variable} ${playfair.variable} font-sans antialiased`}>
        <ThemeProvider>
          <div className="min-h-screen bg-background text-foreground">
            <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
              <div className="container flex h-16 items-center justify-between px-4">
                <div className="flex items-center space-x-2">
                  <span className="text-2xl">🥘</span>
                  <h1 className="text-xl font-display font-bold text-brand-600">
                    What's for Dinner?
                  </h1>
                </div>
                <div className="flex items-center space-x-4">
                  <ThemeToggle />
                </div>
              </div>
            </header>
            <main className="flex-1">
              {children}
            </main>
            <footer className="border-t bg-background">
              <div className="container flex flex-col items-center justify-between gap-4 py-6 px-4 md:h-24 md:flex-row md:py-0">
                <div className="flex flex-col items-center gap-4 px-8 md:flex-row md:gap-2 md:px-0">
                  <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
                    © 2025 Hardonia Labs. All rights reserved.
                  </p>
                  <div className="flex gap-4 text-sm">
                    <a href="/support" className="text-muted-foreground hover:text-foreground">
                      Support
                    </a>
                    <a href="/terms-of-service" className="text-muted-foreground hover:text-foreground">
                      Terms
                    </a>
                    <a href="/privacy-policy" className="text-muted-foreground hover:text-foreground">
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
      </body>
    </html>
  );
}
