/**
 * Admin Dashboard System
 *
 * Implements comprehensive admin dashboards with:
 * - User metrics and analytics
 * - Job queue monitoring
 * - Billing and revenue tracking
 * - Role-based access control (RBAC)
 * - Audit logging and security monitoring
 */

import { logger } from './logger';
import { monitoringSystem } from './monitoring';
import { observabilitySystem } from './observability';
import { aiMonitoringAgent } from './aiMonitoringAgent';
import { performanceOptimizationSystem } from './performanceOptimizationSystem';

export interface UserMetrics {
  totalUsers: number;
  activeUsers: number;
  newUsers: number;
  userGrowth: number;
  userRetention: number;
  averageSessionDuration: number;
  topUserSegments: UserSegment[];
  userActivity: UserActivity[];
}

export interface UserSegment {
  id: string;
  name: string;
  description: string;
  userCount: number;
  percentage: number;
  characteristics: string[];
}

export interface UserActivity {
  timestamp: string;
  userId: string;
  action: string;
  category: 'auth' | 'recipe' | 'pantry' | 'shopping' | 'admin';
  metadata: Record<string, any>;
}

export interface JobQueueMetrics {
  totalJobs: number;
  pendingJobs: number;
  runningJobs: number;
  completedJobs: number;
  failedJobs: number;
  averageProcessingTime: number;
  queueHealth: 'healthy' | 'degraded' | 'critical';
  jobTypes: JobTypeMetrics[];
}

export interface JobTypeMetrics {
  type: string;
  count: number;
  successRate: number;
  averageTime: number;
  lastRun: string;
}

export interface BillingMetrics {
  totalRevenue: number;
  monthlyRevenue: number;
  revenueGrowth: number;
  activeSubscriptions: number;
  subscriptionRevenue: number;
  affiliateRevenue: number;
  averageRevenuePerUser: number;
  churnRate: number;
  revenueBySource: RevenueSource[];
}

export interface RevenueSource {
  source: string;
  amount: number;
  percentage: number;
  trend: 'up' | 'down' | 'stable';
}

export interface SystemHealth {
  overall: 'healthy' | 'degraded' | 'critical';
  components: ComponentHealth[];
  alerts: SystemAlert[];
  uptime: number;
  lastIncident: string | null;
}

export interface ComponentHealth {
  name: string;
  status: 'healthy' | 'degraded' | 'critical' | 'unknown';
  responseTime: number;
  uptime: number;
  lastCheck: string;
  dependencies: string[];
}

export interface SystemAlert {
  id: string;
  title: string;
  message: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  category: 'performance' | 'security' | 'billing' | 'user' | 'system';
  timestamp: string;
  resolved: boolean;
  resolvedAt?: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  userId: string;
  action: string;
  resource: string;
  result: 'success' | 'failure' | 'error';
  ipAddress: string;
  userAgent: string;
  metadata: Record<string, any>;
}

export interface RBACPermission {
  id: string;
  name: string;
  description: string;
  resource: string;
  action: string;
  conditions?: Record<string, any>;
}

export interface RBACRole {
  id: string;
  name: string;
  description: string;
  permissions: string[];
  level: number;
  inheritsFrom?: string[];
}

export interface RBACUser {
  id: string;
  email: string;
  roles: string[];
  permissions: string[];
  lastLogin: string;
  isActive: boolean;
}

export class AdminDashboardSystem {
  private userMetrics: UserMetrics | null = null;
  private jobQueueMetrics: JobQueueMetrics | null = null;
  private billingMetrics: BillingMetrics | null = null;
  private systemHealth: SystemHealth | null = null;
  private auditLogs: AuditLog[] = [];
  private rbacRoles: Map<string, RBACRole> = new Map();
  private rbacPermissions: Map<string, RBACPermission> = new Map();
  private rbacUsers: Map<string, RBACUser> = new Map();
  private isMonitoring: boolean = false;

  constructor() {
    this.initializeRBAC();
  }

  /**
   * Initialize Role-Based Access Control
   */
  private initializeRBAC(): void {
    // Initialize permissions
    const permissions: RBACPermission[] = [
      {
        id: 'view_dashboard',
        name: 'View Dashboard',
        description: 'View admin dashboard',
        resource: 'dashboard',
        action: 'read',
      },
      {
        id: 'manage_users',
        name: 'Manage Users',
        description: 'Create, update, delete users',
        resource: 'users',
        action: 'write',
      },
      {
        id: 'view_analytics',
        name: 'View Analytics',
        description: 'View user and system analytics',
        resource: 'analytics',
        action: 'read',
      },
      {
        id: 'manage_billing',
        name: 'Manage Billing',
        description: 'View and manage billing information',
        resource: 'billing',
        action: 'write',
      },
      {
        id: 'manage_system',
        name: 'Manage System',
        description: 'Manage system configuration and settings',
        resource: 'system',
        action: 'write',
      },
      {
        id: 'view_audit_logs',
        name: 'View Audit Logs',
        description: 'View system audit logs',
        resource: 'audit',
        action: 'read',
      },
    ];

    permissions.forEach(permission => {
      this.rbacPermissions.set(permission.id, permission);
    });

    // Initialize roles
    const roles: RBACRole[] = [
      {
        id: 'super_admin',
        name: 'Super Administrator',
        description: 'Full system access',
        permissions: permissions.map(p => p.id),
        level: 100,
      },
      {
        id: 'admin',
        name: 'Administrator',
        description: 'Administrative access',
        permissions: [
          'view_dashboard',
          'manage_users',
          'view_analytics',
          'view_audit_logs',
        ],
        level: 80,
      },
      {
        id: 'billing_admin',
        name: 'Billing Administrator',
        description: 'Billing and revenue management',
        permissions: ['view_dashboard', 'manage_billing', 'view_analytics'],
        level: 60,
      },
      {
        id: 'support',
        name: 'Support Agent',
        description: 'Customer support access',
        permissions: ['view_dashboard', 'view_analytics'],
        level: 40,
      },
      {
        id: 'viewer',
        name: 'Viewer',
        description: 'Read-only access',
        permissions: ['view_dashboard', 'view_analytics'],
        level: 20,
      },
    ];

    roles.forEach(role => {
      this.rbacRoles.set(role.id, role);
    });
  }

  /**
   * Start admin dashboard monitoring
   */
  async startMonitoring(): Promise<void> {
    if (this.isMonitoring) {
      logger.warn('Admin dashboard monitoring is already running');
      return;
    }

    logger.info('Starting admin dashboard monitoring');
    this.isMonitoring = true;

    // Start data collection
    setInterval(async () => {
      await this.collectDashboardData();
    }, 30000); // Every 30 seconds

    // Start audit log collection
    setInterval(async () => {
      await this.collectAuditLogs();
    }, 60000); // Every minute

    logger.info('Admin dashboard monitoring started');
  }

  /**
   * Stop admin dashboard monitoring
   */
  async stopMonitoring(): Promise<void> {
    if (!this.isMonitoring) {
      logger.warn('Admin dashboard monitoring is not running');
      return;
    }

    logger.info('Stopping admin dashboard monitoring');
    this.isMonitoring = false;
    logger.info('Admin dashboard monitoring stopped');
  }

  /**
   * Collect dashboard data
   */
  private async collectDashboardData(): Promise<void> {
    try {
      // Collect user metrics
      this.userMetrics = await this.collectUserMetrics();

      // Collect job queue metrics
      this.jobQueueMetrics = await this.collectJobQueueMetrics();

      // Collect billing metrics
      this.billingMetrics = await this.collectBillingMetrics();

      // Collect system health
      this.systemHealth = await this.collectSystemHealth();
    } catch (error) {
      logger.error('Failed to collect dashboard data', { error });
    }
  }

  /**
   * Collect user metrics
   */
  private async collectUserMetrics(): Promise<UserMetrics> {
    // This would integrate with actual user data
    // For now, we'll simulate the data
    const mockUserMetrics: UserMetrics = {
      totalUsers: 1250,
      activeUsers: 890,
      newUsers: 45,
      userGrowth: 12.5,
      userRetention: 78.3,
      averageSessionDuration: 18.5,
      topUserSegments: [
        {
          id: 'food_enthusiasts',
          name: 'Food Enthusiasts',
          description: 'Users who frequently use recipe features',
          userCount: 320,
          percentage: 25.6,
          characteristics: ['high_recipe_usage', 'frequent_pantry_updates'],
        },
        {
          id: 'casual_cooks',
          name: 'Casual Cooks',
          description: 'Users who occasionally use the app',
          userCount: 450,
          percentage: 36.0,
          characteristics: ['moderate_usage', 'weekend_activity'],
        },
        {
          id: 'health_conscious',
          name: 'Health Conscious',
          description: 'Users focused on healthy eating',
          userCount: 280,
          percentage: 22.4,
          characteristics: ['dietary_restrictions', 'nutritional_focus'],
        },
      ],
      userActivity: [
        {
          timestamp: new Date().toISOString(),
          userId: 'user_123',
          action: 'recipe_generated',
          category: 'recipe',
          metadata: { recipeId: 'recipe_456', cuisine: 'italian' },
        },
        {
          timestamp: new Date(Date.now() - 300000).toISOString(),
          userId: 'user_789',
          action: 'pantry_updated',
          category: 'pantry',
          metadata: { itemsAdded: 5, itemsRemoved: 2 },
        },
      ],
    };

    return mockUserMetrics;
  }

  /**
   * Collect job queue metrics
   */
  private async collectJobQueueMetrics(): Promise<JobQueueMetrics> {
    // This would integrate with actual job queue data
    const mockJobQueueMetrics: JobQueueMetrics = {
      totalJobs: 1250,
      pendingJobs: 45,
      runningJobs: 12,
      completedJobs: 1150,
      failedJobs: 43,
      averageProcessingTime: 2.5,
      queueHealth: 'healthy',
      jobTypes: [
        {
          type: 'recipe_generation',
          count: 450,
          successRate: 0.95,
          averageTime: 3.2,
          lastRun: new Date().toISOString(),
        },
        {
          type: 'email_notification',
          count: 320,
          successRate: 0.98,
          averageTime: 0.8,
          lastRun: new Date().toISOString(),
        },
        {
          type: 'data_sync',
          count: 180,
          successRate: 0.92,
          averageTime: 5.1,
          lastRun: new Date().toISOString(),
        },
      ],
    };

    return mockJobQueueMetrics;
  }

  /**
   * Collect billing metrics
   */
  private async collectBillingMetrics(): Promise<BillingMetrics> {
    // This would integrate with actual billing data
    const mockBillingMetrics: BillingMetrics = {
      totalRevenue: 125000,
      monthlyRevenue: 8500,
      revenueGrowth: 15.2,
      activeSubscriptions: 320,
      subscriptionRevenue: 6400,
      affiliateRevenue: 2100,
      averageRevenuePerUser: 100,
      churnRate: 3.2,
      revenueBySource: [
        {
          source: 'subscriptions',
          amount: 6400,
          percentage: 75.3,
          trend: 'up',
        },
        {
          source: 'affiliate_marketing',
          amount: 2100,
          percentage: 24.7,
          trend: 'up',
        },
      ],
    };

    return mockBillingMetrics;
  }

  /**
   * Collect system health
   */
  private async collectSystemHealth(): Promise<SystemHealth> {
    const monitoringStatus = aiMonitoringAgent.getMonitoringStatus();
    const performanceReport =
      performanceOptimizationSystem.getPerformanceReport();

    const components: ComponentHealth[] = [
      {
        name: 'Database',
        status: 'healthy',
        responseTime: 45,
        uptime: 99.9,
        lastCheck: new Date().toISOString(),
        dependencies: ['postgres'],
      },
      {
        name: 'API Server',
        status: 'healthy',
        responseTime: 120,
        uptime: 99.8,
        lastCheck: new Date().toISOString(),
        dependencies: ['database', 'redis'],
      },
      {
        name: 'AI Service',
        status: 'healthy',
        responseTime: 800,
        uptime: 99.5,
        lastCheck: new Date().toISOString(),
        dependencies: ['openai'],
      },
      {
        name: 'Cache Layer',
        status: 'degraded',
        responseTime: 200,
        uptime: 98.2,
        lastCheck: new Date().toISOString(),
        dependencies: ['redis'],
      },
    ];

    const alerts: SystemAlert[] = [
      {
        id: 'alert_1',
        title: 'Cache Hit Rate Low',
        message: 'Cache hit rate has dropped below 70%',
        severity: 'medium',
        category: 'performance',
        timestamp: new Date(Date.now() - 300000).toISOString(),
        resolved: false,
      },
    ];

    const overallHealth = components.every(c => c.status === 'healthy')
      ? 'healthy'
      : components.some(c => c.status === 'critical')
        ? 'critical'
        : 'degraded';

    return {
      overall: overallHealth,
      components,
      alerts,
      uptime: 99.7,
      lastIncident: '2024-01-15T10:30:00Z',
    };
  }

  /**
   * Collect audit logs
   */
  private async collectAuditLogs(): Promise<void> {
    // This would integrate with actual audit log collection
    // For now, we'll simulate audit logs
    const mockAuditLog: AuditLog = {
      id: `audit_${Date.now()}`,
      timestamp: new Date().toISOString(),
      userId: 'admin_123',
      action: 'user_created',
      resource: 'users',
      result: 'success',
      ipAddress: '192.168.1.100',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      metadata: { targetUserId: 'user_456', role: 'viewer' },
    };

    this.auditLogs.push(mockAuditLog);

    // Keep only last 10000 audit logs
    if (this.auditLogs.length > 10000) {
      this.auditLogs = this.auditLogs.slice(-10000);
    }
  }

  /**
   * Get dashboard data
   */
  getDashboardData(): {
    userMetrics: UserMetrics | null;
    jobQueueMetrics: JobQueueMetrics | null;
    billingMetrics: BillingMetrics | null;
    systemHealth: SystemHealth | null;
  } {
    return {
      userMetrics: this.userMetrics,
      jobQueueMetrics: this.jobQueueMetrics,
      billingMetrics: this.billingMetrics,
      systemHealth: this.systemHealth,
    };
  }

  /**
   * Get audit logs
   */
  getAuditLogs(
    limit: number = 100,
    filters?: {
      userId?: string;
      action?: string;
      resource?: string;
      result?: string;
      startDate?: string;
      endDate?: string;
    }
  ): AuditLog[] {
    let filteredLogs = [...this.auditLogs];

    if (filters) {
      if (filters.userId) {
        filteredLogs = filteredLogs.filter(
          log => log.userId === filters.userId
        );
      }
      if (filters.action) {
        filteredLogs = filteredLogs.filter(
          log => log.action === filters.action
        );
      }
      if (filters.resource) {
        filteredLogs = filteredLogs.filter(
          log => log.resource === filters.resource
        );
      }
      if (filters.result) {
        filteredLogs = filteredLogs.filter(
          log => log.result === filters.result
        );
      }
      if (filters.startDate) {
        filteredLogs = filteredLogs.filter(
          log => log.timestamp >= filters.startDate!
        );
      }
      if (filters.endDate) {
        filteredLogs = filteredLogs.filter(
          log => log.timestamp <= filters.endDate!
        );
      }
    }

    return filteredLogs.slice(-limit);
  }

  /**
   * Check user permissions
   */
  checkUserPermissions(userId: string, permission: string): boolean {
    const user = this.rbacUsers.get(userId);
    if (!user) return false;

    // Check direct permissions
    if (user.permissions.includes(permission)) return true;

    // Check role permissions
    for (const roleId of user.roles) {
      const role = this.rbacRoles.get(roleId);
      if (role && role.permissions.includes(permission)) return true;
    }

    return false;
  }

  /**
   * Get user roles
   */
  getUserRoles(userId: string): RBACRole[] {
    const user = this.rbacUsers.get(userId);
    if (!user) return [];

    return user.roles
      .map(roleId => this.rbacRoles.get(roleId))
      .filter((role): role is RBACRole => role !== undefined);
  }

  /**
   * Create audit log entry
   */
  createAuditLog(entry: Omit<AuditLog, 'id' | 'timestamp'>): void {
    const auditLog: AuditLog = {
      ...entry,
      id: `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
    };

    this.auditLogs.push(auditLog);

    logger.info('Audit log created', { auditLog });
  }

  /**
   * Get system alerts
   */
  getSystemAlerts(
    severity?: 'low' | 'medium' | 'high' | 'critical'
  ): SystemAlert[] {
    if (!this.systemHealth) return [];

    let alerts = this.systemHealth.alerts;

    if (severity) {
      alerts = alerts.filter(alert => alert.severity === severity);
    }

    return alerts;
  }

  /**
   * Resolve system alert
   */
  resolveSystemAlert(alertId: string): boolean {
    if (!this.systemHealth) return false;

    const alert = this.systemHealth.alerts.find(a => a.id === alertId);
    if (!alert) return false;

    alert.resolved = true;
    alert.resolvedAt = new Date().toISOString();

    logger.info('System alert resolved', { alertId });
    return true;
  }

  /**
   * Get RBAC roles
   */
  getRBACRoles(): RBACRole[] {
    return Array.from(this.rbacRoles.values());
  }

  /**
   * Get RBAC permissions
   */
  getRBACPermissions(): RBACPermission[] {
    return Array.from(this.rbacPermissions.values());
  }

  /**
   * Create RBAC user
   */
  createRBACUser(user: Omit<RBACUser, 'id'>): string {
    const userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const rbacUser: RBACUser = {
      ...user,
      id: userId,
    };

    this.rbacUsers.set(userId, rbacUser);

    this.createAuditLog({
      userId: 'system',
      action: 'user_created',
      resource: 'rbac_users',
      result: 'success',
      ipAddress: '127.0.0.1',
      userAgent: 'system',
      metadata: { targetUserId: userId, roles: user.roles },
    });

    return userId;
  }

  /**
   * Update RBAC user
   */
  updateRBACUser(userId: string, updates: Partial<RBACUser>): boolean {
    const user = this.rbacUsers.get(userId);
    if (!user) return false;

    const updatedUser = { ...user, ...updates };
    this.rbacUsers.set(userId, updatedUser);

    this.createAuditLog({
      userId: 'system',
      action: 'user_updated',
      resource: 'rbac_users',
      result: 'success',
      ipAddress: '127.0.0.1',
      userAgent: 'system',
      metadata: { targetUserId: userId, updates },
    });

    return true;
  }

  /**
   * Delete RBAC user
   */
  deleteRBACUser(userId: string): boolean {
    const user = this.rbacUsers.get(userId);
    if (!user) return false;

    this.rbacUsers.delete(userId);

    this.createAuditLog({
      userId: 'system',
      action: 'user_deleted',
      resource: 'rbac_users',
      result: 'success',
      ipAddress: '127.0.0.1',
      userAgent: 'system',
      metadata: { targetUserId: userId },
    });

    return true;
  }
}

// Export singleton instance
export const adminDashboardSystem = new AdminDashboardSystem();
