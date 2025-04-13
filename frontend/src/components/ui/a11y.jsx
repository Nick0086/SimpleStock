import { useEffect } from 'react';

export function SkipLink({ target }) {
  return (
    <a
      href={`#${target}`}
      className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:p-4 focus:bg-white focus:text-black"
    >
      Skip to main content
    </a>
  );
}

export function LiveRegion({ children, ariaLive = 'polite' }) {
  return (
    <div
      className="sr-only"
      role="status"
      aria-live={ariaLive}
      aria-atomic="true"
    >
      {children}
    </div>
  );
}

export function useA11yAnnounce() {
  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        // Handle escape key for modals, dropdowns, etc.
        document.dispatchEvent(new CustomEvent('closeOverlay'));
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, []);
}

// Focus trap for modals
export function useFocusTrap(ref) {
  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const focusableElements = element.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    
    const firstFocusable = focusableElements[0];
    const lastFocusable = focusableElements[focusableElements.length - 1];

    const handleTab = (e) => {
      if (e.key !== 'Tab') return;

      if (e.shiftKey) {
        if (document.activeElement === firstFocusable) {
          lastFocusable.focus();
          e.preventDefault();
        }
      } else {
        if (document.activeElement === lastFocusable) {
          firstFocusable.focus();
          e.preventDefault();
        }
      }
    };

    element.addEventListener('keydown', handleTab);
    firstFocusable?.focus();

    return () => element.removeEventListener('keydown', handleTab);
  }, [ref]);
} 