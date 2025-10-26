/**
 * Monetization System
 *
 * Implements comprehensive monetization with:
 * - Affiliate marketing integration (UberEats, DoorDash, etc.)
 * - Dynamic grocery deal advertisements
 * - Chef partnership content licensing
 * - Subscription revenue management
 * - Revenue tracking and analytics
 * - Commission management
 */

import { logger } from './logger';
import { monitoringSystem } from './monitoring';

export interface AffiliatePartner {
  id: string;
  name: string;
  type: 'delivery' | 'grocery' | 'cooking_supplies' | 'subscription';
  apiEndpoint: string;
  apiKey: string;
  commissionRate: number;
  baseUrl: string;
  trackingId: string;
  active: boolean;
  lastSync: string;
}

export interface DeliveryPartner extends AffiliatePartner {
  type: 'delivery';
  supportedCuisines: string[];
  deliveryAreas: string[];
  averageDeliveryTime: number;
  minimumOrder: number;
  deliveryFee: number;
  rating: number;
}

export interface GroceryPartner extends AffiliatePartner {
  type: 'grocery';
  supportedCategories: string[];
  storeLocations: string[];
  onlineOrdering: boolean;
  pickupAvailable: boolean;
  deliveryAvailable: boolean;
}

export interface CookingSuppliesPartner extends AffiliatePartner {
  type: 'cooking_supplies';
  productCategories: string[];
  brands: string[];
  shippingRegions: string[];
}

export interface SubscriptionPartner extends AffiliatePartner {
  type: 'subscription';
  subscriptionTiers: SubscriptionTier[];
  features: string[];
  billingCycle: 'monthly' | 'yearly';
}

export interface SubscriptionTier {
  id: string;
  name: string;
  price: number;
  features: string[];
  maxRecipes: number;
  maxUsers: number;
  prioritySupport: boolean;
}

export interface AffiliateLink {
  id: string;
  partnerId: string;
  recipeId: string;
  userId: string;
  originalUrl: string;
  affiliateUrl: string;
  clickCount: number;
  conversionCount: number;
  revenue: number;
  commission: number;
  createdAt: string;
  lastClicked: string;
  status: 'active' | 'inactive' | 'expired';
}

export interface GroceryDeal {
  id: string;
  partnerId: string;
  title: string;
  description: string;
  originalPrice: number;
  salePrice: number;
  discount: number;
  category: string;
  ingredients: string[];
  imageUrl: string;
  validUntil: string;
  maxQuantity: number;
  currentQuantity: number;
  clickCount: number;
  conversionCount: number;
  revenue: number;
  commission: number;
  createdAt: string;
  status: 'active' | 'inactive' | 'expired';
}

export interface ChefPartnership {
  id: string;
  chefId: string;
  chefName: string;
  specialty: string;
  cuisine: string;
  partnershipType:
    | 'content_licensing'
    | 'recipe_development'
    | 'brand_ambassador'
    | 'exclusive';
  revenueShare: number;
  content: ChefContent[];
  licensing: LicensingInfo;
  revenue: number;
  active: boolean;
  startDate: string;
  endDate: string;
}

export interface ChefContent {
  id: string;
  chefId: string;
  type: 'recipe' | 'technique' | 'story' | 'video' | 'ebook' | 'course';
  title: string;
  description: string;
  content: string;
  tags: string[];
  difficulty: string;
  timeRequired: number;
  price: number;
  downloads: number;
  views: number;
  rating: number;
  revenue: number;
  createdAt: string;
  status: 'draft' | 'published' | 'archived';
}

export interface LicensingInfo {
  type: 'exclusive' | 'non_exclusive' | 'limited';
  duration: number;
  territories: string[];
  platforms: string[];
  revenueShare: number;
  restrictions: string[];
  renewalTerms: string;
}

export interface Subscription {
  id: string;
  userId: string;
  tierId: string;
  status: 'active' | 'cancelled' | 'expired' | 'paused';
  startDate: string;
  endDate: string;
  billingCycle: 'monthly' | 'yearly';
  price: number;
  features: string[];
  paymentMethod: string;
  lastPayment: string;
  nextPayment: string;
  autoRenew: boolean;
}

export interface RevenueTransaction {
  id: string;
  type:
    | 'affiliate_commission'
    | 'subscription'
    | 'chef_partnership'
    | 'grocery_deal'
    | 'content_sale';
  amount: number;
  currency: string;
  partnerId?: string;
  userId: string;
  description: string;
  metadata: Record<string, any>;
  timestamp: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
}

export interface RevenueAnalytics {
  totalRevenue: number;
  monthlyRevenue: number;
  yearlyRevenue: number;
  revenueBySource: Record<string, number>;
  revenueByPartner: Record<string, number>;
  topPerformingContent: ChefContent[];
  conversionRates: Record<string, number>;
  averageOrderValue: number;
  customerLifetimeValue: number;
  churnRate: number;
  growthRate: number;
}

export interface MonetizationConfig {
  affiliatePartners: AffiliatePartner[];
  chefPartnerships: ChefPartnership[];
  subscriptionTiers: SubscriptionTier[];
  commissionRates: Record<string, number>;
  revenueGoals: {
    monthly: number;
    yearly: number;
  };
  trackingEnabled: boolean;
  analyticsEnabled: boolean;
}

export class MonetizationSystem {
  private config: MonetizationConfig;
  private affiliatePartners: Map<string, AffiliatePartner> = new Map();
  private chefPartnerships: Map<string, ChefPartnership> = new Map();
  private subscriptions: Map<string, Subscription> = new Map();
  private affiliateLinks: Map<string, AffiliateLink> = new Map();
  private groceryDeals: Map<string, GroceryDeal> = new Map();
  private revenueTransactions: RevenueTransaction[] = [];
  private isTracking: boolean = false;

  constructor() {
    this.config = this.initializeConfig();
    this.initializePartners();
  }

  /**
   * Initialize monetization configuration
   */
  private initializeConfig(): MonetizationConfig {
    return {
      affiliatePartners: [],
      chefPartnerships: [],
      subscriptionTiers: [
        {
          id: 'basic',
          name: 'Basic',
          price: 9.99,
          features: [
            'Unlimited recipes',
            'Basic meal planning',
            'Grocery lists',
          ],
          maxRecipes: 1000,
          maxUsers: 1,
          prioritySupport: false,
        },
        {
          id: 'premium',
          name: 'Premium',
          price: 19.99,
          features: [
            'Everything in Basic',
            'AI meal recommendations',
            'Chef partnerships',
            'Priority support',
          ],
          maxRecipes: 5000,
          maxUsers: 5,
          prioritySupport: true,
        },
        {
          id: 'enterprise',
          name: 'Enterprise',
          price: 49.99,
          features: [
            'Everything in Premium',
            'Custom integrations',
            'White-label options',
            'Dedicated support',
          ],
          maxRecipes: -1,
          maxUsers: -1,
          prioritySupport: true,
        },
      ],
      commissionRates: {
        uber_eats: 0.05,
        doordash: 0.06,
        grubhub: 0.04,
        amazon_fresh: 0.03,
        instacart: 0.04,
        chef_partnership: 0.3,
        grocery_deal: 0.08,
      },
      revenueGoals: {
        monthly: 10000,
        yearly: 120000,
      },
      trackingEnabled: true,
      analyticsEnabled: true,
    };
  }

  /**
   * Initialize affiliate partners
   */
  private initializePartners(): void {
    // Delivery partners
    const deliveryPartners: DeliveryPartner[] = [
      {
        id: 'uber_eats',
        name: 'Uber Eats',
        type: 'delivery',
        apiEndpoint: 'https://api.ubereats.com/v1',
        apiKey: process.env.UBER_EATS_API_KEY || '',
        commissionRate: 0.05,
        baseUrl: 'https://ubereats.com',
        trackingId: 'UE_123456',
        active: true,
        lastSync: new Date().toISOString(),
        supportedCuisines: [
          'mexican',
          'italian',
          'chinese',
          'indian',
          'american',
        ],
        deliveryAreas: ['US', 'CA', 'UK', 'AU'],
        averageDeliveryTime: 30,
        minimumOrder: 15,
        deliveryFee: 2.99,
        rating: 4.5,
      },
      {
        id: 'doordash',
        name: 'DoorDash',
        type: 'delivery',
        apiEndpoint: 'https://api.doordash.com/v1',
        apiKey: process.env.DOORDASH_API_KEY || '',
        commissionRate: 0.06,
        baseUrl: 'https://doordash.com',
        trackingId: 'DD_789012',
        active: true,
        lastSync: new Date().toISOString(),
        supportedCuisines: [
          'mexican',
          'italian',
          'chinese',
          'indian',
          'american',
          'thai',
        ],
        deliveryAreas: ['US', 'CA'],
        averageDeliveryTime: 25,
        minimumOrder: 12,
        deliveryFee: 1.99,
        rating: 4.3,
      },
    ];

    // Grocery partners
    const groceryPartners: GroceryPartner[] = [
      {
        id: 'amazon_fresh',
        name: 'Amazon Fresh',
        type: 'grocery',
        apiEndpoint: 'https://api.amazon.com/fresh/v1',
        apiKey: process.env.AMAZON_FRESH_API_KEY || '',
        commissionRate: 0.03,
        baseUrl: 'https://amazon.com/fresh',
        trackingId: 'AF_345678',
        active: true,
        lastSync: new Date().toISOString(),
        supportedCategories: ['produce', 'meat', 'dairy', 'pantry', 'frozen'],
        storeLocations: ['US', 'CA', 'UK', 'DE', 'FR'],
        onlineOrdering: true,
        pickupAvailable: true,
        deliveryAvailable: true,
      },
      {
        id: 'instacart',
        name: 'Instacart',
        type: 'grocery',
        apiEndpoint: 'https://api.instacart.com/v1',
        apiKey: process.env.INSTACART_API_KEY || '',
        commissionRate: 0.04,
        baseUrl: 'https://instacart.com',
        trackingId: 'IC_901234',
        active: true,
        lastSync: new Date().toISOString(),
        supportedCategories: [
          'produce',
          'meat',
          'dairy',
          'pantry',
          'frozen',
          'health',
        ],
        storeLocations: ['US', 'CA'],
        onlineOrdering: true,
        pickupAvailable: true,
        deliveryAvailable: true,
      },
    ];

    // Add partners to maps
    [...deliveryPartners, ...groceryPartners].forEach(partner => {
      this.affiliatePartners.set(partner.id, partner);
    });
  }

  /**
   * Start monetization tracking
   */
  async startTracking(): Promise<void> {
    if (this.isTracking) {
      logger.warn('Monetization tracking is already running');
      return;
    }

    logger.info('Starting monetization tracking');
    this.isTracking = true;

    // Start periodic revenue calculation
    setInterval(async () => {
      await this.calculateRevenue();
    }, 300000); // Every 5 minutes

    // Start periodic deal updates
    setInterval(async () => {
      await this.updateGroceryDeals();
    }, 3600000); // Every hour

    logger.info('Monetization tracking started');
  }

  /**
   * Stop monetization tracking
   */
  async stopTracking(): Promise<void> {
    if (!this.isTracking) {
      logger.warn('Monetization tracking is not running');
      return;
    }

    logger.info('Stopping monetization tracking');
    this.isTracking = false;
    logger.info('Monetization tracking stopped');
  }

  /**
   * Generate affiliate link
   */
  async generateAffiliateLink(
    partnerId: string,
    recipeId: string,
    userId: string,
    originalUrl: string
  ): Promise<AffiliateLink> {
    const partner = this.affiliatePartners.get(partnerId);
    if (!partner) {
      throw new Error('Affiliate partner not found');
    }

    const affiliateLink: AffiliateLink = {
      id: `affiliate_${partnerId}_${recipeId}_${Date.now()}`,
      partnerId,
      recipeId,
      userId,
      originalUrl,
      affiliateUrl: this.buildAffiliateUrl(partner, originalUrl),
      clickCount: 0,
      conversionCount: 0,
      revenue: 0,
      commission: 0,
      createdAt: new Date().toISOString(),
      lastClicked: new Date().toISOString(),
      status: 'active',
    };

    this.affiliateLinks.set(affiliateLink.id, affiliateLink);

    logger.info('Affiliate link generated', {
      partnerId,
      recipeId,
      userId,
      affiliateUrl: affiliateLink.affiliateUrl,
    });

    return affiliateLink;
  }

  /**
   * Track affiliate link click
   */
  async trackAffiliateClick(linkId: string): Promise<void> {
    const link = this.affiliateLinks.get(linkId);
    if (!link) {
      logger.warn('Affiliate link not found', { linkId });
      return;
    }

    link.clickCount++;
    link.lastClicked = new Date().toISOString();

    logger.info('Affiliate link clicked', {
      linkId,
      clickCount: link.clickCount,
    });
  }

  /**
   * Track affiliate conversion
   */
  async trackAffiliateConversion(
    linkId: string,
    orderValue: number
  ): Promise<void> {
    const link = this.affiliateLinks.get(linkId);
    if (!link) {
      logger.warn('Affiliate link not found', { linkId });
      return;
    }

    const partner = this.affiliatePartners.get(link.partnerId);
    if (!partner) {
      logger.warn('Affiliate partner not found', { partnerId: link.partnerId });
      return;
    }

    const commission = orderValue * partner.commissionRate;

    link.conversionCount++;
    link.revenue += orderValue;
    link.commission += commission;

    // Record revenue transaction
    const transaction: RevenueTransaction = {
      id: `transaction_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: 'affiliate_commission',
      amount: commission,
      currency: 'USD',
      partnerId: link.partnerId,
      userId: link.userId,
      description: `Commission from ${partner.name} for recipe ${link.recipeId}`,
      metadata: {
        orderValue,
        commissionRate: partner.commissionRate,
        linkId,
      },
      timestamp: new Date().toISOString(),
      status: 'completed',
    };

    this.revenueTransactions.push(transaction);

    logger.info('Affiliate conversion tracked', {
      linkId,
      orderValue,
      commission,
      partnerName: partner.name,
    });
  }

  /**
   * Create grocery deal
   */
  async createGroceryDeal(
    dealData: Omit<GroceryDeal, 'id' | 'createdAt' | 'status'>
  ): Promise<GroceryDeal> {
    const deal: GroceryDeal = {
      ...dealData,
      id: `deal_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString(),
      status: 'active',
    };

    this.groceryDeals.set(deal.id, deal);

    logger.info('Grocery deal created', {
      dealId: deal.id,
      title: deal.title,
      discount: deal.discount,
    });

    return deal;
  }

  /**
   * Track grocery deal click
   */
  async trackGroceryDealClick(dealId: string): Promise<void> {
    const deal = this.groceryDeals.get(dealId);
    if (!deal) {
      logger.warn('Grocery deal not found', { dealId });
      return;
    }

    deal.clickCount++;

    logger.info('Grocery deal clicked', {
      dealId,
      clickCount: deal.clickCount,
    });
  }

  /**
   * Track grocery deal conversion
   */
  async trackGroceryDealConversion(
    dealId: string,
    orderValue: number
  ): Promise<void> {
    const deal = this.groceryDeals.get(dealId);
    if (!deal) {
      logger.warn('Grocery deal not found', { dealId });
      return;
    }

    const partner = this.affiliatePartners.get(deal.partnerId);
    if (!partner) {
      logger.warn('Affiliate partner not found', { partnerId: deal.partnerId });
      return;
    }

    const commission = orderValue * partner.commissionRate;

    deal.conversionCount++;
    deal.revenue += orderValue;
    deal.commission += commission;

    // Record revenue transaction
    const transaction: RevenueTransaction = {
      id: `transaction_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: 'grocery_deal',
      amount: commission,
      currency: 'USD',
      partnerId: deal.partnerId,
      userId: 'system',
      description: `Commission from grocery deal ${deal.title}`,
      metadata: {
        orderValue,
        commissionRate: partner.commissionRate,
        dealId,
      },
      timestamp: new Date().toISOString(),
      status: 'completed',
    };

    this.revenueTransactions.push(transaction);

    logger.info('Grocery deal conversion tracked', {
      dealId,
      orderValue,
      commission,
    });
  }

  /**
   * Create chef partnership
   */
  async createChefPartnership(
    partnershipData: Omit<ChefPartnership, 'id' | 'revenue' | 'active'>
  ): Promise<ChefPartnership> {
    const partnership: ChefPartnership = {
      ...partnershipData,
      id: `chef_partnership_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      revenue: 0,
      active: true,
    };

    this.chefPartnerships.set(partnership.id, partnership);

    logger.info('Chef partnership created', {
      partnershipId: partnership.id,
      chefName: partnership.chefName,
      partnershipType: partnership.partnershipType,
    });

    return partnership;
  }

  /**
   * Create chef content
   */
  async createChefContent(
    contentData: Omit<
      ChefContent,
      | 'id'
      | 'downloads'
      | 'views'
      | 'rating'
      | 'revenue'
      | 'createdAt'
      | 'status'
    >
  ): Promise<ChefContent> {
    const content: ChefContent = {
      ...contentData,
      id: `chef_content_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      downloads: 0,
      views: 0,
      rating: 0,
      revenue: 0,
      createdAt: new Date().toISOString(),
      status: 'draft',
    };

    // Add to chef partnership
    const partnership = this.chefPartnerships.get(contentData.chefId);
    if (partnership) {
      partnership.content.push(content);
    }

    logger.info('Chef content created', {
      contentId: content.id,
      chefId: content.chefId,
      type: content.type,
      title: content.title,
    });

    return content;
  }

  /**
   * Track chef content purchase
   */
  async trackChefContentPurchase(
    contentId: string,
    userId: string,
    price: number
  ): Promise<void> {
    const content = this.findChefContent(contentId);
    if (!content) {
      logger.warn('Chef content not found', { contentId });
      return;
    }

    const partnership = this.chefPartnerships.get(content.chefId);
    if (!partnership) {
      logger.warn('Chef partnership not found', { chefId: content.chefId });
      return;
    }

    const revenueShare = price * partnership.revenueShare;

    content.downloads++;
    content.revenue += price;
    partnership.revenue += revenueShare;

    // Record revenue transaction
    const transaction: RevenueTransaction = {
      id: `transaction_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: 'chef_partnership',
      amount: revenueShare,
      currency: 'USD',
      partnerId: partnership.id,
      userId,
      description: `Revenue share from chef content ${content.title}`,
      metadata: {
        contentId,
        price,
        revenueShare,
        chefId: content.chefId,
      },
      timestamp: new Date().toISOString(),
      status: 'completed',
    };

    this.revenueTransactions.push(transaction);

    logger.info('Chef content purchase tracked', {
      contentId,
      userId,
      price,
      revenueShare,
    });
  }

  /**
   * Create subscription
   */
  async createSubscription(
    subscriptionData: Omit<Subscription, 'id' | 'lastPayment' | 'nextPayment'>
  ): Promise<Subscription> {
    const subscription: Subscription = {
      ...subscriptionData,
      id: `subscription_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      lastPayment: new Date().toISOString(),
      nextPayment: this.calculateNextPayment(subscriptionData.billingCycle),
    };

    this.subscriptions.set(subscription.id, subscription);

    // Record revenue transaction
    const transaction: RevenueTransaction = {
      id: `transaction_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: 'subscription',
      amount: subscription.price,
      currency: 'USD',
      userId: subscription.userId,
      description: `Subscription payment for ${subscription.tierId}`,
      metadata: {
        subscriptionId: subscription.id,
        tierId: subscription.tierId,
        billingCycle: subscription.billingCycle,
      },
      timestamp: new Date().toISOString(),
      status: 'completed',
    };

    this.revenueTransactions.push(transaction);

    logger.info('Subscription created', {
      subscriptionId: subscription.id,
      userId: subscription.userId,
      tierId: subscription.tierId,
      price: subscription.price,
    });

    return subscription;
  }

  /**
   * Calculate revenue analytics
   */
  async calculateRevenueAnalytics(): Promise<RevenueAnalytics> {
    const now = new Date();
    const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const oneYearAgo = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);

    const totalRevenue = this.revenueTransactions
      .filter(t => t.status === 'completed')
      .reduce((sum, t) => sum + t.amount, 0);

    const monthlyRevenue = this.revenueTransactions
      .filter(
        t => t.status === 'completed' && new Date(t.timestamp) >= oneMonthAgo
      )
      .reduce((sum, t) => sum + t.amount, 0);

    const yearlyRevenue = this.revenueTransactions
      .filter(
        t => t.status === 'completed' && new Date(t.timestamp) >= oneYearAgo
      )
      .reduce((sum, t) => sum + t.amount, 0);

    const revenueBySource = this.revenueTransactions
      .filter(t => t.status === 'completed')
      .reduce(
        (acc, t) => {
          acc[t.type] = (acc[t.type] || 0) + t.amount;
          return acc;
        },
        {} as Record<string, number>
      );

    const revenueByPartner = this.revenueTransactions
      .filter(t => t.status === 'completed' && t.partnerId)
      .reduce(
        (acc, t) => {
          acc[t.partnerId!] = (acc[t.partnerId!] || 0) + t.amount;
          return acc;
        },
        {} as Record<string, number>
      );

    const topPerformingContent = Array.from(this.chefPartnerships.values())
      .flatMap(p => p.content)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10);

    const conversionRates = this.calculateConversionRates();

    const averageOrderValue = this.calculateAverageOrderValue();
    const customerLifetimeValue = this.calculateCustomerLifetimeValue();
    const churnRate = this.calculateChurnRate();
    const growthRate = this.calculateGrowthRate();

    return {
      totalRevenue,
      monthlyRevenue,
      yearlyRevenue,
      revenueBySource,
      revenueByPartner,
      topPerformingContent,
      conversionRates,
      averageOrderValue,
      customerLifetimeValue,
      churnRate,
      growthRate,
    };
  }

  /**
   * Calculate conversion rates
   */
  private calculateConversionRates(): Record<string, number> {
    const rates: Record<string, number> = {};

    // Affiliate link conversion rates
    for (const link of this.affiliateLinks.values()) {
      if (link.clickCount > 0) {
        rates[`affiliate_${link.partnerId}`] =
          link.conversionCount / link.clickCount;
      }
    }

    // Grocery deal conversion rates
    for (const deal of this.groceryDeals.values()) {
      if (deal.clickCount > 0) {
        rates[`grocery_${deal.partnerId}`] =
          deal.conversionCount / deal.clickCount;
      }
    }

    return rates;
  }

  /**
   * Calculate average order value
   */
  private calculateAverageOrderValue(): number {
    const orders = this.revenueTransactions.filter(
      t => t.type === 'affiliate_commission' || t.type === 'grocery_deal'
    );

    if (orders.length === 0) return 0;

    const totalValue = orders.reduce((sum, t) => {
      const orderValue = t.metadata.orderValue || 0;
      return sum + orderValue;
    }, 0);

    return totalValue / orders.length;
  }

  /**
   * Calculate customer lifetime value
   */
  private calculateCustomerLifetimeValue(): number {
    const userRevenue = this.revenueTransactions
      .filter(t => t.status === 'completed')
      .reduce(
        (acc, t) => {
          acc[t.userId] = (acc[t.userId] || 0) + t.amount;
          return acc;
        },
        {} as Record<string, number>
      );

    const values = Object.values(userRevenue);
    return values.length > 0
      ? values.reduce((sum, v) => sum + v, 0) / values.length
      : 0;
  }

  /**
   * Calculate churn rate
   */
  private calculateChurnRate(): number {
    const activeSubscriptions = Array.from(this.subscriptions.values()).filter(
      s => s.status === 'active'
    );

    const cancelledSubscriptions = Array.from(
      this.subscriptions.values()
    ).filter(s => s.status === 'cancelled');

    const totalSubscriptions =
      activeSubscriptions.length + cancelledSubscriptions.length;

    return totalSubscriptions > 0
      ? cancelledSubscriptions.length / totalSubscriptions
      : 0;
  }

  /**
   * Calculate growth rate
   */
  private calculateGrowthRate(): number {
    const now = new Date();
    const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const twoMonthsAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

    const currentMonthRevenue = this.revenueTransactions
      .filter(
        t => t.status === 'completed' && new Date(t.timestamp) >= oneMonthAgo
      )
      .reduce((sum, t) => sum + t.amount, 0);

    const previousMonthRevenue = this.revenueTransactions
      .filter(
        t =>
          t.status === 'completed' &&
          new Date(t.timestamp) >= twoMonthsAgo &&
          new Date(t.timestamp) < oneMonthAgo
      )
      .reduce((sum, t) => sum + t.amount, 0);

    return previousMonthRevenue > 0
      ? ((currentMonthRevenue - previousMonthRevenue) / previousMonthRevenue) *
          100
      : 0;
  }

  /**
   * Update grocery deals
   */
  private async updateGroceryDeals(): Promise<void> {
    logger.info('Updating grocery deals');

    // This would fetch new deals from partner APIs
    // For now, we'll simulate the update
    for (const deal of this.groceryDeals.values()) {
      if (deal.status === 'active' && new Date(deal.validUntil) < new Date()) {
        deal.status = 'expired';
      }
    }

    logger.info('Grocery deals updated');
  }

  /**
   * Calculate revenue
   */
  private async calculateRevenue(): Promise<void> {
    const analytics = await this.calculateRevenueAnalytics();

    logger.info('Revenue calculated', {
      totalRevenue: analytics.totalRevenue,
      monthlyRevenue: analytics.monthlyRevenue,
      yearlyRevenue: analytics.yearlyRevenue,
    });
  }

  /**
   * Build affiliate URL
   */
  private buildAffiliateUrl(
    partner: AffiliatePartner,
    originalUrl: string
  ): string {
    const url = new URL(originalUrl);
    url.searchParams.set('affiliate_id', partner.trackingId);
    url.searchParams.set('source', 'whats_for_dinner');
    return url.toString();
  }

  /**
   * Find chef content
   */
  private findChefContent(contentId: string): ChefContent | null {
    for (const partnership of this.chefPartnerships.values()) {
      const content = partnership.content.find(c => c.id === contentId);
      if (content) return content;
    }
    return null;
  }

  /**
   * Calculate next payment date
   */
  private calculateNextPayment(billingCycle: 'monthly' | 'yearly'): string {
    const nextPayment = new Date();

    if (billingCycle === 'monthly') {
      nextPayment.setMonth(nextPayment.getMonth() + 1);
    } else {
      nextPayment.setFullYear(nextPayment.getFullYear() + 1);
    }

    return nextPayment.toISOString();
  }

  /**
   * Get affiliate partners
   */
  getAffiliatePartners(): AffiliatePartner[] {
    return Array.from(this.affiliatePartners.values());
  }

  /**
   * Get chef partnerships
   */
  getChefPartnerships(): ChefPartnership[] {
    return Array.from(this.chefPartnerships.values());
  }

  /**
   * Get subscriptions
   */
  getSubscriptions(): Subscription[] {
    return Array.from(this.subscriptions.values());
  }

  /**
   * Get revenue transactions
   */
  getRevenueTransactions(): RevenueTransaction[] {
    return this.revenueTransactions;
  }
}

// Export singleton instance
export const monetizationSystem = new MonetizationSystem();
