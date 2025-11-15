/**
 * Metro Grocery Store Adapter
 * Integration for Metro and Food Basics stores
 * 
 * API Keys Required:
 * - METRO_API_KEY (if available)
 * - METRO_AFFILIATE_ID (for affiliate links)
 */

import { BaseGroceryAdapter } from './base-adapter';
import { GroceryStore, ProductSearchParams, ProductSearchResult, GroceryCart, GroceryCartItem, GroceryCategory, GroceryStoreFeature } from '../types';

export class MetroAdapter extends BaseGroceryAdapter {
  constructor() {
    super({
      id: 'metro',
      name: 'metro',
      displayName: 'Metro',
      baseUrl: 'https://www.metro.ca',
      enabled: !!process.env.NEXT_PUBLIC_METRO_ENABLED,
      requiresAuth: false,
      supportedFeatures: [
        GroceryStoreFeature.PRODUCT_SEARCH,
        GroceryStoreFeature.CART_ADD,
      ],
      region: 'CA',
      affiliateId: process.env.NEXT_PUBLIC_METRO_AFFILIATE_ID,
      commissionRate: 4.0,
    });
  }

  async searchProducts(params: ProductSearchParams): Promise<ProductSearchResult> {
    if (this.store.apiKey) {
      return this.searchViaAPI(params);
    }
    return this.searchViaAffiliate(params);
  }

  private async searchViaAPI(params: ProductSearchParams): Promise<ProductSearchResult> {
    // TODO: Implement Metro API when available
    return {
      products: [],
      total: 0,
      page: 1,
      pageSize: params.limit || 20,
    };
  }

  private async searchViaAffiliate(params: ProductSearchParams): Promise<ProductSearchResult> {
    const searchUrl = `${this.store.baseUrl}/en/online-grocery/search.html?q=${encodeURIComponent(params.query)}`;
    
    return {
      products: [
        {
          id: `metro-${params.query}-1`,
          storeId: this.store.id,
          name: params.query,
          price: 0,
          currency: 'CAD',
          category: {
            id: 'general',
            name: 'general',
            displayName: 'General',
          },
          inStock: true,
        },
      ],
      total: 1,
      page: 1,
      pageSize: 1,
    };
  }

  async addToCart(items: GroceryCartItem[]): Promise<GroceryCart> {
    const cartId = `metro-${Date.now()}`;
    const checkoutUrl = `${this.store.baseUrl}/en/online-grocery/cart?items=${items.map(i => i.productId).join(',')}`;

    return {
      id: cartId,
      storeId: this.store.id,
      userId: '',
      items,
      total: items.reduce((sum, item) => sum + item.totalPrice, 0),
      currency: 'CAD',
      checkoutUrl,
      createdAt: new Date().toISOString(),
    };
  }

  async getCart(cartId: string): Promise<GroceryCart> {
    throw new Error('Cart retrieval requires Metro API access');
  }

  async getCategories(): Promise<GroceryCategory[]> {
    return [
      { id: 'produce', name: 'produce', displayName: 'Produce', icon: '🥬', color: '#4CAF50' },
      { id: 'meat', name: 'meat', displayName: 'Meat & Seafood', icon: '🥩', color: '#F44336' },
      { id: 'dairy', name: 'dairy', displayName: 'Dairy & Eggs', icon: '🥛', color: '#2196F3' },
      { id: 'bakery', name: 'bakery', displayName: 'Bakery', icon: '🍞', color: '#FF9800' },
      { id: 'frozen', name: 'frozen', displayName: 'Frozen Foods', icon: '❄️', color: '#00BCD4' },
      { id: 'pantry', name: 'pantry', displayName: 'Pantry Staples', icon: '🥫', color: '#9C27B0' },
      { id: 'snacks', name: 'snacks', displayName: 'Snacks & Beverages', icon: '🍪', color: '#FF5722' },
    ];
  }

  async validateConnection(): Promise<boolean> {
    return !!this.store.affiliateId || !!this.store.apiKey;
  }
}
