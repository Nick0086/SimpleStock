import { useCallback, useRef, useEffect } from 'react';

/**
 * Debounce hook for performance optimization
 */
export function useDebounce(callback, delay) {
  const timeoutRef = useRef(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return useCallback((...args) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      callback(...args);
    }, delay);
  }, [callback, delay]);
}

/**
 * Memoization utility for expensive computations
 */
export function memoize(fn) {
  const cache = new Map();

  return (...args) => {
    const key = JSON.stringify(args);
    if (cache.has(key)) {
      return cache.get(key);
    }

    const result = fn(...args);
    cache.set(key, result);
    return result;
  };
}

/**
 * Intersection Observer hook for lazy loading
 */
export function useIntersectionObserver(callback, options = {}) {
  const targetRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        callback();
      }
    }, options);

    if (targetRef.current) {
      observer.observe(targetRef.current);
    }

    return () => {
      if (targetRef.current) {
        observer.unobserve(targetRef.current);
      }
    };
  }, [callback, options]);

  return targetRef;
}

/**
 * Resource preloading utility
 */
export const resourcePreloader = {
  preloadImage(src) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = resolve;
      img.onerror = reject;
      img.src = src;
    });
  },

  preloadComponent(importFn) {
    return importFn();
  }
};

/**
 * Performance monitoring utility
 */
export const performanceMonitor = {
  marks: new Map(),

  startMark(name) {
    performance.mark(`${name}-start`);
    this.marks.set(name, Date.now());
  },

  endMark(name) {
    const startTime = this.marks.get(name);
    if (startTime) {
      const duration = Date.now() - startTime;
      performance.mark(`${name}-end`);
      performance.measure(name, `${name}-start`, `${name}-end`);
      return duration;
    }
    return null;
  },

  getMetrics() {
    return performance.getEntriesByType('measure');
  }
}; 