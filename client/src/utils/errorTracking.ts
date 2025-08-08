import React, { Component, ReactNode } from 'react';

interface ErrorInfo {
  message: string;
  stack?: string;
  componentStack?: string;
  url?: string;
  userAgent?: string;
  timestamp: string;
  userId?: string;
  sessionId?: string;
}

class ErrorTracker {
  private queue: ErrorInfo[] = [];
  private maxQueueSize = 10;
  private endpoint = '/api/errors';

  // Capture and log errors
  captureError(error: Error, errorInfo?: any) {
    const errorData: ErrorInfo = {
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo?.componentStack,
      url: window.location.href,
      userAgent: navigator.userAgent,
      timestamp: new Date().toISOString(),
      userId: sessionStorage.getItem('userId') || undefined,
      sessionId: sessionStorage.getItem('sessionId') || undefined,
    };

    console.error('Error captured:', errorData);
    this.queue.push(errorData);

    // Send errors in batches
    if (this.queue.length >= this.maxQueueSize) {
      this.flush();
    }
  }

  // Send errors to server
  async flush() {
    if (this.queue.length === 0) return;

    const errors = [...this.queue];
    this.queue = [];

    try {
      await fetch(this.endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ errors }),
      });
    } catch (err) {
      console.error('Failed to send errors to server:', err);
      // Re-add errors to queue if sending failed
      this.queue.unshift(...errors);
    }
  }

  // Setup automatic flushing
  setupAutoFlush() {
    // Flush every 30 seconds
    setInterval(() => this.flush(), 30000);

    // Flush on page unload
    window.addEventListener('beforeunload', () => this.flush());
  }
}

export const errorTracker = new ErrorTracker();
errorTracker.setupAutoFlush();

// React Error Boundary component
interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    errorTracker.captureError(error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || React.createElement('div', {
        className: "min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-green-50"
      }, React.createElement('div', {
        className: "text-center p-8 bg-white rounded-2xl shadow-lg border border-gray-200 max-w-md mx-4"
      }, [
        React.createElement('div', {
          key: 'icon',
          className: "w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4"
        }, React.createElement('svg', {
          className: "w-8 h-8 text-red-600",
          fill: "none",
          stroke: "currentColor",
          viewBox: "0 0 24 24"
        }, React.createElement('path', {
          strokeLinecap: "round",
          strokeLinejoin: "round",
          strokeWidth: 2,
          d: "M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.083 16.5c-.77.833.192 2.5 1.732 2.5z"
        }))),
        React.createElement('h1', {
          key: 'title',
          className: "text-2xl font-bold text-red-600 mb-4"
        }, "Something went wrong"),
        React.createElement('p', {
          key: 'description',
          className: "text-gray-600 mb-6"
        }, "We've been notified and are working on it. Please try reloading the page."),
        React.createElement('button', {
          key: 'button',
          onClick: () => window.location.reload(),
          className: "bg-gradient-to-r from-blue-600 to-green-600 text-white px-6 py-3 rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
        }, "Reload Page")
      ]));
    }

    return this.props.children;
  }
}