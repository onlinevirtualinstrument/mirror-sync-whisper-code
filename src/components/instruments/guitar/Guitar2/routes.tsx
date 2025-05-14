
import React from 'react';
import { Route } from 'react-router-dom';
import { lazy, Suspense } from 'react';

// Loading fallback for better UX
const LazyLoadingFallback = () => (
  <div className="flex items-center justify-center min-h-[60vh]">
    <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
  </div>
);

// Use lazy loading with preloading hint for better performance
const VirtualGuitar = lazy(() => {
  // Add link preload hint
  const linkElement = document.createElement('link');
  linkElement.rel = 'preload';
  linkElement.as = 'script';
  linkElement.href = '/src/components/instruments/guitar/Guitar2/pages/VirtualGuitar.tsx';
  document.head.appendChild(linkElement);
  
  // Return the import
  return import('./pages/VirtualGuitar');
});

/**
 * This component provides all the routes for the Guitar App module.
 * Import and use this in your main application router.
 */
export const GuitarRoutes = (
  <Route 
    path="/virtual-guitar" 
    element={
      <Suspense fallback={<LazyLoadingFallback />}>
        <VirtualGuitar />
      </Suspense>
    } 
  />
);

export const GuitarAppLink = '/virtual-guitar';
