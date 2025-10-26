'use client'

import { useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabaseClient'
import { useTenant } from '@/hooks/useTenant'
import { 
  Home, 
  ChefHat, 
  Heart, 
  CreditCard, 
  Settings, 
  LogOut,
  Menu,
  X
} from 'lucide-react'

interface NavbarProps {
  user: any
}

export default function Navbar({ user }: NavbarProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { tenant } = useTenant()

  const handleSignOut = async () => {
    await supabase.auth.signOut()
  }

  return (
    <nav className="bg-white shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="flex items-center space-x-2">
            <ChefHat className="h-8 w-8 text-blue-600" />
            <span className="text-xl font-bold text-gray-900">
              What's for Dinner?
            </span>
          </Link>

          <div className="hidden md:flex items-center space-x-4">
            <Link href="/" className="flex items-center space-x-1 text-gray-600 hover:text-gray-900">
              <Home className="h-4 w-4" />
              <span>Home</span>
            </Link>
            <Link href="/pantry" className="flex items-center space-x-1 text-gray-600 hover:text-gray-900">
              <ChefHat className="h-4 w-4" />
              <span>Pantry</span>
            </Link>
            <Link href="/favorites" className="flex items-center space-x-1 text-gray-600 hover:text-gray-900">
              <Heart className="h-4 w-4" />
              <span>Favorites</span>
            </Link>
            
            {user && (
              <>
                <Link href="/billing" className="flex items-center space-x-1 text-gray-600 hover:text-gray-900">
                  <CreditCard className="h-4 w-4" />
                  <span>Billing</span>
                </Link>
                
                {tenant && tenant.plan !== 'free' && (
                  <Link href="/admin" className="flex items-center space-x-1 text-gray-600 hover:text-gray-900">
                    <Settings className="h-4 w-4" />
                    <span>Admin</span>
                  </Link>
                )}
              </>
            )}

            {user ? (
              <button
                onClick={handleSignOut}
                className="flex items-center space-x-1 bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600"
              >
                <LogOut className="h-4 w-4" />
                <span>Sign Out</span>
              </button>
            ) : (
              <Link
                href="/auth"
                className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
              >
                Sign In
              </Link>
            )}
          </div>

          <button
            className="md:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>

        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              <Link 
                href="/" 
                className="flex items-center space-x-2 px-3 py-2 text-gray-600 hover:text-gray-900"
                onClick={() => setIsMenuOpen(false)}
              >
                <Home className="h-4 w-4" />
                <span>Home</span>
              </Link>
              <Link 
                href="/pantry" 
                className="flex items-center space-x-2 px-3 py-2 text-gray-600 hover:text-gray-900"
                onClick={() => setIsMenuOpen(false)}
              >
                <ChefHat className="h-4 w-4" />
                <span>Pantry</span>
              </Link>
              <Link 
                href="/favorites" 
                className="flex items-center space-x-2 px-3 py-2 text-gray-600 hover:text-gray-900"
                onClick={() => setIsMenuOpen(false)}
              >
                <Heart className="h-4 w-4" />
                <span>Favorites</span>
              </Link>
              
              {user && (
                <>
                  <Link 
                    href="/billing" 
                    className="flex items-center space-x-2 px-3 py-2 text-gray-600 hover:text-gray-900"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <CreditCard className="h-4 w-4" />
                    <span>Billing</span>
                  </Link>
                  
                  {tenant && tenant.plan !== 'free' && (
                    <Link 
                      href="/admin" 
                      className="flex items-center space-x-2 px-3 py-2 text-gray-600 hover:text-gray-900"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <Settings className="h-4 w-4" />
                      <span>Admin</span>
                    </Link>
                  )}
                </>
              )}

              {user ? (
                <button
                  onClick={() => {
                    handleSignOut()
                    setIsMenuOpen(false)
                  }}
                  className="flex items-center space-x-2 w-full text-left px-3 py-2 text-red-600 hover:text-red-900"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Sign Out</span>
                </button>
              ) : (
                <Link
                  href="/auth"
                  className="block px-3 py-2 text-blue-600 hover:text-blue-900"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Sign In
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}