'use client';

import { Home, Search, Play, User, UtensilsCrossed } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/dashboard', icon: Home, label: 'Home' },
  { href: '/surprise-me', icon: Search, label: 'Find' },
  { href: '/play', icon: Play, label: 'Play' },
  { href: '/grocery', icon: UtensilsCrossed, label: 'Shop' },
  { href: '/profile', icon: User, label: 'Profile' },
];

export function MobileNav() {
  const pathname = usePathname();

  // Don't show on certain pages
  const hideOnPaths = ['/onboarding', '/auth', '/signup', '/login'];
  if (hideOnPaths.some(path => pathname?.startsWith(path))) {
    return null;
  }

  return (
    <nav 
      className="fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-md border-t border-border md:hidden safe-area-inset-bottom"
      aria-label="Main navigation"
    >
      <div className="flex items-center justify-around h-16 px-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-col items-center justify-center gap-1 flex-1 h-full transition-colors relative',
                isActive
                  ? 'text-primary'
                  : 'text-muted-foreground hover:text-foreground'
              )}
              aria-current={isActive ? 'page' : undefined}
            >
              <item.icon className={cn('w-5 h-5 transition-transform', isActive && 'scale-110')} aria-hidden="true" />
              <span className="text-xs font-medium">{item.label}</span>
              {isActive && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" aria-hidden="true" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
