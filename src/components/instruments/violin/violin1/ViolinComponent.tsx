
import React, { lazy, Suspense, useState, useEffect } from 'react';
import { ViolinType } from './ViolinExperience';
import '@/index.css'; // Using alias for proper import
import { Loader } from 'lucide-react';
import Navbar from '../../../layout/Navbar';

// Lazy load the ViolinExperience component
const ViolinExperience = lazy(() => import('./ViolinExperience'));

interface ViolinComponentProps {
  initialViolinType?: ViolinType;
  className?: string;
}

// Function to get border gradient based on violin type
const getViolinBorderColors = (violinType: ViolinType): string => {
  switch(violinType) {
    case 'classical':
      return 'from-amber-500 via-amber-700 to-amber-500';
    case 'electric':
      return 'from-blue-500 via-purple-600 to-blue-500';
    case 'baroque':
      return 'from-yellow-600 via-red-700 to-yellow-600';
    case 'fiddle':
      return 'from-orange-500 via-red-600 to-orange-500';
    case 'synth':
      return 'from-cyan-400 via-blue-600 to-cyan-400';
    case 'five-string':
      return 'from-green-500 via-emerald-700 to-green-500';
    case 'semi-acoustic':
      return 'from-violet-500 via-purple-700 to-violet-500';
    case 'hardanger':
      return 'from-indigo-500 via-blue-700 to-indigo-500';
    default:
      return 'from-violet-400 via-indigo-400 to-purple-400';
  }
};

/**
 * A self-contained Violin Component that can be used in any project
 * Simply import and use this component to add the violin experience to your project
 */
const ViolinComponent: React.FC<ViolinComponentProps> = ({
  initialViolinType = 'classical',
  className = ''
}) => {
  const [currentViolinType, setCurrentViolinType] = useState<ViolinType>(initialViolinType);
  const [borderGradient, setBorderGradient] = useState<string>(getViolinBorderColors(initialViolinType));

  // Update border color when violin type changes
  useEffect(() => {
    const handleViolinTypeChange = (e: Event) => {
      if (e instanceof CustomEvent && e.detail && e.detail.violinType) {
        setCurrentViolinType(e.detail.violinType);
        setBorderGradient(getViolinBorderColors(e.detail.violinType));
      }
    };

    // Listen for violin type change events
    document.addEventListener('violin-type-changed', handleViolinTypeChange);
    
    return () => {
      document.removeEventListener('violin-type-changed', handleViolinTypeChange);
    };
  }, []);

  return (
    // Double border: outer border with double lines + inner gradient border
    // <div className="min-h-screen p-1.5 border-4 border-double border-gray-300 dark:border-gray-700 rounded-xl">
      <div className={`min-h-screen bg-gradient-to-b from-violin to-white dark:from-violin-dark dark:to-gray-900 p-4 rounded-lg border-4 border-gradient-to-r ${borderGradient} animate-scale-up`}>
         <Navbar />
        <Suspense fallback={
          <div className="flex items-center justify-center min-h-screen">
            <div className="text-center">
              <Loader className="h-8 w-8 animate-spin mx-auto text-violet-600" />
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">Loading Violin Experience...</p>
            </div>
          </div>
        }>
          <ViolinExperience initialViolinType={initialViolinType} />
        </Suspense>
      </div>
    // </div>
  );
};

export default ViolinComponent;

// Re-export types for external usage
export type { ViolinType } from './ViolinExperience';
export type { ViolinSettings } from './types';
