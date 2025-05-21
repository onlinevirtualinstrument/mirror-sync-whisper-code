
// Export all Firebase functionality from a single entry point
export * from './config';
export * from './auth';
export * from './rooms';
export * from './room-participants';
export * from './room-chat';

// Initialize auth listener when this module is imported
import { initializeAuthListener } from './auth';
initializeAuthListener();
