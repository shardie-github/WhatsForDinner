/**
 * Affiliate and Direct Monetization System
 * Integrates delivery apps, grocery chains, and chef partnerships for revenue generation
 */

import { createClient } from '../supabaseClient';

export interface AffiliatePartner {
  id: string;
  name: string;
  type: 'delivery' | 'grocery' | 'chef' | 'ingredient' | 'equipment';
  apiEndpoint: string;
  apiKey: string;
  commissionRate: number; // percentage
  isActive: boolean;
  supportedRegions: string[];
  supportedCuisines: string[];
  logoUrl?: string;
  website?: string;
  description?: string;
}

export interface DeliveryOrder {
  id: string;
  partnerId: string;
  userId: string;
  restaurantName: string;
  items: OrderItem[];
  totalAmount: number;
  commission: number;
  status: 'pending' | 'confirmed' | 'preparing' | 'out_for_delivery' | 'delivered' | 'cancelled';
  estimatedDelivery: string;
  trackingUrl?: string;
  createdAt: string;
}

export interface GroceryOrder {
  id: string;
  partnerId: string;
  userId: string;
  storeName: string;
  items: OrderItem[];
  totalAmount: number;
  commission: number;
  status: 'pending' | 'confirmed' | 'picking' | 'ready_for_pickup' | 'delivered' | 'cancelled';
  pickupTime?: string;
  trackingUrl?: string;
  createdAt: string;
}

export interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
  category: string;
  imageUrl?: string;
  description?: string;
}

export interface ChefPartnership {
  id: string;
  chefId: string;
  chefName: string;
  specialty: string;
  recipes: string[];
  packages: ChefPackage[];
  commissionRate: number;
  isActive: boolean;
  bio?: string;
  profileImageUrl?: string;
  socialLinks?: Record<string, string>;
}

export interface ChefPackage {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  recipes: string[];
  includes: string[];
  duration: string; // e.g., "30 days", "lifetime"
  isPopular: boolean;
}

export interface AffiliateAnalytics {
  totalOrders: number;
  totalRevenue: number;
  totalCommission: number;
  topPartners: Array<{ partnerId: string; name: string; revenue: number; orders: number }>;
  topCuisines: Array<{ cuisine: string; orders: number; revenue: number }>;
  conversionRate: number;
  averageOrderValue: number;
}

class AffiliateMonetizationSystem {
  private supabase = createClient();
  private deliveryPartners: Map<string, AffiliatePartner> = new Map();
  private groceryPartners: Map<string, AffiliatePartner> = new Map();
  private chefPartners: Map<string, ChefPartnership> = new Map();

  constructor() {
    this.initializePartners();
  }

  /**
   * Initialize affiliate partners
   */
  private initializePartners() {
    // Delivery partners
    const deliveryPartners: AffiliatePartner[] = [
      {
        id: 'ubereats',
        name: 'Uber Eats',
        type: 'delivery',
        apiEndpoint: 'https://api.ubereats.com/v1',
        apiKey: process.env.UBER_EATS_API_KEY || '',
        commissionRate: 5.0,
        isActive: true,
        supportedRegions: ['US', 'CA', 'UK', 'AU'],
        supportedCuisines: ['all'],
        logoUrl: '/logos/ubereats.png',
        website: 'https://ubereats.com',
        description: 'Food delivery from your favorite restaurants'
      },
      {
        id: 'doordash',
        name: 'DoorDash',
        type: 'delivery',
        apiEndpoint: 'https://api.doordash.com/v2',
        apiKey: process.env.DOORDASH_API_KEY || '',
        commissionRate: 4.5,
        isActive: true,
        supportedRegions: ['US', 'CA'],
        supportedCuisines: ['all'],
        logoUrl: '/logos/doordash.png',
        website: 'https://doordash.com',
        description: 'Restaurant delivery and pickup'
      },
      {
        id: 'grubhub',
        name: 'Grubhub',
        type: 'delivery',
        apiEndpoint: 'https://api.grubhub.com/v1',
        apiKey: process.env.GRUBHUB_API_KEY || '',
        commissionRate: 4.0,
        isActive: true,
        supportedRegions: ['US'],
        supportedCuisines: ['all'],
        logoUrl: '/logos/grubhub.png',
        website: 'https://grubhub.com',
        description: 'Food delivery from local restaurants'
      }
    ];

    // Grocery partners
    const groceryPartners: AffiliatePartner[] = [
      {
        id: 'instacart',
        name: 'Instacart',
        type: 'grocery',
        apiEndpoint: 'https://api.instacart.com/v1',
        apiKey: process.env.INSTACART_API_KEY || '',
        commissionRate: 3.0,
        isActive: true,
        supportedRegions: ['US', 'CA'],
        supportedCuisines: ['all'],
        logoUrl: '/logos/instacart.png',
        website: 'https://instacart.com',
        description: 'Grocery delivery and pickup'
      },
      {
        id: 'amazon_fresh',
        name: 'Amazon Fresh',
        type: 'grocery',
        apiEndpoint: 'https://api.amazon.com/fresh/v1',
        apiKey: process.env.AMAZON_FRESH_API_KEY || '',
        commissionRate: 2.5,
        isActive: true,
        supportedRegions: ['US', 'UK', 'DE', 'JP'],
        supportedCuisines: ['all'],
        logoUrl: '/logos/amazon-fresh.png',
        website: 'https://amazon.com/fresh',
        description: 'Fresh groceries delivered by Amazon'
      }
    ];

    // Chef partnerships
    const chefPartners: ChefPartnership[] = [
      {
        id: 'chef_gordon',
        chefId: 'chef_gordon_ramsay',
        chefName: 'Gordon Ramsay',
        specialty: 'Fine Dining',
        recipes: ['beef-wellington', 'risotto', 'lobster-thermidor'],
        packages: [
          {
            id: 'gordon_basic',
            name: 'Gordon\'s Basics',
            description: 'Essential techniques and recipes from Gordon Ramsay',
            price: 29.99,
            currency: 'USD',
            recipes: ['beef-wellington', 'risotto'],
            includes: ['Video tutorials', 'Recipe cards', 'Shopping lists'],
            duration: '30 days',
            isPopular: false
          },
          {
            id: 'gordon_premium',
            name: 'Gordon\'s Masterclass',
            description: 'Complete fine dining course with Gordon Ramsay',
            price: 99.99,
            currency: 'USD',
            recipes: ['beef-wellington', 'risotto', 'lobster-thermidor', 'chocolate-souffle'],
            includes: ['Video tutorials', 'Recipe cards', 'Shopping lists', 'Live Q&A sessions', 'Certificate'],
            duration: 'lifetime',
            isPopular: true
          }
        ],
        commissionRate: 15.0,
        isActive: true,
        bio: 'World-renowned chef and restaurateur',
        profileImageUrl: '/chefs/gordon-ramsay.jpg',
        socialLinks: {
          instagram: '@gordonramsay',
          twitter: '@GordonRamsay'
        }
      }
    ];

    // Store partners
    deliveryPartners.forEach(partner => this.deliveryPartners.set(partner.id, partner));
    groceryPartners.forEach(partner => this.groceryPartners.set(partner.id, partner));
    chefPartners.forEach(partner => this.chefPartners.set(partner.id, partner));
  }

  /**
   * Get available delivery partners for a location
   */
  getDeliveryPartners(location: string, cuisine?: string): AffiliatePartner[] {
    return Array.from(this.deliveryPartners.values())
      .filter(partner => 
        partner.isActive && 
        partner.supportedRegions.includes(location) &&
        (cuisine ? partner.supportedCuisines.includes(cuisine) || partner.supportedCuisines.includes('all') : true)
      );
  }

  /**
   * Get available grocery partners for a location
   */
  getGroceryPartners(location: string): AffiliatePartner[] {
    return Array.from(this.groceryPartners.values())
      .filter(partner => 
        partner.isActive && 
        partner.supportedRegions.includes(location)
      );
  }

  /**
   * Get chef partnerships
   */
  getChefPartnerships(): ChefPartnership[] {
    return Array.from(this.chefPartners.values())
      .filter(partner => partner.isActive);
  }

  /**
   * Create delivery order
   */
  async createDeliveryOrder(
    partnerId: string,
    userId: string,
    restaurantName: string,
    items: OrderItem[],
    userLocation: { lat: number; lng: number; address: string }
  ): Promise<DeliveryOrder> {
    try {
      const partner = this.deliveryPartners.get(partnerId);
      if (!partner) {
        throw new Error('Delivery partner not found');
      }

      const totalAmount = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      const commission = totalAmount * (partner.commissionRate / 100);

      // Call partner API to create order
      const orderResponse = await this.callDeliveryAPI(partner, {
        restaurant: restaurantName,
        items: items.map(item => ({
          name: item.name,
          quantity: item.quantity,
          price: item.price
        })),
        location: userLocation
      });

      const order: DeliveryOrder = {
        id: orderResponse.orderId,
        partnerId,
        userId,
        restaurantName,
        items,
        totalAmount,
        commission,
        status: 'pending',
        estimatedDelivery: orderResponse.estimatedDelivery,
        trackingUrl: orderResponse.trackingUrl,
        createdAt: new Date().toISOString()
      };

      // Save order to database
      await this.saveDeliveryOrder(order);

      // Track commission
      await this.trackCommission(partnerId, commission, 'delivery');

      return order;

    } catch (error) {
      console.error('Error creating delivery order:', error);
      throw error;
    }
  }

  /**
   * Create grocery order
   */
  async createGroceryOrder(
    partnerId: string,
    userId: string,
    storeName: string,
    items: OrderItem[],
    userLocation: { lat: number; lng: number; address: string }
  ): Promise<GroceryOrder> {
    try {
      const partner = this.groceryPartners.get(partnerId);
      if (!partner) {
        throw new Error('Grocery partner not found');
      }

      const totalAmount = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      const commission = totalAmount * (partner.commissionRate / 100);

      // Call partner API to create order
      const orderResponse = await this.callGroceryAPI(partner, {
        store: storeName,
        items: items.map(item => ({
          name: item.name,
          quantity: item.quantity,
          price: item.price
        })),
        location: userLocation
      });

      const order: GroceryOrder = {
        id: orderResponse.orderId,
        partnerId,
        userId,
        storeName,
        items,
        totalAmount,
        commission,
        status: 'pending',
        pickupTime: orderResponse.pickupTime,
        trackingUrl: orderResponse.trackingUrl,
        createdAt: new Date().toISOString()
      };

      // Save order to database
      await this.saveGroceryOrder(order);

      // Track commission
      await this.trackCommission(partnerId, commission, 'grocery');

      return order;

    } catch (error) {
      console.error('Error creating grocery order:', error);
      throw error;
    }
  }

  /**
   * Purchase chef package
   */
  async purchaseChefPackage(
    chefId: string,
    packageId: string,
    userId: string
  ): Promise<{ success: boolean; package: ChefPackage; commission: number }> {
    try {
      const chef = this.chefPartners.get(chefId);
      if (!chef) {
        throw new Error('Chef partnership not found');
      }

      const package_ = chef.packages.find(p => p.id === packageId);
      if (!package_) {
        throw new Error('Chef package not found');
      }

      const commission = package_.price * (chef.commissionRate / 100);

      // Process payment (integrate with Stripe or other payment processor)
      const paymentResult = await this.processPayment({
        amount: package_.price,
        currency: package_.currency,
        userId,
        description: `Chef package: ${package_.name}`
      });

      if (!paymentResult.success) {
        throw new Error('Payment failed');
      }

      // Grant access to package content
      await this.grantPackageAccess(userId, chefId, packageId);

      // Track commission
      await this.trackCommission(chefId, commission, 'chef_package');

      return {
        success: true,
        package: package_,
        commission
      };

    } catch (error) {
      console.error('Error purchasing chef package:', error);
      throw error;
    }
  }

  /**
   * Get affiliate analytics
   */
  async getAffiliateAnalytics(
    startDate?: string,
    endDate?: string
  ): Promise<AffiliateAnalytics> {
    try {
      const start = startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
      const end = endDate || new Date().toISOString();

      // Get delivery orders
      const { data: deliveryOrders } = await this.supabase
        .from('delivery_orders')
        .select('*')
        .gte('created_at', start)
        .lte('created_at', end);

      // Get grocery orders
      const { data: groceryOrders } = await this.supabase
        .from('grocery_orders')
        .select('*')
        .gte('created_at', start)
        .lte('created_at', end);

      // Get chef package purchases
      const { data: chefPurchases } = await this.supabase
        .from('chef_package_purchases')
        .select('*')
        .gte('created_at', start)
        .lte('created_at', end);

      const allOrders = [
        ...(deliveryOrders || []),
        ...(groceryOrders || []),
        ...(chefPurchases || [])
      ];

      const totalOrders = allOrders.length;
      const totalRevenue = allOrders.reduce((sum, order) => sum + (order.total_amount || order.price || 0), 0);
      const totalCommission = allOrders.reduce((sum, order) => sum + (order.commission || 0), 0);

      // Calculate top partners
      const partnerStats = new Map<string, { name: string; revenue: number; orders: number }>();
      
      allOrders.forEach(order => {
        const partnerId = order.partner_id || order.chef_id;
        const partnerName = this.getPartnerName(partnerId);
        const revenue = order.total_amount || order.price || 0;
        
        if (partnerStats.has(partnerId)) {
          const stats = partnerStats.get(partnerId)!;
          stats.revenue += revenue;
          stats.orders += 1;
        } else {
          partnerStats.set(partnerId, { name: partnerName, revenue, orders: 1 });
        }
      });

      const topPartners = Array.from(partnerStats.values())
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 10);

      // Calculate conversion rate (simplified)
      const conversionRate = totalOrders > 0 ? (totalOrders / (totalOrders * 2)) * 100 : 0;
      const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

      return {
        totalOrders,
        totalRevenue,
        totalCommission,
        topPartners,
        topCuisines: [], // Would need more detailed tracking
        conversionRate,
        averageOrderValue
      };

    } catch (error) {
      console.error('Error getting affiliate analytics:', error);
      return {
        totalOrders: 0,
        totalRevenue: 0,
        totalCommission: 0,
        topPartners: [],
        topCuisines: [],
        conversionRate: 0,
        averageOrderValue: 0
      };
    }
  }

  /**
   * Call delivery partner API
   */
  private async callDeliveryAPI(partner: AffiliatePartner, orderData: any): Promise<any> {
    // Mock API call - in real implementation, this would call the actual partner API
    return {
      orderId: `order_${Date.now()}`,
      estimatedDelivery: new Date(Date.now() + 45 * 60 * 1000).toISOString(),
      trackingUrl: `https://${partner.id}.com/track/order_${Date.now()}`
    };
  }

  /**
   * Call grocery partner API
   */
  private async callGroceryAPI(partner: AffiliatePartner, orderData: any): Promise<any> {
    // Mock API call - in real implementation, this would call the actual partner API
    return {
      orderId: `grocery_${Date.now()}`,
      pickupTime: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
      trackingUrl: `https://${partner.id}.com/track/grocery_${Date.now()}`
    };
  }

  /**
   * Process payment
   */
  private async processPayment(paymentData: any): Promise<{ success: boolean; transactionId?: string }> {
    // Mock payment processing - in real implementation, this would integrate with Stripe
    return {
      success: true,
      transactionId: `txn_${Date.now()}`
    };
  }

  /**
   * Grant package access
   */
  private async grantPackageAccess(userId: string, chefId: string, packageId: string): Promise<void> {
    await this.supabase
      .from('user_chef_packages')
      .insert({
        user_id: userId,
        chef_id: chefId,
        package_id: packageId,
        granted_at: new Date().toISOString(),
        expires_at: null // For lifetime packages
      });
  }

  /**
   * Track commission
   */
  private async trackCommission(partnerId: string, amount: number, type: string): Promise<void> {
    await this.supabase
      .from('commission_tracking')
      .insert({
        partner_id: partnerId,
        amount,
        type,
        created_at: new Date().toISOString()
      });
  }

  /**
   * Save delivery order
   */
  private async saveDeliveryOrder(order: DeliveryOrder): Promise<void> {
    await this.supabase
      .from('delivery_orders')
      .insert({
        id: order.id,
        partner_id: order.partnerId,
        user_id: order.userId,
        restaurant_name: order.restaurantName,
        items: order.items,
        total_amount: order.totalAmount,
        commission: order.commission,
        status: order.status,
        estimated_delivery: order.estimatedDelivery,
        tracking_url: order.trackingUrl,
        created_at: order.createdAt
      });
  }

  /**
   * Save grocery order
   */
  private async saveGroceryOrder(order: GroceryOrder): Promise<void> {
    await this.supabase
      .from('grocery_orders')
      .insert({
        id: order.id,
        partner_id: order.partnerId,
        user_id: order.userId,
        store_name: order.storeName,
        items: order.items,
        total_amount: order.totalAmount,
        commission: order.commission,
        status: order.status,
        pickup_time: order.pickupTime,
        tracking_url: order.trackingUrl,
        created_at: order.createdAt
      });
  }

  /**
   * Get partner name by ID
   */
  private getPartnerName(partnerId: string): string {
    const deliveryPartner = this.deliveryPartners.get(partnerId);
    if (deliveryPartner) return deliveryPartner.name;

    const groceryPartner = this.groceryPartners.get(partnerId);
    if (groceryPartner) return groceryPartner.name;

    const chefPartner = this.chefPartners.get(partnerId);
    if (chefPartner) return chefPartner.chefName;

    return 'Unknown Partner';
  }
}

// Export singleton instance
export const affiliateSystem = new AffiliateMonetizationSystem();