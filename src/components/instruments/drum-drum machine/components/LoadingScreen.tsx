
import React from 'react';
import { Skeleton } from './ui/skeleton';

interface LoadingScreenProps {
  message?: string;
}

const LoadingScreen = ({ message = 'Loading drums...' }: LoadingScreenProps) => {
  return (
    <div className="flex flex-col items-center justify-center h-64 p-8">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      <p className="mt-4 text-slate-600 dark:text-slate-300">{message}</p>
      <div className="space-y-3 w-full max-w-md mt-4">
        <Skeleton className="h-12 w-full rounded-lg" />
        <div className="grid grid-cols-3 gap-2">
          <Skeleton className="h-20 w-full rounded-lg" />
          <Skeleton className="h-20 w-full rounded-lg" />
          <Skeleton className="h-20 w-full rounded-lg" />
        </div>
      </div>
    </div>
  );
};

export default LoadingScreen;
