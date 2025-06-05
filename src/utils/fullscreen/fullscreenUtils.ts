
// Enhanced fullscreen utilities with proper ARIA handling
export const toggleFullscreen = async (element?: HTMLElement): Promise<boolean> => {
  try {
    const targetElement = element || document.documentElement;
    
    if (document.fullscreenElement) {
      // Exit fullscreen
      await document.exitFullscreen();
      restoreAriaAttributes();
      return false;
    } else {
      // Enter fullscreen
      preserveAriaAttributes();
      await targetElement.requestFullscreen();
      handleFullscreenAriaFix();
      return true;
    }
  } catch (error) {
    console.error('Fullscreen toggle failed:', error);
    return false;
  }
};

// Store original ARIA attributes before fullscreen
let originalAriaAttributes: Map<Element, string | null> = new Map();

const preserveAriaAttributes = () => {
  originalAriaAttributes.clear();
  
  // Find all elements with aria-hidden
  const ariaHiddenElements = document.querySelectorAll('[aria-hidden]');
  ariaHiddenElements.forEach(element => {
    originalAriaAttributes.set(element, element.getAttribute('aria-hidden'));
  });
};

const handleFullscreenAriaFix = () => {
  // Remove aria-hidden from focused elements and their ancestors
  const focusedElement = document.activeElement;
  if (focusedElement) {
    removeFocusedElementAriaHidden(focusedElement);
  }
  
  // Add event listener for focus changes
  document.addEventListener('focusin', handleFocusChange);
};

const handleFocusChange = (event: FocusEvent) => {
  if (document.fullscreenElement && event.target) {
    removeFocusedElementAriaHidden(event.target as Element);
  }
};

const removeFocusedElementAriaHidden = (element: Element) => {
  let current: Element | null = element;
  
  while (current && current !== document.body) {
    if (current.hasAttribute('aria-hidden')) {
      current.removeAttribute('aria-hidden');
    }
    current = current.parentElement;
  }
};

const restoreAriaAttributes = () => {
  document.removeEventListener('focusin', handleFocusChange);
  
  // Restore original aria-hidden attributes
  originalAriaAttributes.forEach((originalValue, element) => {
    if (originalValue !== null) {
      element.setAttribute('aria-hidden', originalValue);
    } else {
      element.removeAttribute('aria-hidden');
    }
  });
  
  originalAriaAttributes.clear();
};

// Fullscreen event handlers
export const addFullscreenListeners = (callbacks: {
  onEnter?: () => void;
  onExit?: () => void;
} = {}) => {
  const handleFullscreenChange = () => {
    if (document.fullscreenElement) {
      callbacks.onEnter?.();
    } else {
      callbacks.onExit?.();
      restoreAriaAttributes();
    }
  };

  document.addEventListener('fullscreenchange', handleFullscreenChange);
  
  return () => {
    document.removeEventListener('fullscreenchange', handleFullscreenChange);
  };
};
