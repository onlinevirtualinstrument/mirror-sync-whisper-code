
import React from 'react';

interface PlaceholderComponentProps {
  instrumentName?: string;
}

const PlaceholderComponent: React.FC<PlaceholderComponentProps> = ({ instrumentName = 'Instrument' }) => {
  return (
    <div className="w-full max-w-4xl mx-auto p-8 bg-secondary/10 rounded-xl border border-secondary/20 shadow-sm">
      <div className="flex flex-col items-center justify-center gap-4 py-12">
        <div className="text-4xl font-bold text-primary">Coming Soon</div>
        <p className="text-muted-foreground text-center max-w-md">
          The {instrumentName} component is currently in development. 
          Check back soon for an interactive {instrumentName.toLowerCase()} experience!
        </p>
      </div>
    </div>
  );
};

export default PlaceholderComponent;
