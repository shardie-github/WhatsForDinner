'use client';

import { useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';
import { useTenant } from '@/hooks/useTenant';
import {
  Home,
  ChefHat,
  Heart,
  CreditCard,
  Settings,
  LogOut,
  Menu,
  X,
  User,
} from 'lucide-react';
import { Button } from './ui/button';
import { Separator } from './ui/separator';

interface NavbarProps {
  user: any;
}

export default function Navbar({ user }: NavbarProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { tenant } = useTenant();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  const navItems = [
    { href: '/', label: 'Home', icon: Home },
    { href: '/pantry', label: 'Pantry', icon: ChefHat },
    { href: '/favorites', label: 'Favorites', icon: Heart },
  ];

  const userNavItems = [
    { href: '/billing', label: 'Billing', icon: CreditCard },
    ...(tenant && tenant.plan !== 'free'
      ? [{ href: '/admin', label: 'Admin', icon: Settings }]
      : []),
  ];

  return (
    <nav className="bg-background/95 supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50 w-full border-b backdrop-blur">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="group flex items-center space-x-2">
            <div className="bg-primary group-hover:bg-primary/90 flex h-8 w-8 items-center justify-center rounded-lg transition-colors">
              <ChefHat className="text-primary-foreground h-5 w-5" />
            </div>
            <span className="text-foreground group-hover:text-primary text-xl font-bold transition-colors">
              What's for Dinner?
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden items-center space-x-1 md:flex">
            {navItems.map(item => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="text-muted-foreground hover:bg-accent hover:text-foreground flex items-center space-x-2 rounded-md px-3 py-2 text-sm font-medium transition-colors"
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </Link>
              );
            })}

            {user && (
              <>
                <Separator orientation="vertical" className="h-6" />
                {userNavItems.map(item => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="text-muted-foreground hover:bg-accent hover:text-foreground flex items-center space-x-2 rounded-md px-3 py-2 text-sm font-medium transition-colors"
                    >
                      <Icon className="h-4 w-4" />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </>
            )}

            <Separator orientation="vertical" className="h-6" />

            {user ? (
              <div className="flex items-center space-x-2">
                <div className="flex items-center space-x-2 px-3 py-2">
                  <div className="bg-primary/10 flex h-8 w-8 items-center justify-center rounded-full">
                    <User className="text-primary h-4 w-4" />
                  </div>
                  <span className="text-foreground text-sm font-medium">
                    {user.email?.split('@')[0] || 'User'}
                  </span>
                </div>
                <Button
                  onClick={handleSignOut}
                  variant="outline"
                  size="sm"
                  className="text-destructive hover:bg-destructive hover:text-destructive-foreground"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign Out
                </Button>
              </div>
            ) : (
              <Link href="/auth">
                <Button size="sm">
                  <User className="mr-2 h-4 w-4" />
                  Sign In
                </Button>
              </Link>
            )}
          </div>

          {/* Mobile menu button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </Button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="bg-background border-t md:hidden">
            <div className="space-y-1 px-2 pb-3 pt-2">
              {navItems.map(item => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="text-muted-foreground hover:bg-accent hover:text-foreground flex items-center space-x-3 rounded-md px-3 py-2 text-base font-medium transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <Icon className="h-5 w-5" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}

              {user && (
                <>
                  <Separator className="my-2" />
                  {userNavItems.map(item => {
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className="text-muted-foreground hover:bg-accent hover:text-foreground flex items-center space-x-3 rounded-md px-3 py-2 text-base font-medium transition-colors"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <Icon className="h-5 w-5" />
                        <span>{item.label}</span>
                      </Link>
                    );
                  })}
                </>
              )}

              <Separator className="my-2" />

              {user ? (
                <div className="space-y-2 px-3 py-2">
                  <div className="flex items-center space-x-3">
                    <div className="bg-primary/10 flex h-8 w-8 items-center justify-center rounded-full">
                      <User className="text-primary h-4 w-4" />
                    </div>
                    <span className="text-foreground text-base font-medium">
                      {user.email?.split('@')[0] || 'User'}
                    </span>
                  </div>
                  <Button
                    onClick={() => {
                      handleSignOut();
                      setIsMenuOpen(false);
                    }}
                    variant="outline"
                    className="text-destructive hover:bg-destructive hover:text-destructive-foreground w-full justify-start"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign Out
                  </Button>
                </div>
              ) : (
                <Link
                  href="/auth"
                  className="block px-3 py-2"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <Button className="w-full justify-start">
                    <User className="mr-2 h-4 w-4" />
                    Sign In
                  </Button>
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
