'use client';

/**
 * Accessibility Enhancements
 * 
 * WCAG 2.1 AA compliance improvements
 */

import { useEffect } from 'react';

/**
 * Skip to main content link for keyboard navigation
 */
export function SkipToMainContent() {
  return (
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-md"
    >
      Skip to main content
    </a>
  );
}

/**
 * Focus trap for modals
 */
export function useFocusTrap(isActive: boolean) {
  useEffect(() => {
    if (!isActive) return;

    const handleTab = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      const focusableElements = document.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      const firstElement = focusableElements[0] as HTMLElement;
      const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement?.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement?.focus();
        }
      }
    };

    document.addEventListener('keydown', handleTab);
    return () => document.removeEventListener('keydown', handleTab);
  }, [isActive]);
}

/**
 * Announce dynamic content changes to screen readers
 */
export function useAriaLiveAnnouncement(message: string, priority: 'polite' | 'assertive' = 'polite') {
  useEffect(() => {
    const announcement = document.createElement('div');
    announcement.setAttribute('role', 'status');
    announcement.setAttribute('aria-live', priority);
    announcement.setAttribute('aria-atomic', 'true');
    announcement.className = 'sr-only';
    announcement.textContent = message;
    document.body.appendChild(announcement);

    setTimeout(() => {
      document.body.removeChild(announcement);
    }, 1000);

    return () => {
      if (document.body.contains(announcement)) {
        document.body.removeChild(announcement);
      }
    };
  }, [message, priority]);
}

/**
 * Keyboard navigation handler
 */
export function useKeyboardNavigation() {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Escape key to close modals
      if (e.key === 'Escape') {
        const modals = document.querySelectorAll('[role="dialog"]');
        const lastModal = modals[modals.length - 1] as HTMLElement;
        if (lastModal) {
          const closeButton = lastModal.querySelector('[data-close-modal]') as HTMLElement;
          closeButton?.click();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);
}

/**
 * ARIA label helper for icon-only buttons
 */
export function getAriaLabel(action: string, item?: string): string {
  return item ? `${action} ${item}` : action;
}
