
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

type GestureDirection = 'left' | 'right' | 'up' | 'down';

interface GestureNavigationOptions {
  enableSwipe?: boolean;
  enableKeyboard?: boolean;
  swipeThreshold?: number;
  navigationMap?: Record<GestureDirection, string>;
}

export function useGestureNavigation(options: GestureNavigationOptions = {}) {
  const {
    enableSwipe = true,
    enableKeyboard = true,
    swipeThreshold = 100,
    navigationMap = {
      left: '',
      right: '',
      up: '',
      down: '',
    },
  } = options;

  const navigate = useNavigate();
  const [touchStart, setTouchStart] = useState({ x: 0, y: 0 });
  const [touchEnd, setTouchEnd] = useState({ x: 0, y: 0 });

  // Handle keyboard navigation
  useEffect(() => {
    if (!enableKeyboard) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      let direction: GestureDirection | null = null;

      switch (e.key) {
        case 'ArrowLeft':
          direction = 'left';
          break;
        case 'ArrowRight':
          direction = 'right';
          break;
        case 'ArrowUp':
          direction = 'up';
          break;
        case 'ArrowDown':
          direction = 'down';
          break;
        default:
          return;
      }

      const path = navigationMap[direction];
      if (path) {
        e.preventDefault();
        navigate(path);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [enableKeyboard, navigate, navigationMap]);

  // Handle touch gestures
  useEffect(() => {
    if (!enableSwipe) return;

    const handleTouchStart = (e: TouchEvent) => {
      setTouchStart({
        x: e.touches[0].clientX,
        y: e.touches[0].clientY,
      });
    };

    const handleTouchMove = (e: TouchEvent) => {
      setTouchEnd({
        x: e.touches[0].clientX,
        y: e.touches[0].clientY,
      });
    };

    const handleTouchEnd = () => {
      const deltaX = touchStart.x - touchEnd.x;
      const deltaY = touchStart.y - touchEnd.y;

      let direction: GestureDirection | null = null;

      if (Math.abs(deltaX) > Math.abs(deltaY)) {
        // Horizontal swipe
        if (Math.abs(deltaX) > swipeThreshold) {
          direction = deltaX > 0 ? 'left' : 'right';
        }
      } else {
        // Vertical swipe
        if (Math.abs(deltaY) > swipeThreshold) {
          direction = deltaY > 0 ? 'up' : 'down';
        }
      }

      if (direction) {
        const path = navigationMap[direction];
        if (path) {
          navigate(path);
        }
      }

      // Reset touch points
      setTouchEnd({ x: 0, y: 0 });
    };

    document.addEventListener('touchstart', handleTouchStart, { passive: true });
    document.addEventListener('touchmove', handleTouchMove, { passive: true });
    document.addEventListener('touchend', handleTouchEnd);

    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [enableSwipe, navigate, navigationMap, swipeThreshold, touchStart, touchEnd]);

  // Return empty object as this hook doesn't need to expose anything
  return {};
}
