import type { MealPlan, GroceryList, HealthMetric } from './types';

export interface OfflineQueueItem {
  id: string;
  type: 'create' | 'update' | 'delete';
  endpoint: string;
  payload?: unknown;
  timestamp: number;
  retries: number;
}

export interface ConflictResolutionStrategy {
  strategy: 'server-wins' | 'client-wins' | 'merge' | 'timestamp-fence';
  mergeFn?: (client: unknown, server: unknown) => unknown;
}

export class OfflineSyncManager {
  private queue: OfflineQueueItem[] = [];
  private storage: Storage | null = null;
  private isOnline = true;
  private syncInProgress = false;

  constructor(storage?: Storage) {
    this.storage = storage || null;
    this.loadQueue();

    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => {
        this.isOnline = true;
        this.processQueue();
      });
      window.addEventListener('offline', () => {
        this.isOnline = false;
      });
    }
  }

  private async loadQueue(): Promise<void> {
    if (!this.storage) return;

    try {
      const stored = this.storage.getItem('nomad_offline_queue');
      if (stored) {
        this.queue = JSON.parse(stored);
      }
    } catch (error) {
      console.error('Failed to load offline queue:', error);
    }
  }

  private async saveQueue(): Promise<void> {
    if (!this.storage) return;

    try {
      this.storage.setItem('nomad_offline_queue', JSON.stringify(this.queue));
    } catch (error) {
      console.error('Failed to save offline queue:', error);
    }
  }

  enqueue(item: Omit<OfflineQueueItem, 'id' | 'timestamp' | 'retries'>): string {
    const id = `sync_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const queueItem: OfflineQueueItem = {
      id,
      ...item,
      timestamp: Date.now(),
      retries: 0,
    };

    this.queue.push(queueItem);
    this.saveQueue();

    if (this.isOnline) {
      this.processQueue();
    }

    return id;
  }

  async processQueue(): Promise<void> {
    if (this.syncInProgress || !this.isOnline || this.queue.length === 0) {
      return;
    }

    this.syncInProgress = true;

    const items = [...this.queue];
    const results: Array<{ id: string; success: boolean }> = [];

    for (const item of items) {
      try {
        // This would be replaced with actual API calls
        // await apiClient.request(item.type, item.endpoint, item.payload);
        
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 100));

        results.push({ id: item.id, success: true });
      } catch (error) {
        item.retries++;
        if (item.retries >= 3) {
          results.push({ id: item.id, success: false });
        }
      }
    }

    // Remove successful items and items that exceeded retries
    this.queue = this.queue.filter(
      (item) => !results.find((r) => r.id === item.id && r.success)
    );

    this.saveQueue();
    this.syncInProgress = false;
  }

  resolveConflict<T extends MealPlan | GroceryList | HealthMetric>(
    client: T,
    server: T,
    strategy: ConflictResolutionStrategy
  ): T {
    switch (strategy.strategy) {
      case 'server-wins':
        return server;

      case 'client-wins':
        return client;

      case 'merge':
        if (strategy.mergeFn) {
          return strategy.mergeFn(client, server) as T;
        }
        return server;

      case 'timestamp-fence':
        const clientTime = new Date(client.updatedAt).getTime();
        const serverTime = new Date(server.updatedAt).getTime();
        return clientTime > serverTime ? client : server;

      default:
        return server;
    }
  }

  // Specialized merge for grocery lists (CRDT-like)
  mergeGroceryLists(client: GroceryList, server: GroceryList): GroceryList {
    const clientItems = new Map(
      client.items.map((item) => [item.id || item.title, item])
    );
    const serverItems = new Map(
      server.items.map((item) => [item.id || item.title, item])
    );

    const mergedItems: typeof client.items = [];

    // Add all client items
    for (const item of client.items) {
      const key = item.id || item.title;
      const serverItem = serverItems.get(key);

      if (serverItem) {
        // Merge: prefer checked state from most recent action
        const clientCheckedTime = item.updatedAt
          ? new Date(item.updatedAt).getTime()
          : 0;
        const serverCheckedTime = serverItem.updatedAt
          ? new Date(serverItem.updatedAt).getTime()
          : 0;

        mergedItems.push({
          ...item,
          checked: clientCheckedTime > serverCheckedTime ? item.checked : serverItem.checked,
        });
      } else {
        mergedItems.push(item);
      }
    }

    // Add server-only items
    for (const item of server.items) {
      const key = item.id || item.title;
      if (!clientItems.has(key)) {
        mergedItems.push(item);
      }
    }

    return {
      ...server,
      items: mergedItems,
      updatedAt: new Date().toISOString(),
    };
  }

  getQueueLength(): number {
    return this.queue.length;
  }

  clearQueue(): void {
    this.queue = [];
    this.saveQueue();
  }
}

// Expo Task Manager integration for background sync
export interface BackgroundSyncConfig {
  taskName: string;
  minimumInterval: number; // seconds
}

export function createBackgroundSyncTask(
  manager: OfflineSyncManager,
  apiClient: unknown // Replace with actual API client type
): BackgroundSyncConfig {
  return {
    taskName: 'nomad_sync',
    minimumInterval: 300, // 5 minutes
  };
}
