
// Re-export all firebase utilities
export * from './auth';
export * from './config';
export * from './room-chat';
export * from './room-participants';
export * from './room-settings';
export * from './rooms';

// Import and export Firebase Firestore functions needed
import { doc, onSnapshot, getFirestore } from 'firebase/firestore';
import { app } from './config';

const db = getFirestore(app);

export {
  doc,
  onSnapshot,
  db
};
