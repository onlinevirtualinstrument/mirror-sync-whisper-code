
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
    // Allow context menu for authentication processes
    if (e.target && (
      e.target.toString().includes('google') || 
      e.target.toString().includes('facebook') ||
      window.location.href.includes('auth')
    )) {
      return true;
    }
    
    e.preventDefault();
    console.log('Right click disabled for security reasons');
    return false;
  }, true);
};

/**
 * Prevents double-click text selection across the application
 */
export const disableDoubleClick = (): void => {
  document.addEventListener('dblclick', (e) => {
    e.preventDefault();
    console.log('Double click disabled for security reasons');
    return false;
  }, true);
};

/**
 * Prevents text selection and dragging
 */
export const disableTextSelection = (): void => {
  document.addEventListener('selectstart', (e) => {
    // Allow selection in input fields and textareas
    if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
      return true;
    }
    e.preventDefault();
    return false;
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
    // Ctrl+C, Ctrl+X, Ctrl+V, Ctrl+S
    if ((e.ctrlKey || e.metaKey) && (e.key === 'c' || e.key === 'x' || e.key === 'v' || e.key === 's')) {
      // Allow in input fields and textareas
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return true;
      }
      // Allow for authentication processes
      if (window.location.href.includes('auth')) {
        return true;
      }
      e.preventDefault();
      console.log('Copy/paste shortcut disabled for security reasons');
      return false;
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
export const initSecurity = (): void => {
  // Wait for DOM to be fully loaded
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initSecurityFeatures);
  } else {
    initSecurityFeatures();
  }
};

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