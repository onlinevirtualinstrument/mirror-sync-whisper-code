
// Re-export all participant management functions
export {
  isUserRoomParticipant,
  addUserToRoom,
  removeUserFromRoom,
  updateUserInstrument,
  toggleUserMute
} from './room-participant-management';

// Re-export room joining functions
export {
  joinRoomWithCode,
  requestToJoinRoom
} from './room-joining';

// Re-export room lifecycle functions
export {
  handleJoinRequest,
  toggleRoomChat,
  toggleAutoCloseRoom,
  updateRoomSettings
} from './room-lifecycle';
