
// Fullscreen utilities with proper accessibility handling
export const toggleFullscreen = async (): Promise<boolean> => {
  try {
    if (!document.fullscreenElement) {
      // Entering fullscreen
      const element = document.documentElement;
      
      // Remove any existing aria-hidden attributes before entering fullscreen
      removeAriaHiddenFromFocusedElements();
      
      if (element.requestFullscreen) {
        await element.requestFullscreen();
      } else if ((element as any).webkitRequestFullscreen) {
        await (element as any).webkitRequestFullscreen();
      } else if ((element as any).msRequestFullscreen) {
        await (element as any).msRequestFullscreen();
      }
      
      // Add fullscreen class for styling
      document.body.classList.add('fullscreen-mode');
      
      // Set high z-index for dropdowns and popups in fullscreen
      const style = document.createElement('style');
      style.id = 'fullscreen-dropdown-fix';
      style.textContent = `
        .fullscreen-mode [role="dialog"],
        .fullscreen-mode [data-radix-popper-content-wrapper],
        .fullscreen-mode [data-radix-select-content],
        .fullscreen-mode [data-radix-dropdown-menu-content],
        .fullscreen-mode [data-radix-popover-content],
        .fullscreen-mode [data-radix-tooltip-content] {
          z-index: 10000 !important;
          position: fixed !important;
        }
        
        .fullscreen-mode [data-radix-select-viewport] {
          background: white !important;
          border: 1px solid #e2e8f0 !important;
          border-radius: 8px !important;
          box-shadow: 0 10px 38px -10px rgba(22, 23, 24, 0.35), 0 10px 20px -15px rgba(22, 23, 24, 0.2) !important;
        }
        
        .fullscreen-mode .dark [data-radix-select-viewport] {
          background: #1e293b !important;
          border-color: #475569 !important;
        }
      `;
      document.head.appendChild(style);
      
      return true;
    } else {
      // Exiting fullscreen
      if (document.exitFullscreen) {
        await document.exitFullscreen();
      } else if ((document as any).webkitExitFullscreen) {
        await (document as any).webkitExitFullscreen();
      } else if ((document as any).msExitFullscreen) {
        await (document as any).msExitFullscreen();
      }
      
      // Remove fullscreen class and styles
      document.body.classList.remove('fullscreen-mode');
      const fullscreenStyle = document.getElementById('fullscreen-dropdown-fix');
      if (fullscreenStyle) {
        fullscreenStyle.remove();
      }
      
      return false;
    }
  } catch (error) {
    console.error('Fullscreen toggle failed:', error);
    return false;
  }
};

const removeAriaHiddenFromFocusedElements = () => {
  // Find all elements with aria-hidden="true"
  const hiddenElements = document.querySelectorAll('[aria-hidden="true"]');
  
  hiddenElements.forEach(element => {
    // Check if element or its descendants have focus or are interactive
    const hasFocus = element.contains(document.activeElement) || element === document.activeElement;
    const isInteractive = element.matches('button, input, select, textarea, [tabindex], [role="button"], [role="dialog"]');
    
    if (hasFocus || isInteractive) {
      // Remove aria-hidden and store original value for restoration
      element.setAttribute('data-original-aria-hidden', 'true');
      element.removeAttribute('aria-hidden');
    }
  });
};

export const restoreAriaHidden = () => {
  // Restore original aria-hidden values after exiting fullscreen
  const elementsToRestore = document.querySelectorAll('[data-original-aria-hidden="true"]');
  
  elementsToRestore.forEach(element => {
    element.setAttribute('aria-hidden', 'true');
    element.removeAttribute('data-original-aria-hidden');
  });
};

// Listen for fullscreen changes to handle cleanup
document.addEventListener('fullscreenchange', () => {
  if (!document.fullscreenElement) {
    restoreAriaHidden();
    document.body.classList.remove('fullscreen-mode');
    
    // Remove fullscreen styles
    const fullscreenStyle = document.getElementById('fullscreen-dropdown-fix');
    if (fullscreenStyle) {
      fullscreenStyle.remove();
    }
  }
});

export const isFullscreen = (): boolean => {
  return !!document.fullscreenElement;
};
