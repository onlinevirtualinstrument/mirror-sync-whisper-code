
import React from 'react';

interface SimpleInstrumentProps {
  instrument: string;
}

const SimpleInstrument: React.FC<SimpleInstrumentProps> = ({ instrument }) => {
  // This is a placeholder component that would integrate with the actual instrument components
  // Based on the instrument prop, it would render the appropriate instrument component
  
  return (
    <div className="h-full flex items-center justify-center bg-white dark:bg-slate-900">
      <div className="text-center p-4">
        <h2 className="text-2xl font-bold mb-4">
          {instrument.charAt(0).toUpperCase() + instrument.slice(1)} Instrument
        </h2>
        <p className="text-muted-foreground mb-4">
          Interactive {instrument} interface would be loaded here
        </p>
        <div className="w-full max-w-md mx-auto border-2 border-dashed border-gray-300 rounded-lg p-8">
          <div className="text-xl text-primary">
            {instrument === 'piano' && '🎹'}
            {instrument === 'guitar' && '🎸'}
            {instrument === 'drums' && '🥁'}
            {instrument === 'flute' && '🎵'}
            {instrument === 'saxophone' && '🎷'}
            {instrument === 'trumpet' && '🎺'}
            {instrument === 'violin' && '🎻'}
            {['xylophone', 'marimba', 'kalimba'].includes(instrument) && '🔔'}
            {['drummachine', 'chordprogression'].includes(instrument) && '🎛️'}
            {['veena'].includes(instrument) && '🪕'}
          </div>
          <div className="mt-4">
            The {instrument} component would connect to the actual instrument implementation
          </div>
        </div>
      </div>
    </div>
  );
};

export default SimpleInstrument;
