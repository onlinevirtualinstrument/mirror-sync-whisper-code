
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyBwSWa4qwkgCXo4uM6quPyCPOy3QHY3d3k",
  authDomain: "onlinevirtualinstrument-88c16.firebaseapp.com",
  projectId: "onlinevirtualinstrument-88c16",
  storageBucket: "onlinevirtualinstrument-88c16.firebasestorage.app",
  messagingSenderId: "1048782197972",
  appId: "1:1048782197972:web:14f09d80dbf8b487009741",
  measurementId: "G-K3STGX00G4"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
