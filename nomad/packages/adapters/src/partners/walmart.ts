export interface WalmartConfig {
  apiKey: string;
  clientId: string;
  redirectUri: string;
}

export interface WalmartCartItem {
  sku: string;
  name: string;
  quantity: number;
  price?: number;
}

export interface WalmartCart {
  items: WalmartCartItem[];
  total?: number;
}

export class WalmartAdapter {
  private config: WalmartConfig | null = null;

  initialize(config: WalmartConfig): void {
    this.config = config;
  }

  async connect(): Promise<string> {
    if (!this.config) {
      throw new Error('Walmart adapter not initialized');
    }

    const authUrl = `https://api.walmart.com/oauth/authorize?client_id=${this.config.clientId}&redirect_uri=${encodeURIComponent(this.config.redirectUri)}&response_type=code`;
    
    if (typeof window !== 'undefined') {
      window.location.href = authUrl;
    }

    return authUrl;
  }

  async addToCart(items: WalmartCartItem[]): Promise<void> {
    if (!this.config) {
      throw new Error('Walmart adapter not initialized');
    }

    const response = await fetch('https://api.walmart.com/v1/cart/add', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.config.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ items }),
    });

    if (!response.ok) {
      throw new Error('Failed to add items to Walmart cart');
    }
  }

  generateDeepLink(items: WalmartCartItem[]): string {
    const skus = items.map(item => item.sku).join(',');
    return `walmart://grocery/cart?items=${skus}`;
  }

  getThemeTokens(): Record<string, string> {
    return {
      primary: '#004C91',
      secondary: '#FFC220',
      accent: '#FFFFFF',
    };
  }
}
