 import { getAuth} from "firebase/auth";
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// For Firebase JS SDK v7.20.0 and later, measurementId is optional
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
export const db = getFirestore(app); // ✅ correct usage

console.log(auth);

const user = auth.currentUser;

console.log(user);


//firebase.auth.currentUser → gives you the current user
