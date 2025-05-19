
# Violin Component

This is a self-contained Violin Component that can be easily integrated into any React project.

## Installation

1. Copy the entire `violin` directory into your React project's components folder
2. Ensure you have the required dependencies:
   - `@/components/ui/*` (shadcn/ui components)
   - `lucide-react` for icons
   - `sonner` for toast notifications

## Usage

### Basic Integration

```jsx
import { ViolinComponent } from './components/violin';

function App() {
  return (
    <div className="app">
      <ViolinComponent />
    </div>
  );
}
```

### With Custom Initial Violin Type

```jsx
import { ViolinComponent } from './components/violin';
import { ViolinType } from './components/violin';

function App() {
  return (
    <div className="app">
      <ViolinComponent initialViolinType="electric" />
    </div>
  );
}
```

### With Custom Styling

```jsx
import { ViolinComponent } from './components/violin';

function App() {
  return (
    <div className="app">
      <ViolinComponent className="custom-class" />
    </div>
  );
}
```

## Types

The component exports these TypeScript types for use in your project:

- `ViolinType`: The different violin variants available
- `ViolinSettings`: The settings object structure for violin customization

## Audio Integration

The violin component manages its own audio context and handling. No additional audio setup is required.
