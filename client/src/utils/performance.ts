export const measurePerformance = (metricName: string) => {
  if ('performance' in window) {
    performance.mark(`${metricName}-start`);
    
    return () => {
      performance.mark(`${metricName}-end`);
      performance.measure(
        metricName,
        `${metricName}-start`,
        `${metricName}-end`
      );
      
      const measure = performance.getEntriesByName(metricName)[0];
      console.log(`${metricName}: ${measure.duration.toFixed(2)}ms`);
    };
  }
  
  return () => {};
};

// Web Vitals reporting
export const reportWebVitals = (onPerfEntry?: (metric: any) => void) => {
  if (onPerfEntry && onPerfEntry instanceof Function) {
    import('web-vitals').then((webVitals: any) => {
      // Support both old and new web-vitals API versions
      if (webVitals.onCLS) {
        webVitals.onCLS(onPerfEntry);
        webVitals.onINP?.(onPerfEntry); // new metric replaces FID
        webVitals.onFCP?.(onPerfEntry);
        webVitals.onLCP?.(onPerfEntry);
        webVitals.onTTFB?.(onPerfEntry);
      } else if (webVitals.getCLS) {
        webVitals.getCLS(onPerfEntry);
        webVitals.getFID?.(onPerfEntry);
        webVitals.getFCP?.(onPerfEntry);
        webVitals.getLCP?.(onPerfEntry);
        webVitals.getTTFB?.(onPerfEntry);
      }
    }).catch((error) => {
      console.warn('Web Vitals could not be loaded:', error);
    });
  }
};