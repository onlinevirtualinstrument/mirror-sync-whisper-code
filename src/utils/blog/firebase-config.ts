import { initializeApp } from "firebase/app";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { Timestamp, getFirestore,orderBy, collection, addDoc, deleteDoc, query, where, doc, setDoc, getDocs, onSnapshot, serverTimestamp, getDoc, updateDoc, arrayUnion, arrayRemove } from "firebase/firestore";
import { app, db, auth, listenToRoomData } from '../auth/firebase';


export { 
  app, 
  db, 
  auth,
  listenToRoomData,
  // Export additional Firebase utilities for use in blog components
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
  orderBy
};