/**
 * Phase 2: Performance & UX Stability
 * Intelligent Prefetching and Preloading System
 * 
 * Automatically prefetches critical resources based on user behavior and route patterns
 */

export interface PrefetchConfig {
  routes: string[];
  priority: 'high' | 'medium' | 'low';
  preload?: boolean;
  prefetch?: boolean;
}

class IntelligentPrefetcher {
  private prefetchedRoutes = new Set<string>();
  private intersectionObserver: IntersectionObserver | null = null;
  private linkPrefetchCache = new Map<string, HTMLLinkElement>();

  /**
   * Prefetch a route with intelligent priority handling
   */
  prefetchRoute(route: string, priority: 'high' | 'medium' | 'low' = 'medium'): void {
    if (typeof window === 'undefined') return;
    if (this.prefetchedRoutes.has(route)) return;

    // High priority: preload, Medium: prefetch, Low: deferred prefetch
    const link = document.createElement('link');
    link.rel = priority === 'high' ? 'preload' : 'prefetch';
    link.as = 'document';
    link.href = route;
    link.crossOrigin = 'anonymous';

    if (priority === 'high') {
      // Preload critical routes immediately
      document.head.appendChild(link);
    } else if (priority === 'medium') {
      // Prefetch with requestIdleCallback for medium priority
      if ('requestIdleCallback' in window) {
        requestIdleCallback(() => {
          document.head.appendChild(link);
        });
      } else {
        setTimeout(() => {
          document.head.appendChild(link);
        }, 100);
      }
    } else {
      // Low priority: defer until idle + delay
      if ('requestIdleCallback' in window) {
        requestIdleCallback(
          () => {
            setTimeout(() => {
              document.head.appendChild(link);
            }, 2000);
          },
          { timeout: 5000 }
        );
      }
    }

    this.linkPrefetchCache.set(route, link);
    this.prefetchedRoutes.add(route);
  }

  /**
   * Prefetch resources for visible links
   */
  setupLinkPrefetching(): void {
    if (typeof window === 'undefined' || this.intersectionObserver) return;

    this.intersectionObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const link = entry.target as HTMLAnchorElement;
            const href = link.href;
            
            if (href && !this.prefetchedRoutes.has(href)) {
              // Determine priority based on link position and importance
              const priority = this.getLinkPriority(link);
              this.prefetchRoute(href, priority);
              
              // Unobserve after prefetching
              this.intersectionObserver?.unobserve(link);
            }
          }
        });
      },
      {
        rootMargin: '50px', // Start prefetching when link is 50px away
      }
    );

    // Observe all anchor links
    document.querySelectorAll('a[href]').forEach((link) => {
      const href = (link as HTMLAnchorElement).href;
      if (href && this.isInternalRoute(href)) {
        this.intersectionObserver?.observe(link);
      }
    });

    // Observe dynamically added links
    const mutationObserver = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            const element = node as Element;
            const links = element.querySelectorAll('a[href]');
            links.forEach((link) => {
              const href = (link as HTMLAnchorElement).href;
              if (href && this.isInternalRoute(href)) {
                this.intersectionObserver?.observe(link);
              }
            });
          }
        });
      });
    });

    mutationObserver.observe(document.body, {
      childList: true,
      subtree: true,
    });
  }

  /**
   * Prefetch critical API endpoints
   */
  prefetchAPIEndpoint(endpoint: string, priority: 'high' | 'medium' | 'low' = 'medium'): void {
    if (typeof window === 'undefined') return;

    const link = document.createElement('link');
    link.rel = priority === 'high' ? 'preload' : 'prefetch';
    link.as = 'fetch';
    link.href = endpoint;
    link.crossOrigin = 'anonymous';

    if (priority === 'high') {
      document.head.appendChild(link);
    } else {
      if ('requestIdleCallback' in window) {
        requestIdleCallback(() => {
          document.head.appendChild(link);
        });
      }
    }
  }

  /**
   * Preload critical images
   */
  preloadImage(src: string, priority: 'high' | 'low' = 'high'): void {
    if (typeof window === 'undefined') return;

    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'image';
    link.href = src;
    
    if (priority === 'high') {
      link.fetchPriority = 'high';
      document.head.appendChild(link);
    } else {
      if ('requestIdleCallback' in window) {
        requestIdleCallback(() => {
          document.head.appendChild(link);
        });
      }
    }
  }

  private getLinkPriority(link: HTMLAnchorElement): 'high' | 'medium' | 'low' {
    // High priority: links in header, footer, or first few in content
    if (
      link.closest('header, nav') ||
      link.getAttribute('data-priority') === 'high'
    ) {
      return 'high';
    }

    // Medium priority: main content links
    if (link.closest('main, article')) {
      return 'medium';
    }

    // Low priority: footer, sidebar, etc.
    return 'low';
  }

  private isInternalRoute(href: string): boolean {
    try {
      const url = new URL(href);
      return url.origin === window.location.origin;
    } catch {
      return false;
    }
  }

  /**
   * Cleanup resources
   */
  cleanup(): void {
    if (this.intersectionObserver) {
      this.intersectionObserver.disconnect();
      this.intersectionObserver = null;
    }

    // Remove prefetch links
    this.linkPrefetchCache.forEach((link) => {
      link.remove();
    });
    this.linkPrefetchCache.clear();
    this.prefetchedRoutes.clear();
  }
}

// Singleton instance
export const intelligentPrefetcher = new IntelligentPrefetcher();

// Auto-initialize in browser
if (typeof window !== 'undefined') {
  // Wait for DOM to be ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      intelligentPrefetcher.setupLinkPrefetching();
    });
  } else {
    intelligentPrefetcher.setupLinkPrefetching();
  }

  // Cleanup on page unload
  window.addEventListener('beforeunload', () => {
    intelligentPrefetcher.cleanup();
  });
}
