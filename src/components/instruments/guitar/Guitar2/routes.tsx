
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import VirtualGuitarComponent from './components/VirtualGuitarComponent';

export const GuitarRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<VirtualGuitarComponent />} />
    </Routes>
  );
};

export { default as GuitarAppLink } from './components/GuitarAppLink';
