
// Re-export all firebase utilities
export * from './auth';
export * from './config';
export * from './room-chat';
export * from './rooms';

// Export participant management functions
export {
  isUserRoomParticipant,
  addUserToRoom,
  removeUserFromRoom,
  updateUserInstrument,
  toggleUserMute
} from './room-participant-management';

// Export room joining functions
export {
  joinRoomWithCode,
  requestToJoinRoom
} from './room-joining';

// Export room lifecycle functions
export {
  handleJoinRequest,
  toggleRoomChat,
  toggleAutoCloseRoom,
  updateRoomSettings
} from './room-lifecycle';

// Export room settings functions
export {
  broadcastNote,
  listenToInstrumentNotes
} from './room-settings';

// Import and export Firebase Firestore functions needed
import { doc, onSnapshot, getFirestore } from 'firebase/firestore';
import { app } from './config';

const db = getFirestore(app);

export {
  doc,
  onSnapshot,
  db
};
