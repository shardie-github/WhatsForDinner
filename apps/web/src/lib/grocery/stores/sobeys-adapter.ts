/**
 * Sobeys Grocery Store Adapter
 * Integration for Sobeys, Safeway, IGA stores
 * 
 * API Keys Required:
 * - SOBEYS_API_KEY (if available)
 * - SOBEYS_AFFILIATE_ID (for affiliate links)
 */

import { BaseGroceryAdapter } from './base-adapter';
import { GroceryStore, ProductSearchParams, ProductSearchResult, GroceryCart, GroceryCartItem, GroceryCategory, GroceryStoreFeature } from '../types';

export class SobeysAdapter extends BaseGroceryAdapter {
  constructor() {
    super({
      id: 'sobeys',
      name: 'sobeys',
      displayName: 'Sobeys',
      baseUrl: 'https://www.sobeys.com',
      enabled: !!process.env.NEXT_PUBLIC_SOBEYS_ENABLED,
      requiresAuth: false,
      supportedFeatures: [
        GroceryStoreFeature.PRODUCT_SEARCH,
        GroceryStoreFeature.CART_ADD,
      ],
      region: 'CA',
      affiliateId: process.env.NEXT_PUBLIC_SOBEYS_AFFILIATE_ID,
      commissionRate: 4.5,
    });
  }

  async searchProducts(params: ProductSearchParams): Promise<ProductSearchResult> {
    if (this.store.apiKey) {
      return this.searchViaAPI(params);
    }
    return this.searchViaAffiliate(params);
  }

  private async searchViaAPI(params: ProductSearchParams): Promise<ProductSearchResult> {
    // TODO: Implement Sobeys API when available
    return {
      products: [],
      total: 0,
      page: 1,
      pageSize: params.limit || 20,
    };
  }

  private async searchViaAffiliate(params: ProductSearchParams): Promise<ProductSearchResult> {
    const searchUrl = `${this.store.baseUrl}/en/online-grocery/search?q=${encodeURIComponent(params.query)}`;
    
    return {
      products: [
        {
          id: `sobeys-${params.query}-1`,
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
    const cartId = `sobeys-${Date.now()}`;
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
    throw new Error('Cart retrieval requires Sobeys API access');
  }

  async getCategories(): Promise<GroceryCategory[]> {
    return [
      { id: 'produce', name: 'produce', displayName: 'Produce', icon: '🥬', color: '#4CAF50' },
      { id: 'meat', name: 'meat', displayName: 'Meat & Seafood', icon: '🥩', color: '#F44336' },
      { id: 'dairy', name: 'dairy', displayName: 'Dairy & Eggs', icon: '🥛', color: '#2196F3' },
      { id: 'bakery', name: 'bakery', displayName: 'Bakery', icon: '🍞', color: '#FF9800' },
      { id: 'frozen', name: 'frozen', displayName: 'Frozen Foods', icon: '❄️', color: '#00BCD4' },
      { id: 'pantry', name: 'pantry', displayName: 'Pantry Staples', icon: '🥫', color: '#9C27B0' },
    ];
  }

  async validateConnection(): Promise<boolean> {
    return !!this.store.affiliateId || !!this.store.apiKey;
  }
}
