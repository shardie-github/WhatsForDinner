/**
 * Customer Engagement Scoring System
 * Tracks and scores customer engagement to identify opportunities
 */

export interface EngagementMetrics {
  userId: string;
  loginFrequency: number; // Logins per week
  featureUsage: Record<string, number>; // Feature -> usage count
  sessionDuration: number; // Average minutes
  contentConsumption: number; // Pages/content viewed
  socialInteractions: number; // Shares, comments, etc.
  purchases: number;
  lastActivity: Date;
  daysActive: number; // Days active in last 30
}

export interface EngagementScore {
  userId: string;
  score: number; // 0-100
  level: 'high' | 'medium' | 'low' | 'at_risk';
  factors: {
    activity: number;
    usage: number;
    value: number;
    recency: number;
  };
  recommendations: string[];
  monetizationPotential: number; // 0-100
}

class EngagementScorer {
  /**
   * Calculate comprehensive engagement score
   */
  calculateScore(metrics: EngagementMetrics): EngagementScore {
    // Activity score (0-25)
    const activityScore = this.calculateActivityScore(metrics);
    
    // Usage score (0-25)
    const usageScore = this.calculateUsageScore(metrics);
    
    // Value score (0-25)
    const valueScore = this.calculateValueScore(metrics);
    
    // Recency score (0-25)
    const recencyScore = this.calculateRecencyScore(metrics);

    const totalScore = activityScore + usageScore + valueScore + recencyScore;
    
    const level = this.determineLevel(totalScore);
    const recommendations = this.generateRecommendations(metrics, totalScore);
    const monetizationPotential = this.calculateMonetizationPotential(metrics, totalScore);

    return {
      userId: metrics.userId,
      score: totalScore,
      level,
      factors: {
        activity: activityScore,
        usage: usageScore,
        value: valueScore,
        recency: recencyScore,
      },
      recommendations,
      monetizationPotential,
    };
  }

  private calculateActivityScore(metrics: EngagementMetrics): number {
    let score = 0;

    // Login frequency (max 10 points)
    if (metrics.loginFrequency >= 5) score += 10;
    else if (metrics.loginFrequency >= 3) score += 7;
    else if (metrics.loginFrequency >= 1) score += 4;

    // Days active (max 10 points)
    const activeRatio = metrics.daysActive / 30;
    score += activeRatio * 10;

    // Session duration (max 5 points)
    if (metrics.sessionDuration > 30) score += 5;
    else if (metrics.sessionDuration > 15) score += 3;
    else if (metrics.sessionDuration > 5) score += 1;

    return Math.min(score, 25);
  }

  private calculateUsageScore(metrics: EngagementMetrics): number {
    const featureCount = Object.keys(metrics.featureUsage).length;
    const totalUsage = Object.values(metrics.featureUsage).reduce((a, b) => a + b, 0);

    // Feature diversity (max 10 points)
    let score = Math.min(featureCount * 2, 10);

    // Total usage (max 15 points)
    if (totalUsage > 100) score += 15;
    else if (totalUsage > 50) score += 10;
    else if (totalUsage > 20) score += 5;

    return Math.min(score, 25);
  }

  private calculateValueScore(metrics: EngagementMetrics): number {
    let score = 0;

    // Purchases (max 15 points)
    score += Math.min(metrics.purchases * 3, 15);

    // Content consumption (max 10 points)
    if (metrics.contentConsumption > 50) score += 10;
    else if (metrics.contentConsumption > 20) score += 6;
    else if (metrics.contentConsumption > 10) score += 3;

    return Math.min(score, 25);
  }

  private calculateRecencyScore(metrics: EngagementMetrics): number {
    const daysSinceActivity = Math.floor(
      (Date.now() - metrics.lastActivity.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (daysSinceActivity === 0) return 25;
    if (daysSinceActivity <= 1) return 20;
    if (daysSinceActivity <= 3) return 15;
    if (daysSinceActivity <= 7) return 10;
    if (daysSinceActivity <= 14) return 5;
    return 0;
  }

  private determineLevel(score: number): EngagementScore['level'] {
    if (score >= 75) return 'high';
    if (score >= 50) return 'medium';
    if (score >= 25) return 'low';
    return 'at_risk';
  }

  private generateRecommendations(
    metrics: EngagementMetrics,
    score: number
  ): string[] {
    const recommendations: string[] = [];

    if (metrics.loginFrequency < 2) {
      recommendations.push('Increase login frequency with email reminders');
    }

    if (Object.keys(metrics.featureUsage).length < 3) {
      recommendations.push('Promote underused features through in-app tips');
    }

    if (metrics.purchases === 0 && score > 50) {
      recommendations.push('High engagement - offer premium upgrade');
    }

    if (metrics.daysActive < 10) {
      recommendations.push('Re-engage with personalized content');
    }

    if (score < 25) {
      recommendations.push('Send win-back campaign with special offer');
    }

    return recommendations;
  }

  private calculateMonetizationPotential(
    metrics: EngagementMetrics,
    score: number
  ): number {
    let potential = score; // Base on engagement score

    // Increase if high engagement but no purchases
    if (score > 60 && metrics.purchases === 0) {
      potential += 20;
    }

    // Increase if using many features (likely to value premium)
    if (Object.keys(metrics.featureUsage).length > 5) {
      potential += 10;
    }

    // Increase if frequent user
    if (metrics.loginFrequency > 4) {
      potential += 10;
    }

    return Math.min(potential, 100);
  }

  /**
   * Identify customers ready for upsell
   */
  identifyUpsellCandidates(scores: EngagementScore[]): EngagementScore[] {
    return scores.filter(
      score => score.monetizationPotential > 70 && score.score > 60
    );
  }

  /**
   * Identify at-risk customers
   */
  identifyAtRiskCustomers(scores: EngagementScore[]): EngagementScore[] {
    return scores.filter(score => score.level === 'at_risk');
  }
}

export const engagementScorer = new EngagementScorer();
