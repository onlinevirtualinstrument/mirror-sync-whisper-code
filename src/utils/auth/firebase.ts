
import { initializeApp } from "firebase/app";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { getFirestore, collection, addDoc, deleteDoc, query, where, doc, setDoc, getDocs, onSnapshot, serverTimestamp } from "firebase/firestore";
import { toast } from '@/components/ui/use-toast';

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

// Wait until the user is logged in
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
     // toast({ description: "Failed to fetch user role from Firestore." });
    }
  } else {
    console.log("❌ No user is logged in.");
  }
});


// Save a chat message in Firestore

export const saveChatMessage = async (roomId: string, message: any): Promise<string | null> => {
  try {
    // Remove undefined keys again just in case
    const cleanMessage = Object.fromEntries(
      Object.entries(message).filter(([_, v]) => v !== undefined)
    );

    const docRef = await addDoc(collection(db, "musicRooms", roomId, "chat"), cleanMessage);
    return docRef.id;
  } catch (error) {
    console.error("❌ Error saving message:", error);
    toast({ description: "Failed to send message. Try again." });
    return null;
  }
};



// Delete all chat messages of a room
export const deleteRoomChat = async (roomId: string): Promise<void> => {
  try {
    const snapshot = await getDocs(collection(db, "musicRooms", roomId, "chat"));
    const deletions = snapshot.docs.map(doc => deleteDoc(doc.ref));
    await Promise.all(deletions);
  } catch (error) {
    console.error("Error deleting chat:", error);
    toast({ description: "Failed to delete room chat." });
  }
};



// Save or update a room
export const saveRoomToFirestore = async (room: any): Promise<void> => {
  try {
    const roomRef = doc(db, "musicRooms", room.id);
    await setDoc(roomRef, {
      ...room,
      participants: room.participants || [],
      maxParticipants: room.maxParticipants || 3,
      hostInstrument: room.hostInstrument || 'piano',
      createdAt: room.createdAt || serverTimestamp(),
      allowDifferentInstruments: room.allowDifferentInstruments ?? true
    });

  } catch (error) {
    console.error("Failed to save room:", error);
    toast({ description: "Failed to save room. Please try again." });
    throw error; // so calling function can handle it
  }
};

// Delete a room (when destroyed)
export const deleteRoomFromFirestore = async (roomId: string): Promise<void> => {
  try {
    const roomRef = doc(db, "musicRooms", roomId);
    await deleteDoc(roomRef);
  } catch (error) {
    console.error("Failed to delete room:", error);
    toast({ description: "Failed to delete room." });
    throw error; // so calling function can handle it
  }
};

// Listen to all live rooms
export const listenToLiveRooms = (
  onSuccess: (rooms: any[]) => void,
  onError?: (error: any) => void // ✅ this is the fix
) => {
  return onSnapshot(
    collection(db, "musicRooms"),
    (snapshot) => {
      const rooms = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt || new Date(),
        participants: doc.data().participants || [],
        pendingRequests: doc.data().pendingRequests || [],
      }));
      onSuccess(rooms);
    },
    (error) => {
      console.error("🔥 Firestore listener error:", error);
      if (onError) onError(error); // ✅ this line uses the error handler
    }
  );
};



// rules_version = '2';
// service cloud.firestore {
//   match /databases/{database}/documents {

// 		match /{document=**} {
//       allow delete: if true;
//     }
    
//     // 🔧 Utility functions

//     // Return lowercase email of logged-in user
//     function userEmail() {
//       return request.auth.token.email.toLower();
//     }

//     // Return UID of the logged-in user
//     function userId() {
//       return request.auth.uid;
//     }

//     // Check if user has an admin or super_admin role
//     function isAdmin() {
//       return request.auth != null &&
//         get(/databases/$(database)/documents/userRoles/$(userEmail())).data.role in ["admin", "super_admin"];
//     }


//     // 📚 BLOG RULES (for CMS / blog editor features)

//     match /blogs/{blogId} {
//       // ✅ Anyone can read blogs (public content)
//       allow read: if true;

//       // 🔐 Only specific emails can create/update/delete blogs
//       allow create, update, delete: if request.auth != null &&
//         request.auth.token.email in [
//           "kamleshguptaom@gmail.com",
//           "kamleshguptaom4@gmail.com"
//         ];
//     }

//     match /blogs/{blogId}/comments/{commentId} {
//       // ✅ Anyone can read blog comments
//       allow read: if true;

//       // ✍️ Only logged-in users can post comments
//       allow create: if request.auth != null;

//       // ❌ No one can update or delete comments for now
//       allow update, delete: if false;
//     }


//     // 👤 USER ROLE MANAGEMENT

//     match /userRoles/{email} {
//       allow read: if request.auth != null;

//       allow write: if request.auth != null && (
//         // 🔐 Super admin can assign themselves
//         (userEmail() == email &&
//          request.resource.data.role == "super_admin" &&
//          userEmail() in ["kamleshguptaom@gmail.com", "kamleshguptaom4@gmail.com"])

//         // ✅ Admin can create/edit their own record
//         || (userEmail() == email && request.resource.data.role == "admin")

//         // 🔐 Super admin can assign via grantedBySuperAdminEmails field
//         || (request.resource.data.grantedBySuperAdminEmails != null &&
//             userEmail() in request.resource.data.grantedBySuperAdminEmails)
//       );
//     }


//     // 🎵 MUSIC ROOMS

//     match /musicRooms/{roomId} {

//       // ✅ Anyone can read public or private room data
//       allow read: if true;

//       // ✍️ Allow writing (e.g. joining or updating room) if:
//       allow write: if request.auth != null && (
//         // ✅ Room is public — anyone can join
//         request.resource.data.isPublic == true ||

//         // 🔐 Room is private — only allow if user is in participantIds
//         (
//           resource.data.isPublic == false &&
//           resource.data.participantIds.hasAny([userId()])
//         )
//       );
//              // ✅ Allow delete if:
//           // - the user is the host
//           // - or the user is an admin
//           // - or the room has no participants
//           // allow delete: if request.auth != null && (
//           //   userId() == resource.data.hostId ||
//           //   isAdmin() ||
//           //   (!resource.data.participants.exists() || resource.data.participants.size() == 0)
//           // );
 

//       // 💬 CHAT: musicRooms/{roomId}/chat/{messageId}
//       match /chat/{messageId} {
//         // ✅ Logged-in users can read chat
//         allow read: if request.auth != null;

//         // ✅ Logged-in users can create messages if:
//         allow create: if request.auth != null && (
//           // Room is public (chat is open to anyone)
//           get(/databases/$(database)/documents/musicRooms/$(roomId)).data.isPublic == true ||

//           // 🔐 Room is private — allow only if user is in participantIds
//           get(/databases/$(database)/documents/musicRooms/$(roomId)).data.participantIds.hasAny([userId()])
//         );
        
//       }
//     }


//     // 🛠️ OPTIONAL: Admin-only update/delete of room participants
//     match /rooms/{roomId}/participants/{userId} {
//       allow update, delete: if request.auth.uid ==
//         get(/databases/$(database)/documents/rooms/$(roomId)).data.adminId;
//     }

//   }
// }
