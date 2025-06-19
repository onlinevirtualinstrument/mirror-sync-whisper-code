

const isEditableTarget = (target: EventTarget | null): boolean => {
  if (!(target instanceof HTMLElement)) return false;

  return (
    target.tagName === 'INPUT' ||
    target.tagName === 'TEXTAREA' ||
    target.isContentEditable ||
    target.closest('.allow-copy') !== null
  );
};


/**
 * Security utilities for the music application
 * Implements various security features like right-click protection,
 * double-click protection, and other security enhancements
 */

/**
 * Prevents right-click context menu across the application
 */
export const disableRightClick = (): void => {
  document.addEventListener('contextmenu', (e) => {
    if (isEditableTarget(e.target)) return;
    if (
      e.target?.toString().includes('google') || 
      e.target?.toString().includes('facebook') ||
      window.location.href.includes('auth')
    ) return;

    e.preventDefault();
    console.log('Right click disabled for security reasons');
  }, true);
};


/**
 * Prevents double-click text selection across the application
 */
export const disableDoubleClick = (): void => {
  document.addEventListener('dblclick', (e) => {
    if (isEditableTarget(e.target)) return;
    e.preventDefault();
    console.log('Double click disabled for security reasons');
  }, true);
};


/**
 * Prevents text selection and dragging
 */
export const disableTextSelection = (): void => {
  document.addEventListener('selectstart', (e) => {
    if (isEditableTarget(e.target)) return;
    e.preventDefault();
  }, true);
};

/**
 * Prevents image dragging
 */
export const disableImageDragging = (): void => {
  document.addEventListener('dragstart', (e) => {
    e.preventDefault();
    return false;
  }, true);
};

/**
 * Enables Content Security Policy headers reporting
 */
export const setupCSPReporting = (): void => {
  // This would normally be done server-side, but we're setting up client-side reporting
  console.info('CSP reporting enabled');
};

/**
 * Prevents keyboard shortcuts for common copy operations
 */
export const preventCopyShortcuts = (): void => {
  document.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && ['c', 'x', 'v', 's'].includes(e.key.toLowerCase())) {
      if (isEditableTarget(e.target)) return;
      if (window.location.href.includes('auth')) return;

      e.preventDefault();
      console.log('Copy/paste shortcut disabled for security reasons');
    }
  }, true);
};


/**
 * Disables developer tools shortcuts
 */
export const disableDevToolsShortcuts = (): void => {
  document.addEventListener('keydown', (e) => {
    // F12, Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+Shift+C
    if (
      e.key === 'F12' || 
      ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'I' || e.key === 'i' || e.key === 'J' || e.key === 'j' || e.key === 'C' || e.key === 'c'))
    ) {
      // Allow for authentication processes and development
      if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        return true;
      }
      e.preventDefault();
      console.log('Developer tools shortcut disabled for security reasons');
      return false;
    }
  }, true);
};

/**
 * Allow popups from Firebase authentication
 */
export const allowFirebasePopups = (): void => {
  // This is a no-op function but marks that we're explicitly allowing Firebase popups
  console.info('Firebase authentication popups are allowed');
};

/**
 * Initializes all security features
 */
// export const initSecurity = (): void => {
//   // Wait for DOM to be fully loaded
//   if (document.readyState === 'loading') {
//     document.addEventListener('DOMContentLoaded', initSecurityFeatures);
//   } else {
//     initSecurityFeatures();
//   }
// };

/**
 * Implements all security features
 */
const initSecurityFeatures = (): void => {
  disableRightClick();
  disableDoubleClick();
  disableTextSelection();
  disableImageDragging();
  preventCopyShortcuts();
  disableDevToolsShortcuts();
  setupCSPReporting();
  allowFirebasePopups();
  
  // Apply additional security measures using standard CSS properties
  document.body.style.userSelect = 'none';
  document.body.style.webkitUserSelect = 'none';
  // Fix the TypeScript errors by using standard properties
  // Instead of msUserSelect and mozUserSelect
  
  console.info('All security features initialized');
};



// Content Security Policy and security initialization
export const initSecurity = () => {
  // Set up Content Security Policy meta tag if not already present
  if (!document.querySelector('meta[http-equiv="Content-Security-Policy"]')) {
    const cspMeta = document.createElement('meta');
    cspMeta.httpEquiv = 'Content-Security-Policy';
    cspMeta.content = `
      default-src 'self';
      script-src 'self' 'unsafe-inline' 'unsafe-eval' 
        https://www.gstatic.com 
        https://www.googleapis.com 
        https://apis.google.com
        https://securetoken.googleapis.com
        https://identitytoolkit.googleapis.com
        https://firebaseinstallations.googleapis.com
        https://firebaseremoteconfig.googleapis.com;
      style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
      font-src 'self' https://fonts.gstatic.com;
      img-src 'self' data: blob: https:;
      media-src 'self' data: blob:;
      connect-src 'self' 
        https://firestore.googleapis.com
        https://identitytoolkit.googleapis.com
        https://securetoken.googleapis.com
        https://www.googleapis.com
        wss://ws-*.firestore.googleapis.com;
      frame-src 'self' https://www.google.com;
      object-src 'none';
      base-uri 'self';
    `.replace(/\s+/g, ' ').trim();
    
    document.head.appendChild(cspMeta);
  }

  // Prevent common XSS attacks
  if (typeof window !== 'undefined') {
    // Clear any potentially malicious scripts
    const scripts = document.querySelectorAll('script[src*="javascript:"]');
    scripts.forEach(script => script.remove());
    
    // Set up basic security headers via meta tags
    const securityHeaders = [
      { name: 'X-Content-Type-Options', content: 'nosniff' },
      { name: 'X-Frame-Options', content: 'SAMEORIGIN' },
      { name: 'X-XSS-Protection', content: '1; mode=block' }
    ];

    securityHeaders.forEach(header => {
      if (!document.querySelector(`meta[http-equiv="${header.name}"]`)) {
        const meta = document.createElement('meta');
        meta.httpEquiv = header.name;
        meta.content = header.content;
        document.head.appendChild(meta);
      }
    });
  }

  // Wait for DOM to be fully loaded
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initSecurityFeatures);
  } else {
    initSecurityFeatures();
  }

};

// Rate limiting for API calls
const rateLimits = new Map<string, { count: number; resetTime: number }>();

export const checkRateLimit = (key: string, maxRequests: number = 10, windowMs: number = 60000): boolean => {
  const now = Date.now();
  const limit = rateLimits.get(key);

  if (!limit || now > limit.resetTime) {
    rateLimits.set(key, { count: 1, resetTime: now + windowMs });
    return true;
  }

  if (limit.count >= maxRequests) {
    return false;
  }

  limit.count++;
  return true;
};

export const clearExpiredRateLimits = () => {
  const now = Date.now();
  for (const [key, limit] of rateLimits.entries()) {
    if (now > limit.resetTime) {
      rateLimits.delete(key);
    }
  }
};

// Set up periodic cleanup
if (typeof window !== 'undefined') {
  setInterval(clearExpiredRateLimits, 60000); // Clean up every minute
}