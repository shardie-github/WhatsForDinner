/**
 * Base Grocery Store Adapter
 * Abstract base class for all grocery store integrations
 */

import { GroceryStoreAdapter, GroceryStore, ProductSearchParams, ProductSearchResult, GroceryCart, GroceryCartItem, GroceryCategory } from '../types';

export abstract class BaseGroceryAdapter implements GroceryStoreAdapter {
  constructor(public store: GroceryStore) {}

  abstract searchProducts(params: ProductSearchParams): Promise<ProductSearchResult>;
  abstract addToCart(items: GroceryCartItem[]): Promise<GroceryCart>;
  abstract getCart(cartId: string): Promise<GroceryCart>;
  abstract getCategories(): Promise<GroceryCategory[]>;
  abstract validateConnection(): Promise<boolean>;

  protected async makeRequest(url: string, options: RequestInit = {}): Promise<Response> {
    const headers = new Headers(options.headers);
    
    if (this.store.apiKey) {
      headers.set('Authorization', `Bearer ${this.store.apiKey}`);
    }
    
    if (this.store.apiSecret) {
      headers.set('X-API-Secret', this.store.apiSecret);
    }

    headers.set('Content-Type', 'application/json');

    return fetch(url, {
      ...options,
      headers,
    });
  }

  protected generateCheckoutUrl(cartId: string, items: GroceryCartItem[]): string {
    // Generate deep link or checkout URL based on store
    const itemParams = items.map(item => 
      `${item.productId}:${item.quantity}`
    ).join(',');

    return `${this.store.baseUrl}/cart?items=${encodeURIComponent(itemParams)}&cartId=${cartId}`;
  }
}
