interface PerformanceMetric {
  name: string;
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  timestamp: string;
}

class PerformanceMonitor {
  private metrics: PerformanceMetric[] = [];
  private endpoint = '/api/metrics';

  // Monitor Core Web Vitals
  initWebVitals() {
    if ('web-vitals' in window) return;

    import('web-vitals').then(({ onCLS, onINP, onFCP, onLCP, onTTFB }) => {
      onCLS(this.handleMetric.bind(this));
      onINP(this.handleMetric.bind(this)); // Replaced onFID with onINP (Interaction to Next Paint)
      onFCP(this.handleMetric.bind(this));
      onLCP(this.handleMetric.bind(this));
      onTTFB(this.handleMetric.bind(this));
    });
  }

  // Handle metric reporting
  private handleMetric(metric: any) {
    const performanceMetric: PerformanceMetric = {
      name: metric.name,
      value: Math.round(metric.value),
      rating: metric.rating || this.getRating(metric.name, metric.value),
      timestamp: new Date().toISOString(),
    };

    this.metrics.push(performanceMetric);
    console.log(`Performance metric: ${metric.name} = ${metric.value}ms (${performanceMetric.rating})`);

    // Send metrics in batches
    if (this.metrics.length >= 5) {
      this.sendMetrics();
    }
  }

  // Determine rating based on thresholds
  private getRating(name: string, value: number): 'good' | 'needs-improvement' | 'poor' {
    const thresholds: Record<string, { good: number; poor: number }> = {
      FCP: { good: 1800, poor: 3000 },
      LCP: { good: 2500, poor: 4000 },
      INP: { good: 200, poor: 500 }, // Updated FID to INP thresholds
      CLS: { good: 0.1, poor: 0.25 },
      TTFB: { good: 800, poor: 1800 },
    };

    const threshold = thresholds[name];
    if (!threshold) return 'needs-improvement';

    if (value <= threshold.good) return 'good';
    if (value >= threshold.poor) return 'poor';
    return 'needs-improvement';
  }

  // Send metrics to server
  private async sendMetrics() {
    if (this.metrics.length === 0) return;

    const metricsToSend = [...this.metrics];
    this.metrics = [];

    try {
      await fetch(this.endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          metrics: metricsToSend,
          url: window.location.href,
          userAgent: navigator.userAgent,
        }),
      });
    } catch (err) {
      console.error('Failed to send metrics:', err);
    }
  }

  // Track custom performance marks
  measureTime(markName: string): () => void {
    const startMark = `${markName}-start`;
    performance.mark(startMark);

    return () => {
      const endMark = `${markName}-end`;
      performance.mark(endMark);
      performance.measure(markName, startMark, endMark);

      const measure = performance.getEntriesByName(markName)[0];
      if (measure) {
        this.handleMetric({
          name: markName,
          value: measure.duration,
        });
      }
    };
  }
}

export const performanceMonitor = new PerformanceMonitor();