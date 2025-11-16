/**
 * Pantry Intelligence Service
 * Smart pantry management with expiration tracking and waste reduction
 */

export interface PantryItem {
  id?: string;
  ingredient: string;
  quantity: number;
  unit: string;
  expirationDate?: string;
  category?: string;
  addedDate?: string;
}

export interface ExpiringItem extends PantryItem {
  daysUntilExpiration: number;
  urgency: 'low' | 'medium' | 'high' | 'expired';
}

/**
 * Calculate days until expiration
 */
export function getDaysUntilExpiration(expirationDate: string): number {
  const expiration = new Date(expirationDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  expiration.setHours(0, 0, 0, 0);
  
  const diffTime = expiration.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays;
}

/**
 * Get expiration urgency level
 */
export function getExpirationUrgency(daysUntilExpiration: number): ExpiringItem['urgency'] {
  if (daysUntilExpiration < 0) return 'expired';
  if (daysUntilExpiration <= 1) return 'high';
  if (daysUntilExpiration <= 3) return 'medium';
  return 'low';
}

/**
 * Filter items that are expiring soon
 */
export function getExpiringItems(
  items: PantryItem[],
  daysThreshold: number = 3
): ExpiringItem[] {
  const expiringItems: ExpiringItem[] = [];

  for (const item of items) {
    if (!item.expirationDate) continue;
    
    const daysUntilExpiration = getDaysUntilExpiration(item.expirationDate);
    
    if (daysUntilExpiration <= daysThreshold) {
      expiringItems.push({
        ...item,
        daysUntilExpiration,
        urgency: getExpirationUrgency(daysUntilExpiration),
      });
    }
  }

  // Sort by urgency (expired first, then by days)
  return expiringItems.sort((a, b) => {
    const urgencyOrder = { expired: 0, high: 1, medium: 2, low: 3 };
    const aOrder = urgencyOrder[a.urgency];
    const bOrder = urgencyOrder[b.urgency];
    
    if (aOrder !== bOrder) {
      return aOrder - bOrder;
    }
    
    return a.daysUntilExpiration - b.daysUntilExpiration;
  });
}

/**
 * Get items that should be used soon (expiring within threshold)
 */
export function getUseSoonItems(
  items: PantryItem[],
  daysThreshold: number = 3
): ExpiringItem[] {
  return getExpiringItems(items, daysThreshold);
}

/**
 * Generate recipe suggestions based on expiring items
 */
export function suggestRecipesForExpiringItems(
  expiringItems: ExpiringItem[]
): string[] {
  // Priority: Use expired/high urgency items first
  const priorityItems = expiringItems
    .filter((item) => item.urgency === 'expired' || item.urgency === 'high')
    .map((item) => item.ingredient);
  
  return priorityItems.slice(0, 5); // Top 5 expiring ingredients
}

/**
 * Calculate waste reduction metrics
 */
export function calculateWasteReduction(
  allItems: PantryItem[],
  usedItems: PantryItem[]
): {
  totalItems: number;
  usedBeforeExpiration: number;
  expiredItems: number;
  wastePercentage: number;
  savedItems: number;
} {
  const totalItems = allItems.length;
  const itemsWithExpiration = allItems.filter((item) => item.expirationDate);
  
  let usedBeforeExpiration = 0;
  let expiredItems = 0;
  
  // Check items that were used
  for (const usedItem of usedItems) {
    if (usedItem.expirationDate) {
      const daysUntilExpiration = getDaysUntilExpiration(usedItem.expirationDate);
      if (daysUntilExpiration > 0) {
        usedBeforeExpiration++;
      } else {
        expiredItems++;
      }
    }
  }
  
  // Check currently expired items
  const now = new Date();
  for (const item of itemsWithExpiration) {
    if (item.expirationDate && new Date(item.expirationDate) < now) {
      // Check if it's in used items
      const wasUsed = usedItems.some((used) => used.id === item.id);
      if (!wasUsed) {
        expiredItems++;
      }
    }
  }
  
  const savedItems = itemsWithExpiration.length - expiredItems;
  const wastePercentage = itemsWithExpiration.length > 0
    ? (expiredItems / itemsWithExpiration.length) * 100
    : 0;
  
  return {
    totalItems,
    usedBeforeExpiration,
    expiredItems,
    wastePercentage: Math.round(wastePercentage * 10) / 10,
    savedItems,
  };
}

/**
 * Estimate expiration date based on item type
 */
export function estimateExpirationDate(
  ingredient: string,
  addedDate?: string
): string | null {
  const normalized = ingredient.toLowerCase();
  const added = addedDate ? new Date(addedDate) : new Date();
  
  // Common expiration estimates (in days)
  const expirationRules: Record<string, number> = {
    // Meat (3-5 days)
    chicken: 3,
    beef: 5,
    pork: 5,
    fish: 2,
    seafood: 2,
    
    // Dairy (5-7 days)
    milk: 7,
    cheese: 14,
    yogurt: 14,
    butter: 30,
    
    // Produce (varies)
    lettuce: 7,
    spinach: 5,
    tomato: 7,
    onion: 30,
    garlic: 60,
    potato: 30,
    carrot: 14,
    'bell pepper': 7,
    mushroom: 5,
    
    // Pantry (longer)
    rice: 365,
    pasta: 365,
    flour: 180,
    sugar: 730,
  };
  
  for (const [key, days] of Object.entries(expirationRules)) {
    if (normalized.includes(key)) {
      const expiration = new Date(added);
      expiration.setDate(expiration.getDate() + days);
      return expiration.toISOString().split('T')[0];
    }
  }
  
  // Default: 7 days for unknown items
  const defaultExpiration = new Date(added);
  defaultExpiration.setDate(defaultExpiration.getDate() + 7);
  return defaultExpiration.toISOString().split('T')[0];
}

/**
 * Get pantry efficiency score (0-100)
 */
export function getPantryEfficiencyScore(
  allItems: PantryItem[],
  usedItems: PantryItem[]
): number {
  const metrics = calculateWasteReduction(allItems, usedItems);
  
  if (metrics.totalItems === 0) return 100;
  
  // Factors:
  // - Waste percentage (lower is better)
  // - Items used before expiration (higher is better)
  
  const wastePenalty = metrics.wastePercentage;
  const usageBonus = (metrics.usedBeforeExpiration / metrics.totalItems) * 100;
  
  const score = Math.max(0, Math.min(100, usageBonus - wastePenalty + 50));
  
  return Math.round(score);
}
