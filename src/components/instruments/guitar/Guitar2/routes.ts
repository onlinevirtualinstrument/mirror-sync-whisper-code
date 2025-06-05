
// Guitar routes configuration
export const guitarRoutes = {
  home: '/',
  guitar: '/guitar',
  settings: '/guitar/settings',
  tuner: '/guitar/tuner'
};

export const getGuitarRoute = (path: keyof typeof guitarRoutes): string => {
  return guitarRoutes[path];
};

// Export for compatibility
export const GuitarRoutes = guitarRoutes;
