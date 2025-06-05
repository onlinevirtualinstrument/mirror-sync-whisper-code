
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
      
      // Remove fullscreen class
      document.body.classList.remove('fullscreen-mode');
      
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
    // Check if element or its descendants have focus
    const hasFocus = element.contains(document.activeElement) || element === document.activeElement;
    
    if (hasFocus) {
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
  }
});

export const isFullscreen = (): boolean => {
  return !!document.fullscreenElement;
};
