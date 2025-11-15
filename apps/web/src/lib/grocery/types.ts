/**
 * Grocery Integration Types
 * Types for grocery store integrations, products, and cart management
 */

export interface GroceryStore {
  id: string;
  name: string;
  displayName: string;
  logo?: string;
  apiKey?: string;
  apiSecret?: string;
  baseUrl: string;
  enabled: boolean;
  requiresAuth: boolean;
  authUrl?: string;
  supportedFeatures: GroceryStoreFeature[];
  region: 'CA' | 'US';
  affiliateId?: string;
  commissionRate?: number;
}

export enum GroceryStoreFeature {
  PRODUCT_SEARCH = 'product_search',
  CART_ADD = 'cart_add',
  PRICE_COMPARISON = 'price_comparison',
  INVENTORY_CHECK = 'inventory_check',
  DELIVERY_SLOTS = 'delivery_slots',
  PICKUP_SLOTS = 'pickup_slots',
}

export interface GroceryProduct {
  id: string;
  storeId: string;
  name: string;
  brand?: string;
  description?: string;
  price: number;
  currency: string;
  unit?: string;
  imageUrl?: string;
  category: GroceryCategory;
  inStock: boolean;
  stockLevel?: 'in_stock' | 'low_stock' | 'out_of_stock';
  nutritionInfo?: NutritionInfo;
  allergens?: string[];
  organic?: boolean;
  salePrice?: number;
  saleEndDate?: string;
}

export interface GroceryCategory {
  id: string;
  name: string;
  displayName: string;
  icon?: string;
  parentId?: string;
  color?: string;
  imageUrl?: string;
}

export interface NutritionInfo {
  calories?: number;
  protein?: number;
  carbs?: number;
  fat?: number;
  fiber?: number;
  sugar?: number;
  sodium?: number;
  servingSize?: string;
}

export interface GroceryCart {
  id: string;
  storeId: string;
  userId: string;
  items: GroceryCartItem[];
  total: number;
  currency: string;
  checkoutUrl?: string;
  expiresAt?: string;
  createdAt: string;
}

export interface GroceryCartItem {
  productId: string;
  product: GroceryProduct;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  notes?: string;
}

export interface ProductSearchParams {
  query: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
  organic?: boolean;
  limit?: number;
  offset?: number;
}

export interface ProductSearchResult {
  products: GroceryProduct[];
  total: number;
  page: number;
  pageSize: number;
}

export interface GroceryStoreAdapter {
  store: GroceryStore;
  searchProducts(params: ProductSearchParams): Promise<ProductSearchResult>;
  addToCart(items: GroceryCartItem[]): Promise<GroceryCart>;
  getCart(cartId: string): Promise<GroceryCart>;
  getCategories(): Promise<GroceryCategory[]>;
  validateConnection(): Promise<boolean>;
}

export interface GroceryConfig {
  stores: GroceryStore[];
  defaultStore?: string;
  enablePriceComparison: boolean;
  enableNotifications: boolean;
  syncFrequency: 'realtime' | 'hourly' | 'daily';
}
