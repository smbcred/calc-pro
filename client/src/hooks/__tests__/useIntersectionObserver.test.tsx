import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useIntersectionObserver } from '../useIntersectionObserver';

// Mock IntersectionObserver
const mockObserve = vi.fn();
const mockUnobserve = vi.fn();
const mockDisconnect = vi.fn();

beforeEach(() => {
  vi.clearAllMocks();
  
  // Mock IntersectionObserver with all required properties
  global.IntersectionObserver = vi.fn().mockImplementation((callback) => ({
    observe: mockObserve,
    unobserve: mockUnobserve,
    disconnect: mockDisconnect,
    root: null,
    rootMargin: '0px',
    thresholds: [0.1],
    takeRecords: vi.fn(),
    // Store the callback so we can trigger it in tests
    _callback: callback,
  }));
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('useIntersectionObserver', () => {
  it('should initialize with isIntersecting false', () => {
    const { result } = renderHook(() => useIntersectionObserver());
    
    expect(result.current.isIntersecting).toBe(false);
    expect(result.current.targetRef.current).toBe(null);
  });

  it('should create IntersectionObserver with default options', () => {
    renderHook(() => useIntersectionObserver());
    
    expect(IntersectionObserver).toHaveBeenCalledWith(
      expect.any(Function),
      {
        threshold: 0.1,
        root: null,
        rootMargin: '0px',
      }
    );
  });

  it('should create IntersectionObserver with custom options', () => {
    const customOptions = {
      threshold: 0.5,
      root: document.body,
      rootMargin: '10px',
    };
    
    renderHook(() => useIntersectionObserver(customOptions));
    
    expect(IntersectionObserver).toHaveBeenCalledWith(
      expect.any(Function),
      customOptions
    );
  });

  it('should observe element when targetRef is set', () => {
    const { result, rerender } = renderHook(() => useIntersectionObserver());
    
    // Create a mock element
    const mockElement = document.createElement('div');
    
    // Simulate setting the ref
    Object.defineProperty(result.current.targetRef, 'current', {
      value: mockElement,
      writable: true,
    });
    
    // Re-render to trigger the effect
    rerender();
    
    expect(mockObserve).toHaveBeenCalledWith(mockElement);
  });

  it('should update isIntersecting when intersection changes', () => {
    let observerCallback: any;
    
    // Capture the callback passed to IntersectionObserver
    vi.mocked(IntersectionObserver).mockImplementation((callback) => {
      observerCallback = callback;
      return {
        observe: mockObserve,
        unobserve: mockUnobserve,
        disconnect: mockDisconnect,
      };
    });
    
    const { result, rerender } = renderHook(() => useIntersectionObserver());
    
    // Create a mock element
    const mockElement = document.createElement('div');
    Object.defineProperty(result.current.targetRef, 'current', {
      value: mockElement,
      writable: true,
    });
    
    rerender();
    
    // Simulate intersection observer firing with intersecting: true
    if (observerCallback) {
      observerCallback([{ isIntersecting: true }]);
    }
    
    expect(result.current.isIntersecting).toBe(true);
    
    // Simulate intersection observer firing with intersecting: false
    if (observerCallback) {
      observerCallback([{ isIntersecting: false }]);
    }
    
    expect(result.current.isIntersecting).toBe(false);
  });

  it('should unobserve element on cleanup', () => {
    const { result, rerender, unmount } = renderHook(() => useIntersectionObserver());
    
    // Create a mock element
    const mockElement = document.createElement('div');
    Object.defineProperty(result.current.targetRef, 'current', {
      value: mockElement,
      writable: true,
    });
    
    // Re-render to trigger observation
    rerender();
    
    // Unmount to trigger cleanup
    unmount();
    
    expect(mockUnobserve).toHaveBeenCalledWith(mockElement);
  });

  it('should not observe if no target element', () => {
    renderHook(() => useIntersectionObserver());
    
    // Since targetRef.current is null, observe should not be called
    expect(mockObserve).not.toHaveBeenCalled();
  });

  it('should handle options changes', () => {
    const { rerender } = renderHook(
      ({ threshold }) => useIntersectionObserver({ threshold }),
      { initialProps: { threshold: 0.1 } }
    );
    
    expect(IntersectionObserver).toHaveBeenCalledWith(
      expect.any(Function),
      expect.objectContaining({ threshold: 0.1 })
    );
    
    // Reset mock to count calls
    vi.mocked(IntersectionObserver).mockClear();
    
    rerender({ threshold: 0.5 });
    
    // Should create a new observer with new options when deps change
    expect(IntersectionObserver).toHaveBeenCalledWith(
      expect.any(Function),
      expect.objectContaining({ threshold: 0.5 })
    );
  });
});