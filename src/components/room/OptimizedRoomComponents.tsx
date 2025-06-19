
import React, { memo, lazy, Suspense } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

// Lazy load heavy components
const RoomInstrument = lazy(() => import('./RoomInstrument'));
const RoomChat = lazy(() => import('./RoomChat'));
const RoomParticipants = lazy(() => import('./RoomParticipants'));

// Loading fallbacks
const InstrumentSkeleton = () => (
  <div className="h-64 space-y-4">
    <Skeleton className="h-8 w-48" />
    <Skeleton className="h-32 w-full" />
    <div className="flex gap-2">
      {Array.from({ length: 8 }).map((_, i) => (
        <Skeleton key={i} className="h-12 w-12 rounded" />
      ))}
    </div>
  </div>
);

const ChatSkeleton = () => (
  <div className="h-64 p-4 space-y-2">
    {Array.from({ length: 5 }).map((_, i) => (
      <div key={i} className="flex gap-2">
        <Skeleton className="h-8 w-8 rounded-full" />
        <div className="space-y-1">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-6 w-48" />
        </div>
      </div>
    ))}
  </div>
);

const ParticipantsSkeleton = () => (
  <div className="p-4 space-y-2">
    {Array.from({ length: 3 }).map((_, i) => (
      <div key={i} className="flex items-center gap-2">
        <Skeleton className="h-8 w-8 rounded-full" />
        <div className="space-y-1">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-3 w-16" />
        </div>
      </div>
    ))}
  </div>
);

// Memoized components for performance
export const OptimizedRoomInstrument = memo(() => (
  <Suspense fallback={<InstrumentSkeleton />}>
    <RoomInstrument />
  </Suspense>
));

export const OptimizedRoomChat = memo(() => (
  <Suspense fallback={<ChatSkeleton />}>
    <RoomChat />
  </Suspense>
));

export const OptimizedRoomParticipants = memo(() => (
  <Suspense fallback={<ParticipantsSkeleton />}>
    <RoomParticipants />
  </Suspense>
));

OptimizedRoomInstrument.displayName = 'OptimizedRoomInstrument';
OptimizedRoomChat.displayName = 'OptimizedRoomChat';
OptimizedRoomParticipants.displayName = 'OptimizedRoomParticipants';
