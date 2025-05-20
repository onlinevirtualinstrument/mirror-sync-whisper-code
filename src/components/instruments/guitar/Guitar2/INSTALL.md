
# Guitar App Integration Guide

This guide will help you integrate the Guitar App into your existing React project.

## Step 1: Copy Files

Copy the entire `guitar-app` folder into your project's src directory.

## Step 2: Update Your Router

Add the Guitar App routes to your main router file:

```jsx
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import GuitarRoutes from './guitar-app';

const AppRouter = () => {
  return (
    <Routes>
      {/* Your existing routes */}
      <Route path="/" element={<YourHomePage />} />
      
      {/* Add the Guitar App routes - this adds /virtual-guitar route */}
      {GuitarRoutes}
      
      {/* Your other routes */}
    </Routes>
  );
};

export default AppRouter;
```

## Step 3: Add Navigation Links

Add a link to the Virtual Guitar in your navigation menu:

```jsx
import { GuitarAppLink } from './guitar-app/components/GuitarAppLink';

const Navigation = () => {
  return (
    <nav>
      {/* Your existing navigation items */}
      <GuitarAppLink variant="button" />
    </nav>
  );
};
```

## Dependencies

The Guitar App relies on the following packages:

- react-router-dom
- react-helmet
- lucide-react
- tailwindcss

Make sure these are installed in your project.

## Customization

You can customize the appearance by modifying the Guitar theme files:

- `guitar-app/components/virtual-guitar/ThemeSelector.tsx` - Contains color schemes
- `guitar-app/components/VirtualGuitarComponent.tsx` - Main component logic

## Need Help?

Refer to the README.md file in the guitar-app folder for detailed documentation.
