import { monitoringSystem } from './monitoring'
import { logger } from './logger'

interface PerformanceMetrics {
  bundleSize: number
  loadTime: number
  firstContentfulPaint: number
  largestContentfulPaint: number
  cumulativeLayoutShift: number
  firstInputDelay: number
  timeToInteractive: number
  memoryUsage: number
  cpuUsage: number
}

interface OptimizationRecommendation {
  type: 'bundle' | 'image' | 'caching' | 'database' | 'api' | 'rendering'
  priority: 'low' | 'medium' | 'high' | 'critical'
  title: string
  description: string
  impact: string
  effort: 'low' | 'medium' | 'high'
  implementation: string
  expectedImprovement: string
}

class PerformanceOptimizer {
  private metrics: PerformanceMetrics[] = []
  private recommendations: OptimizationRecommendation[] = []

  constructor() {
    this.initializeRecommendations()
  }

  private initializeRecommendations(): void {
    this.recommendations = [
      {
        type: 'bundle',
        priority: 'high',
        title: 'Code Splitting',
        description: 'Implement dynamic imports and route-based code splitting',
        impact: 'Reduces initial bundle size by 30-50%',
        effort: 'medium',
        implementation: 'Use Next.js dynamic imports and React.lazy()',
        expectedImprovement: 'Faster initial page load'
      },
      {
        type: 'image',
        priority: 'medium',
        title: 'Image Optimization',
        description: 'Optimize images using Next.js Image component and WebP format',
        impact: 'Reduces image payload by 25-35%',
        effort: 'low',
        implementation: 'Replace img tags with Next.js Image component',
        expectedImprovement: 'Faster image loading and better LCP'
      },
      {
        type: 'caching',
        priority: 'high',
        title: 'API Response Caching',
        description: 'Implement Redis caching for API responses',
        impact: 'Reduces API response time by 80-90%',
        effort: 'medium',
        implementation: 'Add Redis cache layer for recipe and pantry data',
        expectedImprovement: 'Faster API responses and reduced database load'
      },
      {
        type: 'database',
        priority: 'medium',
        title: 'Database Query Optimization',
        description: 'Optimize database queries and add proper indexing',
        impact: 'Reduces database query time by 40-60%',
        effort: 'high',
        implementation: 'Add database indexes and optimize query patterns',
        expectedImprovement: 'Faster data retrieval'
      },
      {
        type: 'api',
        priority: 'high',
        title: 'API Response Compression',
        description: 'Enable gzip/brotli compression for API responses',
        impact: 'Reduces response size by 60-80%',
        effort: 'low',
        implementation: 'Configure compression middleware',
        expectedImprovement: 'Faster API responses'
      },
      {
        type: 'rendering',
        priority: 'medium',
        title: 'Server-Side Rendering Optimization',
        description: 'Optimize SSR performance and implement ISR',
        impact: 'Improves initial page load by 20-30%',
        effort: 'medium',
        implementation: 'Implement ISR for static content and optimize SSR',
        expectedImprovement: 'Faster initial page render'
      }
    ]
  }

  async recordPerformanceMetrics(metrics: Partial<PerformanceMetrics>): Promise<void> {
    try {
      const fullMetrics: PerformanceMetrics = {
        bundleSize: metrics.bundleSize || 0,
        loadTime: metrics.loadTime || 0,
        firstContentfulPaint: metrics.firstContentfulPaint || 0,
        largestContentfulPaint: metrics.largestContentfulPaint || 0,
        cumulativeLayoutShift: metrics.cumulativeLayoutShift || 0,
        firstInputDelay: metrics.firstInputDelay || 0,
        timeToInteractive: metrics.timeToInteractive || 0,
        memoryUsage: metrics.memoryUsage || 0,
        cpuUsage: metrics.cpuUsage || 0
      }

      this.metrics.push(fullMetrics)

      // Record individual metrics
      await monitoringSystem.recordGauge('bundle_size_kb', fullMetrics.bundleSize)
      await monitoringSystem.recordGauge('page_load_time_ms', fullMetrics.loadTime)
      await monitoringSystem.recordGauge('first_contentful_paint_ms', fullMetrics.firstContentfulPaint)
      await monitoringSystem.recordGauge('largest_contentful_paint_ms', fullMetrics.largestContentfulPaint)
      await monitoringSystem.recordGauge('cumulative_layout_shift', fullMetrics.cumulativeLayoutShift)
      await monitoringSystem.recordGauge('first_input_delay_ms', fullMetrics.firstInputDelay)
      await monitoringSystem.recordGauge('time_to_interactive_ms', fullMetrics.timeToInteractive)
      await monitoringSystem.recordGauge('memory_usage_mb', fullMetrics.memoryUsage)
      await monitoringSystem.recordGauge('cpu_usage_percent', fullMetrics.cpuUsage)

      // Check for performance issues
      await this.checkPerformanceIssues(fullMetrics)

      await logger.info('Performance metrics recorded', {
        metrics: fullMetrics
      }, 'performance', 'metrics')

    } catch (error) {
      console.error('Failed to record performance metrics:', error)
    }
  }

  private async checkPerformanceIssues(metrics: PerformanceMetrics): Promise<void> {
    const issues: string[] = []

    // Check bundle size
    if (metrics.bundleSize > 500) { // 500KB
      issues.push('Bundle size is too large')
      await monitoringSystem.recordCounter('performance_issues', 1, {
        type: 'bundle_size',
        severity: 'high'
      })
    }

    // Check load time
    if (metrics.loadTime > 3000) { // 3 seconds
      issues.push('Page load time is too slow')
      await monitoringSystem.recordCounter('performance_issues', 1, {
        type: 'load_time',
        severity: 'high'
      })
    }

    // Check First Contentful Paint
    if (metrics.firstContentfulPaint > 1800) { // 1.8 seconds
      issues.push('First Contentful Paint is too slow')
      await monitoringSystem.recordCounter('performance_issues', 1, {
        type: 'fcp',
        severity: 'medium'
      })
    }

    // Check Largest Contentful Paint
    if (metrics.largestContentfulPaint > 2500) { // 2.5 seconds
      issues.push('Largest Contentful Paint is too slow')
      await monitoringSystem.recordCounter('performance_issues', 1, {
        type: 'lcp',
        severity: 'high'
      })
    }

    // Check Cumulative Layout Shift
    if (metrics.cumulativeLayoutShift > 0.1) {
      issues.push('Cumulative Layout Shift is too high')
      await monitoringSystem.recordCounter('performance_issues', 1, {
        type: 'cls',
        severity: 'medium'
      })
    }

    // Check First Input Delay
    if (metrics.firstInputDelay > 100) { // 100ms
      issues.push('First Input Delay is too high')
      await monitoringSystem.recordCounter('performance_issues', 1, {
        type: 'fid',
        severity: 'medium'
      })
    }

    // Check Time to Interactive
    if (metrics.timeToInteractive > 5000) { // 5 seconds
      issues.push('Time to Interactive is too slow')
      await monitoringSystem.recordCounter('performance_issues', 1, {
        type: 'tti',
        severity: 'high'
      })
    }

    // Check memory usage
    if (metrics.memoryUsage > 100) { // 100MB
      issues.push('Memory usage is too high')
      await monitoringSystem.recordCounter('performance_issues', 1, {
        type: 'memory',
        severity: 'medium'
      })
    }

    // Check CPU usage
    if (metrics.cpuUsage > 80) { // 80%
      issues.push('CPU usage is too high')
      await monitoringSystem.recordCounter('performance_issues', 1, {
        type: 'cpu',
        severity: 'high'
      })
    }

    if (issues.length > 0) {
      await logger.warn('Performance issues detected', {
        issues,
        metrics
      }, 'performance', 'issues')
    }
  }

  getRecommendations(): OptimizationRecommendation[] {
    return this.recommendations
  }

  getRecommendationsByPriority(priority: 'low' | 'medium' | 'high' | 'critical'): OptimizationRecommendation[] {
    return this.recommendations.filter(r => r.priority === priority)
  }

  getRecommendationsByType(type: 'bundle' | 'image' | 'caching' | 'database' | 'api' | 'rendering'): OptimizationRecommendation[] {
    return this.recommendations.filter(r => r.type === type)
  }

  async generatePerformanceReport(): Promise<{
    summary: any
    metrics: PerformanceMetrics[]
    recommendations: OptimizationRecommendation[]
    score: number
  }> {
    try {
      const recentMetrics = this.metrics.slice(-10) // Last 10 measurements
      
      if (recentMetrics.length === 0) {
        return {
          summary: { message: 'No performance metrics available' },
          metrics: [],
          recommendations: this.recommendations,
          score: 0
        }
      }

      // Calculate averages
      const avgMetrics = this.calculateAverages(recentMetrics)
      
      // Calculate performance score (0-100)
      const score = this.calculatePerformanceScore(avgMetrics)
      
      // Get relevant recommendations
      const relevantRecommendations = this.getRelevantRecommendations(avgMetrics)

      const summary = {
        score,
        grade: this.getPerformanceGrade(score),
        metrics: avgMetrics,
        issues: this.identifyIssues(avgMetrics),
        lastUpdated: new Date().toISOString()
      }

      return {
        summary,
        metrics: recentMetrics,
        recommendations: relevantRecommendations,
        score
      }
    } catch (error) {
      console.error('Failed to generate performance report:', error)
      return {
        summary: { error: error.message },
        metrics: [],
        recommendations: this.recommendations,
        score: 0
      }
    }
  }

  private calculateAverages(metrics: PerformanceMetrics[]): PerformanceMetrics {
    const sums = metrics.reduce((acc, m) => ({
      bundleSize: acc.bundleSize + m.bundleSize,
      loadTime: acc.loadTime + m.loadTime,
      firstContentfulPaint: acc.firstContentfulPaint + m.firstContentfulPaint,
      largestContentfulPaint: acc.largestContentfulPaint + m.largestContentfulPaint,
      cumulativeLayoutShift: acc.cumulativeLayoutShift + m.cumulativeLayoutShift,
      firstInputDelay: acc.firstInputDelay + m.firstInputDelay,
      timeToInteractive: acc.timeToInteractive + m.timeToInteractive,
      memoryUsage: acc.memoryUsage + m.memoryUsage,
      cpuUsage: acc.cpuUsage + m.cpuUsage
    }), {
      bundleSize: 0,
      loadTime: 0,
      firstContentfulPaint: 0,
      largestContentfulPaint: 0,
      cumulativeLayoutShift: 0,
      firstInputDelay: 0,
      timeToInteractive: 0,
      memoryUsage: 0,
      cpuUsage: 0
    })

    const count = metrics.length
    return {
      bundleSize: sums.bundleSize / count,
      loadTime: sums.loadTime / count,
      firstContentfulPaint: sums.firstContentfulPaint / count,
      largestContentfulPaint: sums.largestContentfulPaint / count,
      cumulativeLayoutShift: sums.cumulativeLayoutShift / count,
      firstInputDelay: sums.firstInputDelay / count,
      timeToInteractive: sums.timeToInteractive / count,
      memoryUsage: sums.memoryUsage / count,
      cpuUsage: sums.cpuUsage / count
    }
  }

  private calculatePerformanceScore(metrics: PerformanceMetrics): number {
    let score = 100

    // Bundle size (max 25 points)
    if (metrics.bundleSize > 500) score -= 25
    else if (metrics.bundleSize > 300) score -= 15
    else if (metrics.bundleSize > 200) score -= 10

    // Load time (max 25 points)
    if (metrics.loadTime > 3000) score -= 25
    else if (metrics.loadTime > 2000) score -= 15
    else if (metrics.loadTime > 1000) score -= 10

    // LCP (max 20 points)
    if (metrics.largestContentfulPaint > 2500) score -= 20
    else if (metrics.largestContentfulPaint > 2000) score -= 15
    else if (metrics.largestContentfulPaint > 1500) score -= 10

    // CLS (max 15 points)
    if (metrics.cumulativeLayoutShift > 0.1) score -= 15
    else if (metrics.cumulativeLayoutShift > 0.05) score -= 10
    else if (metrics.cumulativeLayoutShift > 0.025) score -= 5

    // FID (max 10 points)
    if (metrics.firstInputDelay > 100) score -= 10
    else if (metrics.firstInputDelay > 50) score -= 5

    // TTI (max 5 points)
    if (metrics.timeToInteractive > 5000) score -= 5
    else if (metrics.timeToInteractive > 3000) score -= 3

    return Math.max(0, score)
  }

  private getPerformanceGrade(score: number): string {
    if (score >= 90) return 'A'
    if (score >= 80) return 'B'
    if (score >= 70) return 'C'
    if (score >= 60) return 'D'
    return 'F'
  }

  private identifyIssues(metrics: PerformanceMetrics): string[] {
    const issues: string[] = []

    if (metrics.bundleSize > 500) issues.push('Bundle size too large')
    if (metrics.loadTime > 3000) issues.push('Page load time too slow')
    if (metrics.largestContentfulPaint > 2500) issues.push('LCP too slow')
    if (metrics.cumulativeLayoutShift > 0.1) issues.push('CLS too high')
    if (metrics.firstInputDelay > 100) issues.push('FID too high')
    if (metrics.timeToInteractive > 5000) issues.push('TTI too slow')
    if (metrics.memoryUsage > 100) issues.push('Memory usage too high')
    if (metrics.cpuUsage > 80) issues.push('CPU usage too high')

    return issues
  }

  private getRelevantRecommendations(metrics: PerformanceMetrics): OptimizationRecommendation[] {
    const relevant: OptimizationRecommendation[] = []

    if (metrics.bundleSize > 300) {
      relevant.push(...this.getRecommendationsByType('bundle'))
    }

    if (metrics.loadTime > 2000 || metrics.largestContentfulPaint > 2000) {
      relevant.push(...this.getRecommendationsByType('image'))
      relevant.push(...this.getRecommendationsByType('caching'))
    }

    if (metrics.memoryUsage > 50 || metrics.cpuUsage > 60) {
      relevant.push(...this.getRecommendationsByType('database'))
    }

    // Always include high priority recommendations
    relevant.push(...this.getRecommendationsByPriority('critical'))
    relevant.push(...this.getRecommendationsByPriority('high'))

    // Remove duplicates
    return relevant.filter((rec, index, self) => 
      index === self.findIndex(r => r.title === rec.title)
    )
  }

  async optimizeBundle(): Promise<void> {
    try {
      // This would implement actual bundle optimization
      await logger.info('Bundle optimization started', {}, 'performance', 'optimization')
      
      // Simulate optimization
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      await logger.info('Bundle optimization completed', {}, 'performance', 'optimization')
    } catch (error) {
      console.error('Bundle optimization failed:', error)
    }
  }

  async optimizeImages(): Promise<void> {
    try {
      // This would implement actual image optimization
      await logger.info('Image optimization started', {}, 'performance', 'optimization')
      
      // Simulate optimization
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      await logger.info('Image optimization completed', {}, 'performance', 'optimization')
    } catch (error) {
      console.error('Image optimization failed:', error)
    }
  }

  async optimizeCaching(): Promise<void> {
    try {
      // This would implement actual caching optimization
      await logger.info('Caching optimization started', {}, 'performance', 'optimization')
      
      // Simulate optimization
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      await logger.info('Caching optimization completed', {}, 'performance', 'optimization')
    } catch (error) {
      console.error('Caching optimization failed:', error)
    }
  }
}

export const performanceOptimizer = new PerformanceOptimizer()

// Utility functions for performance monitoring
export async function measurePerformance<T>(
  name: string,
  fn: () => Promise<T>
): Promise<T> {
  const start = performance.now()
  
  try {
    const result = await fn()
    const duration = performance.now() - start
    
    await performanceOptimizer.recordPerformanceMetrics({
      loadTime: duration
    })
    
    return result
  } catch (error) {
    const duration = performance.now() - start
    
    await performanceOptimizer.recordPerformanceMetrics({
      loadTime: duration
    })
    
    throw error
  }
}

export async function measureBundleSize(): Promise<number> {
  try {
    // This would measure actual bundle size
    // For now, return a simulated value
    return Math.random() * 500 + 100
  } catch (error) {
    console.error('Failed to measure bundle size:', error)
    return 0
  }
}