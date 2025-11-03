import { useState, useEffect } from 'react';
import type { User } from '@nomad/data';
import { SupabaseAuthAdapter } from '@nomad/adapters';
import * as SecureStore from 'expo-secure-store';

const authAdapter = new SupabaseAuthAdapter({
  url: process.env.SUPABASE_URL || '',
  key: process.env.SUPABASE_ANON_KEY || '',
});

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    authAdapter.getCurrentSession().then((session) => {
      if (session) {
        // Fetch user data
        setUser({
          id: session.user.id,
          email: session.user.email,
          name: session.user.name,
          plan: 'free',
          preferences: {
            diet: [],
            allergens: [],
            units: 'imperial',
            theme: 'auto',
          },
          households: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
      }
      setLoading(false);
    });
  }, []);

  return { user, loading };
}
