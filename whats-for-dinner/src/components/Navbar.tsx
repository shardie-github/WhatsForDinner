'use client'

import { useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabaseClient'

interface NavbarProps {
  user: any
}

export default function Navbar({ user }: NavbarProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const handleSignOut = async () => {
    await supabase.auth.signOut()
  }

  return (
    <nav className="bg-white shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="text-xl font-bold text-gray-900">
            What's for Dinner?
          </Link>

          <div className="hidden md:flex items-center space-x-4">
            <Link href="/" className="text-gray-600 hover:text-gray-900">
              Home
            </Link>
            <Link href="/pantry" className="text-gray-600 hover:text-gray-900">
              Pantry
            </Link>
            <Link href="/favorites" className="text-gray-600 hover:text-gray-900">
              Favorites
            </Link>
            {user ? (
              <button
                onClick={handleSignOut}
                className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600"
              >
                Sign Out
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
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>

        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              <Link href="/" className="block px-3 py-2 text-gray-600 hover:text-gray-900">
                Home
              </Link>
              <Link href="/pantry" className="block px-3 py-2 text-gray-600 hover:text-gray-900">
                Pantry
              </Link>
              <Link href="/favorites" className="block px-3 py-2 text-gray-600 hover:text-gray-900">
                Favorites
              </Link>
              {user ? (
                <button
                  onClick={handleSignOut}
                  className="block w-full text-left px-3 py-2 text-red-600 hover:text-red-900"
                >
                  Sign Out
                </button>
              ) : (
                <Link
                  href="/auth"
                  className="block px-3 py-2 text-blue-600 hover:text-blue-900"
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