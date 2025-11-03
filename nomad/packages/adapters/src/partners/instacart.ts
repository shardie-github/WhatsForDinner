export interface InstacartConfig {
  apiKey: string;
  clientId: string;
  redirectUri: string;
}

export interface InstacartCartItem {
  sku: string;
  name: string;
  quantity: number;
  price?: number;
}

export interface InstacartCart {
  items: InstacartCartItem[];
  total?: number;
}

export class InstacartAdapter {
  private config: InstacartConfig | null = null;

  initialize(config: InstacartConfig): void {
    this.config = config;
  }

  async connect(): Promise<string> {
    // OAuth flow
    if (!this.config) {
      throw new Error('Instacart adapter not initialized');
    }

    const authUrl = `https://api.instacart.com/oauth/authorize?client_id=${this.config.clientId}&redirect_uri=${encodeURIComponent(this.config.redirectUri)}&response_type=code&scope=cart:write`;
    
    // Redirect to auth URL
    if (typeof window !== 'undefined') {
      window.location.href = authUrl;
    }

    return authUrl;
  }

  async addToCart(items: InstacartCartItem[]): Promise<void> {
    if (!this.config) {
      throw new Error('Instacart adapter not initialized');
    }

    // API call to add items to cart
    const response = await fetch('https://api.instacart.com/v1/cart/add', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.config.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ items }),
    });

    if (!response.ok) {
      throw new Error('Failed to add items to Instacart cart');
    }
  }

  generateDeepLink(items: InstacartCartItem[]): string {
    // Generate deep link for mobile app
    const skus = items.map(item => item.sku).join(',');
    return `instacart://cart/add?skus=${skus}`;
  }

  getThemeTokens(): Record<string, string> {
    return {
      primary: '#00A862',
      secondary: '#000000',
      accent: '#FFFFFF',
    };
  }
}
