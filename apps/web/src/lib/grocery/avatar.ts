/**
 * Avatar System for Grocery Gamification
 * Customizable avatars that evolve with user progress
 */

export interface AvatarPart {
  id: string;
  type: 'head' | 'body' | 'accessory' | 'background';
  name: string;
  icon: string;
  unlocked: boolean;
  unlockedAt?: string;
  pointsRequired?: number;
  levelRequired?: number;
}

export interface Avatar {
  userId: string;
  head: string;
  body: string;
  accessory?: string;
  background: string;
  level: number;
  points: number;
  customizations: Record<string, unknown>;
}

export class AvatarSystem {
  private readonly AVATAR_PARTS: AvatarPart[] = [
    // Heads
    { id: 'head-default', type: 'head', name: 'Default Head', icon: '👤', unlocked: true },
    { id: 'head-chef', type: 'head', name: 'Chef Hat', icon: '👨‍🍳', unlocked: false, pointsRequired: 50 },
    { id: 'head-shopper', type: 'head', name: 'Shopping Expert', icon: '🛒', unlocked: false, pointsRequired: 100 },
    
    // Bodies
    { id: 'body-default', type: 'body', name: 'Default Body', icon: '👕', unlocked: true },
    { id: 'body-apron', type: 'body', name: 'Chef Apron', icon: '👨‍🍳', unlocked: false, pointsRequired: 75 },
    { id: 'body-shopper', type: 'body', name: 'Shopping Bag', icon: '🛍️', unlocked: false, pointsRequired: 150 },
    
    // Accessories
    { id: 'acc-none', type: 'accessory', name: 'None', icon: '', unlocked: true },
    { id: 'acc-glasses', type: 'accessory', name: 'Smart Glasses', icon: '👓', unlocked: false, pointsRequired: 30 },
    { id: 'acc-badge', type: 'accessory', name: 'Achievement Badge', icon: '🏅', unlocked: false, pointsRequired: 200 },
    
    // Backgrounds
    { id: 'bg-default', type: 'background', name: 'Default', icon: '⚪', unlocked: true },
    { id: 'bg-kitchen', type: 'background', name: 'Kitchen', icon: '🍳', unlocked: false, pointsRequired: 25 },
    { id: 'bg-store', type: 'background', name: 'Grocery Store', icon: '🏪', unlocked: false, pointsRequired: 50 },
    { id: 'bg-garden', type: 'background', name: 'Garden', icon: '🌱', unlocked: false, pointsRequired: 100 },
  ];

  async getUserAvatar(userId: string, points: number, level: number): Promise<Avatar> {
    // Get unlocked parts based on points and level
    const unlockedParts = this.getUnlockedParts(points, level);
    
    // Default avatar
    const avatar: Avatar = {
      userId,
      head: 'head-default',
      body: 'body-default',
      background: 'bg-default',
      level,
      points,
      customizations: {},
    };

    // Auto-equip best unlocked parts
    const bestHead = unlockedParts.filter(p => p.type === 'head').sort((a, b) => (b.pointsRequired || 0) - (a.pointsRequired || 0))[0];
    const bestBody = unlockedParts.filter(p => p.type === 'body').sort((a, b) => (b.pointsRequired || 0) - (a.pointsRequired || 0))[0];
    const bestBg = unlockedParts.filter(p => p.type === 'background').sort((a, b) => (b.pointsRequired || 0) - (a.pointsRequired || 0))[0];

    if (bestHead) avatar.head = bestHead.id;
    if (bestBody) avatar.body = bestBody.id;
    if (bestBg) avatar.background = bestBg.id;

    // TODO: Load from database for user customizations
    return avatar;
  }

  getUnlockedParts(points: number, level: number): AvatarPart[] {
    return this.AVATAR_PARTS.filter(part => {
      if (part.unlocked) return true;
      if (part.pointsRequired && points >= part.pointsRequired) return true;
      if (part.levelRequired && level >= part.levelRequired) return true;
      return false;
    });
  }

  getAllParts(): AvatarPart[] {
    return this.AVATAR_PARTS;
  }

  async customizeAvatar(userId: string, customizations: Partial<Avatar>): Promise<Avatar> {
    // TODO: Save to database
    // For now, return updated avatar
    const current = await this.getUserAvatar(userId, 0, 0);
    return { ...current, ...customizations };
  }

  renderAvatar(avatar: Avatar): string {
    // Generate avatar representation
    const headPart = this.AVATAR_PARTS.find(p => p.id === avatar.head);
    const bodyPart = this.AVATAR_PARTS.find(p => p.id === avatar.body);
    const bgPart = this.AVATAR_PARTS.find(p => p.id === avatar.background);
    
    return `${bgPart?.icon || ''} ${headPart?.icon || '👤'} ${bodyPart?.icon || '👕'}`;
  }
}

export const avatarSystem = new AvatarSystem();
