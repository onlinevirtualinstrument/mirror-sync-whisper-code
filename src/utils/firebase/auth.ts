
import { onAuthStateChanged } from "firebase/auth";
import { collection, getDocs, doc, getDoc, setDoc, updateDoc, query, where, serverTimestamp } from "firebase/firestore";
import { toast } from '@/hooks/use-toast';
import { auth, db } from './config';

// Wait until the user is logged in
export const initializeAuthListener = () => {
  onAuthStateChanged(auth, async (user) => {
    if (user && user.email) {
      console.log("✅ Logged in as:", user.email);

      try {
        // Query the userRoles collection
        const q = query(
          collection(db, "userRoles"),
          where("email", "==", user.email)
        );

        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          const userData = querySnapshot.docs[0].data();
          console.log("🎯 Role from Firestore:", userData.role);
        } else {
          console.warn("⚠️ No role data found for this user.");
        }
      } catch (error) {
        console.error("🔥 Error fetching role:", error);
      }
    } else {
      console.log("❌ No user is logged in.");
    }
  });
};

// This function now creates users in the users collection when they register
export const syncUserWithFirestore = async (user: any): Promise<void> => {
  if (!user || !user.uid) return;
  
  try {
    const userRef = doc(db, "users", user.uid);
    const snapshot = await getDoc(userRef);
    
    if (!snapshot.exists()) {
      await setDoc(userRef, {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName || 'Anonymous',
        photoURL: user.photoURL || '',
        createdAt: serverTimestamp()
      });
      console.log("User added to Firestore:", user.uid);
    } else {
      // Update existing user data
      await updateDoc(userRef, {
        displayName: user.displayName || snapshot.data().displayName || 'Anonymous',
        photoURL: user.photoURL || snapshot.data().photoURL || '',
        lastLogin: serverTimestamp()
      });
    }
  } catch (error) {
    console.error("Error syncing user to Firestore:", error);
  }
};

// Call this function when user signs in
export const handleUserSignIn = async (user: any): Promise<void> => {
  if (!user) return;
  await syncUserWithFirestore(user);
  
  // Also sync to userRoles if not exists
  try {
    if (user.email) {
      const userRoleRef = doc(db, "userRoles", user.email.toLowerCase());
      const snapshot = await getDoc(userRoleRef);
      
      if (!snapshot.exists()) {
        // Only create basic user role if not exists
        await setDoc(userRoleRef, {
          email: user.email.toLowerCase(),
          role: "user", // Default role
          createdAt: serverTimestamp()
        });
      }
    }
  } catch (error) {
    console.error("Error ensuring user role:", error);
  }
};
