
// Re-export all firebase utilities
export * from './auth';
export * from './config';
export * from './room-chat';
export * from './room-participants';
export * from './rooms';
export * from './room-settings';

// Fix for missing onSnapshot
import { doc, onSnapshot } from 'firebase/firestore';
import { getFirestore } from 'firebase/firestore';
import { app } from './config';

const db = getFirestore(app);

// Temporary workaround for user object reference in room-settings.ts
// This would normally come from context or params
export const user = {
  participants: [],
  joinRequests: []
};

export {
  doc,
  onSnapshot
};
