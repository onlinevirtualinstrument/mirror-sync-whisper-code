
import { initializeApp } from "firebase/app";
import { getAuth, onAuthStateChanged, User } from "firebase/auth";
import { Timestamp, getFirestore, orderBy, collection, addDoc, deleteDoc, query, where, doc, setDoc, getDocs, onSnapshot, serverTimestamp, getDoc, updateDoc, arrayUnion, arrayRemove, QueryDocumentSnapshot } from "firebase/firestore";
import { app, db, auth, listenToRoomData, saveRoomToFirestore, addUserToRoom, isUserRoomParticipant, saveChatMessage, deleteRoomChat, deleteRoomFromFirestore, sendPrivateMessage, getPrivateMessages, markMessageAsRead } from '../auth/firebase';

export { 
  app, 
  db, 
  auth,
  listenToRoomData,
  saveRoomToFirestore,
  addUserToRoom,
  isUserRoomParticipant,
  saveChatMessage,
  deleteRoomChat,
  deleteRoomFromFirestore,
  // Add private messaging exports
  sendPrivateMessage,
  getPrivateMessages,
  markMessageAsRead,
  // Export additional Firebase utilities for use in components
  getDoc,
  getDocs,
  collection,
  query,
  where,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  setDoc,
  serverTimestamp,
  arrayUnion,
  arrayRemove,
  onSnapshot,
  orderBy,
  onAuthStateChanged,
  // Types
  QueryDocumentSnapshot,
  User,
  Timestamp
};
