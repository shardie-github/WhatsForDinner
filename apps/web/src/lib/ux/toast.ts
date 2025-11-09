/**
 * Toast Notification System
 * Provides toast notifications for user feedback
 */

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
  id: string;
  type: ToastType;
  message: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

class ToastManager {
  private toasts: Toast[] = [];
  private listeners: Set<(toasts: Toast[]) => void> = new Set();

  subscribe(listener: (toasts: Toast[]) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify(): void {
    this.listeners.forEach((listener) => listener([...this.toasts]));
  }

  private createToast(
    type: ToastType,
    message: string,
    duration = 5000,
    action?: Toast['action']
  ): string {
    const id = Math.random().toString(36).substring(7);
    const toast: Toast = { id, type, message, duration, action };
    
    this.toasts.push(toast);
    this.notify();

    if (duration > 0) {
      setTimeout(() => this.remove(id), duration);
    }

    return id;
  }

  success(message: string, duration?: number, action?: Toast['action']): string {
    return this.createToast('success', message, duration, action);
  }

  error(message: string, duration?: number, action?: Toast['action']): string {
    return this.createToast('error', message, duration || 7000, action);
  }

  warning(message: string, duration?: number, action?: Toast['action']): string {
    return this.createToast('warning', message, duration, action);
  }

  info(message: string, duration?: number, action?: Toast['action']): string {
    return this.createToast('info', message, duration, action);
  }

  remove(id: string): void {
    this.toasts = this.toasts.filter((toast) => toast.id !== id);
    this.notify();
  }

  clear(): void {
    this.toasts = [];
    this.notify();
  }

  getToasts(): Toast[] {
    return [...this.toasts];
  }
}

export const toast = new ToastManager();
