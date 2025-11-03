// Auth adapters for different providers

export interface AuthCredentials {
  email: string;
  password: string;
}

export interface OAuthProvider {
  google: {
    clientId: string;
    redirectUri: string;
  };
  apple: {
    clientId: string;
    redirectUri: string;
  };
}

export interface AuthSession {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
  user: {
    id: string;
    email: string;
    name?: string;
  };
}

export interface AuthAdapter {
  signInWithEmail(credentials: AuthCredentials): Promise<AuthSession>;
  signUpWithEmail(credentials: AuthCredentials & { name?: string }): Promise<AuthSession>;
  signInWithOAuth(provider: 'google' | 'apple'): Promise<AuthSession>;
  signOut(): Promise<void>;
  refreshSession(refreshToken: string): Promise<AuthSession>;
  getCurrentSession(): Promise<AuthSession | null>;
}

// Supabase adapter implementation
export class SupabaseAuthAdapter implements AuthAdapter {
  private supabaseUrl: string;
  private supabaseKey: string;
  private storage: Storage | null = null;

  constructor(config: { url: string; key: string; storage?: Storage }) {
    this.supabaseUrl = config.url;
    this.supabaseKey = config.key;
    this.storage = config.storage || (typeof window !== 'undefined' ? window.localStorage : null);
  }

  async signInWithEmail(credentials: AuthCredentials): Promise<AuthSession> {
    const response = await fetch(`${this.supabaseUrl}/auth/v1/token?grant_type=password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: this.supabaseKey,
      },
      body: JSON.stringify({
        email: credentials.email,
        password: credentials.password,
      }),
    });

    if (!response.ok) {
      throw new Error('Authentication failed');
    }

    const data = await response.json();
    return this.saveSession(data);
  }

  async signUpWithEmail(
    credentials: AuthCredentials & { name?: string }
  ): Promise<AuthSession> {
    const response = await fetch(`${this.supabaseUrl}/auth/v1/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: this.supabaseKey,
      },
      body: JSON.stringify({
        email: credentials.email,
        password: credentials.password,
        data: { name: credentials.name },
      }),
    });

    if (!response.ok) {
      throw new Error('Registration failed');
    }

    const data = await response.json();
    return this.saveSession(data);
  }

  async signInWithOAuth(provider: 'google' | 'apple'): Promise<AuthSession> {
    // OAuth flow would redirect to provider
    const redirectUrl = `${this.supabaseUrl}/auth/v1/authorize?provider=${provider}`;
    window.location.href = redirectUrl;
    
    // In practice, this would use a callback/promise pattern
    throw new Error('OAuth flow requires redirect handling');
  }

  async signOut(): Promise<void> {
    if (this.storage) {
      this.storage.removeItem('nomad_auth_session');
      this.storage.removeItem('nomad_refresh_token');
    }
  }

  async refreshSession(refreshToken: string): Promise<AuthSession> {
    const response = await fetch(`${this.supabaseUrl}/auth/v1/token?grant_type=refresh_token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: this.supabaseKey,
      },
      body: JSON.stringify({ refresh_token: refreshToken }),
    });

    if (!response.ok) {
      throw new Error('Token refresh failed');
    }

    const data = await response.json();
    return this.saveSession(data);
  }

  async getCurrentSession(): Promise<AuthSession | null> {
    if (!this.storage) {
      return null;
    }

    const stored = this.storage.getItem('nomad_auth_session');
    if (!stored) {
      return null;
    }

    try {
      const session = JSON.parse(stored);
      if (session.expiresAt < Date.now()) {
        // Try to refresh
        const refreshToken = this.storage.getItem('nomad_refresh_token');
        if (refreshToken) {
          return await this.refreshSession(refreshToken);
        }
        return null;
      }

      return session;
    } catch {
      return null;
    }
  }

  private saveSession(data: any): AuthSession {
    const session: AuthSession = {
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      expiresAt: Date.now() + (data.expires_in * 1000),
      user: {
        id: data.user.id,
        email: data.user.email,
        name: data.user.user_metadata?.name,
      },
    };

    if (this.storage) {
      this.storage.setItem('nomad_auth_session', JSON.stringify(session));
      this.storage.setItem('nomad_refresh_token', session.refreshToken);
    }

    return session;
  }
}

// Secure storage for mobile (would use expo-secure-store)
export interface SecureStorageAdapter {
  setItem(key: string, value: string): Promise<void>;
  getItem(key: string): Promise<string | null>;
  removeItem(key: string): Promise<void>;
}

export class MobileSecureStorage implements SecureStorageAdapter {
  async setItem(key: string, value: string): Promise<void> {
    // Implementation would use expo-secure-store
    // await SecureStore.setItemAsync(key, value);
  }

  async getItem(key: string): Promise<string | null> {
    // return await SecureStore.getItemAsync(key);
    return null;
  }

  async removeItem(key: string): Promise<void> {
    // await SecureStore.deleteItemAsync(key);
  }
}
