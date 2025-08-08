// Google Analytics 4 setup
declare global {
  interface Window {
    gtag: (...args: any[]) => void;
    dataLayer: any[];
  }
}

export const GA_MEASUREMENT_ID = 'G-BLR8DKLFN1';

// Initialize Google Analytics
export const initGA = () => {
  if (!GA_MEASUREMENT_ID || process.env.NODE_ENV !== 'production') {
    console.log('Google Analytics not initialized (development mode or no ID)');
    return;
  }

  // Add GA script to head
  const script1 = document.createElement('script');
  script1.async = true;
  script1.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
  document.head.appendChild(script1);

  // Initialize gtag
  window.dataLayer = window.dataLayer || [];
  window.gtag = function() {
    window.dataLayer.push(arguments);
  };
  window.gtag('js', new Date());
  window.gtag('config', GA_MEASUREMENT_ID, {
    page_path: window.location.pathname,
  });
};

// Track page views
export const trackPageView = (url: string) => {
  if (!window.gtag || !GA_MEASUREMENT_ID) return;
  
  window.gtag('config', GA_MEASUREMENT_ID, {
    page_path: url,
  });
};

// Track events
export const trackEvent = (
  action: string,
  category: string,
  label?: string,
  value?: number
) => {
  if (!window.gtag || !GA_MEASUREMENT_ID) return;
  
  window.gtag('event', action, {
    event_category: category,
    event_label: label,
    value: value,
  });
};

// Track form submissions
export const trackFormSubmit = (formName: string, success: boolean) => {
  trackEvent('form_submit', 'engagement', formName, success ? 1 : 0);
};

// Track calculation results
export const trackCalculation = (creditAmount: number, years: number) => {
  trackEvent('calculation_complete', 'calculator', `${years}_years`, creditAmount);
};

// Track conversion events
export const trackConversion = (value: number, transactionId?: string) => {
  if (!window.gtag || !GA_MEASUREMENT_ID) return;
  
  window.gtag('event', 'purchase', {
    value: value,
    currency: 'USD',
    transaction_id: transactionId,
  });
};

// Track specific user actions for R&D calculator
export const trackCalculatorStep = (step: string) => {
  trackEvent('calculator_step', 'calculator', step);
};

export const trackCheckoutStarted = (planType: string, price: number) => {
  trackEvent('begin_checkout', 'ecommerce', planType, price);
};

export const trackLoginSuccess = (method: string = 'email') => {
  trackEvent('login', 'authentication', method);
};