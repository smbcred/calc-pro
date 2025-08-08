import { v4 as uuidv4 } from 'uuid';

class SessionTracker {
  private sessionId: string;
  private sessionStart: number;
  
  constructor() {
    this.sessionId = sessionStorage.getItem('sessionId') || uuidv4();
    this.sessionStart = Date.now();
    sessionStorage.setItem('sessionId', this.sessionId);
  }

  getSessionId(): string {
    return this.sessionId;
  }

  getSessionDuration(): number {
    return Date.now() - this.sessionStart;
  }

  trackUserAction(action: string, metadata?: any) {
    const actionData = {
      sessionId: this.sessionId,
      action,
      timestamp: new Date().toISOString(),
      duration: this.getSessionDuration(),
      ...metadata,
    };

    // Send to analytics
    if (window.gtag) {
      window.gtag('event', action, actionData);
    }
  }
}

export const sessionTracker = new SessionTracker();