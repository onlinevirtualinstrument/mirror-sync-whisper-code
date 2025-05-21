
// Re-export all firebase utilities
export * from './auth';
export * from './config';
export * from './room-chat';

// Selectively export from room-participants to avoid conflicts with room-settings
import {
  isUserRoomParticipant,
  addUserToRoom,
  removeUserFromRoom,
  updateUserInstrument,
  toggleUserMute,
  toggleRoomChat as toggleParticipantRoomChat,
  toggleAutoCloseRoom as toggleParticipantAutoCloseRoom,
  updateRoomSettings as updateParticipantRoomSettings,
  handleJoinRequest as handleParticipantJoinRequest,
  requestToJoinRoom as requestParticipantToJoinRoom,
  broadcastNote as broadcastParticipantNote,
  listenToInstrumentNotes as listenToParticipantInstrumentNotes
} from './room-participants';

// Re-export under unique names to avoid collisions
export {
  isUserRoomParticipant,
  addUserToRoom,
  removeUserFromRoom,
  updateUserInstrument,
  toggleUserMute,
  // Rename conflicting exports
  toggleParticipantRoomChat as toggleRoomChatByParticipant,
  toggleParticipantAutoCloseRoom as toggleAutoCloseRoomByParticipant,
  updateParticipantRoomSettings as updateRoomSettingsByParticipant,
  handleParticipantJoinRequest as handleJoinRequestByParticipant,
  requestParticipantToJoinRoom as requestToJoinRoomByParticipant,
  // Use the room-participants version for instrument collaboration
  broadcastParticipantNote as broadcastNote,
  listenToParticipantInstrumentNotes as listenToInstrumentNotes
};

// Export all from room-participants that don't conflict
export * from './room-participants';
export * from './rooms';
export * from './room-settings';

// Import and export Firebase Firestore functions needed
import { doc, onSnapshot, getFirestore } from 'firebase/firestore';
import { app } from './config';

const db = getFirestore(app);

// Room context data for room-settings.ts
export const user = {
  participants: [],
  joinRequests: []
};

export {
  doc,
  onSnapshot,
  db
};
