// Accessibility utilities and components
'use client';

import { useEffect, useState } from 'react';

/**
 * Keyboard navigation hook
 * Ensures all interactive elements are keyboard accessible
 */
export function useKeyboardNavigation() {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Skip if user is typing in an input
      if (
        event.target instanceof HTMLInputElement ||
        event.target instanceof HTMLTextAreaElement ||
        event.target instanceof HTMLSelectElement
      ) {
        return;
      }

      // Keyboard shortcuts
      switch (event.key) {
        case '?':
          // Show keyboard shortcuts help
          if (event.ctrlKey || event.metaKey) {
            event.preventDefault();
            // Trigger help modal
            const helpEvent = new CustomEvent('show-keyboard-help');
            window.dispatchEvent(helpEvent);
          }
          break;
        case 'Escape':
          // Close modals/dropdowns
          const escapeEvent = new CustomEvent('keyboard-escape');
          window.dispatchEvent(escapeEvent);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);
}

/**
 * Skip to main content link
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
 * Screen reader only text
 */
export function ScreenReaderOnly({ children }: { children: React.ReactNode }) {
  return <span className="sr-only">{children}</span>;
}

/**
 * Focus trap for modals
 */
export function useFocusTrap(isActive: boolean) {
  useEffect(() => {
    if (!isActive) return;

    const trapElement = document.querySelector('[role="dialog"]');
    if (!trapElement) return;

    const focusableElements = trapElement.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );

    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

    const handleTab = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

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

    trapElement.addEventListener('keydown', handleTab);
    firstElement?.focus();

    return () => {
      trapElement.removeEventListener('keydown', handleTab);
    };
  }, [isActive]);
}

/**
 * High contrast mode hook
 */
export function useHighContrast() {
  const [isHighContrast, setIsHighContrast] = useState(false);

  useEffect(() => {
    // Check system preference
    const prefersContrast = window.matchMedia('(prefers-contrast: high)');
    
    const handleChange = (e: MediaQueryListEvent) => {
      setIsHighContrast(e.matches);
      if (e.matches) {
        document.documentElement.classList.add('high-contrast');
      } else {
        document.documentElement.classList.remove('high-contrast');
      }
    };

    setIsHighContrast(prefersContrast.matches);
    if (prefersContrast.matches) {
      document.documentElement.classList.add('high-contrast');
    }

    prefersContrast.addEventListener('change', handleChange);
    return () => prefersContrast.removeEventListener('change', handleChange);
  }, []);

  const toggleHighContrast = () => {
    setIsHighContrast(prev => {
      const newValue = !prev;
      if (newValue) {
        document.documentElement.classList.add('high-contrast');
      } else {
        document.documentElement.classList.remove('high-contrast');
      }
      localStorage.setItem('high-contrast', String(newValue));
      return newValue;
    });
  };

  return { isHighContrast, toggleHighContrast };
}

/**
 * ARIA live region for announcements
 */
export function LiveRegion() {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-atomic="true"
      className="sr-only"
      id="live-region"
    />
  );
}

/**
 * Announce to screen readers
 */
export function announceToScreenReader(message: string, priority: 'polite' | 'assertive' = 'polite') {
  const region = document.getElementById('live-region');
  if (region) {
    region.setAttribute('aria-live', priority);
    region.textContent = message;
    // Clear after announcement
    setTimeout(() => {
      region.textContent = '';
    }, 1000);
  }
}
