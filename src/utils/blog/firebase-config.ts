
import { getFirestore,  doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { app } from '@/utils/auth/firebase';

// Initialize Cloud Firestore
export const db = getFirestore(app);

// // Replace with actual user info
// const userId = "4jYqLK7OxpaB5FoNXIQaLMZrtdx2";
// const email = "kamleshguptaom4@gmail.com";

// await setDoc(doc(db, "userRoles", userId), {
//   userId,
//   email,
//   role: "super_admin",
//   createdAt: serverTimestamp(),
// });
