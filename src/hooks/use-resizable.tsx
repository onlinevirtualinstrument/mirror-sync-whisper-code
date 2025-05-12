
import { useRef, useCallback } from 'react';

export function useResizable() {
  const leftPaneRef = useRef<HTMLDivElement>(null);
  const rightPaneRef = useRef<HTMLDivElement>(null);
  const separatorRef = useRef<HTMLDivElement>(null);

  const initResizable = useCallback(() => {
    const leftPane = leftPaneRef.current;
    const rightPane = rightPaneRef.current;
    const separator = separatorRef.current;

    if (!leftPane || !rightPane || !separator) return;

    let isResizing = false;
    let initialX: number;
    let initialLeftWidth: number;
    let initialRightWidth: number;
    
    const startResizing = (e: MouseEvent) => {
      isResizing = true;
      initialX = e.clientX;
      
      const leftRect = leftPane.getBoundingClientRect();
      const rightRect = rightPane.getBoundingClientRect();
      
      initialLeftWidth = leftRect.width;
      initialRightWidth = rightRect.width;
      
      document.body.style.cursor = 'col-resize';
    };
    
    const stopResizing = () => {
      isResizing = false;
      document.body.style.cursor = '';
    };
    
    const resize = (e: MouseEvent) => {
      if (!isResizing) return;
      
      const containerWidth = leftPane.parentElement?.clientWidth || 0;
      const deltaX = e.clientX - initialX;
      
      // Calculate new widths as percentages
      const newLeftWidth = Math.min(
        Math.max(30, (initialLeftWidth + deltaX) / containerWidth * 100),
        70
      );
      const newRightWidth = Math.min(
        Math.max(30, (initialRightWidth - deltaX) / containerWidth * 100),
        70
      );
      
      leftPane.style.width = `${newLeftWidth}%`;
      rightPane.style.width = `${newRightWidth}%`;
    };
    
    separator.addEventListener('mousedown', startResizing);
    document.addEventListener('mousemove', resize);
    document.addEventListener('mouseup', stopResizing);

    return () => {
      separator.removeEventListener('mousedown', startResizing);
      document.removeEventListener('mousemove', resize);
      document.removeEventListener('mouseup', stopResizing);
    };
  }, []);

  return {
    leftPaneRef,
    rightPaneRef,
    separatorRef,
    initResizable
  };
}
