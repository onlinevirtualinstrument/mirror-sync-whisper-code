
import { initializeApp } from "firebase/app";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { getFirestore, collection, addDoc, deleteDoc, query, where, doc, setDoc, getDocs, onSnapshot, serverTimestamp, getDoc, updateDoc, arrayUnion, arrayRemove } from "firebase/firestore";
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
    // Ensure participants and participantIds are properly synchronized
    // This is crucial for the security rules to work correctly
    const participantIds = room.participants ? room.participants.map((p: any) => p.id) : [];
    await setDoc(roomRef, {
      ...room,
      participants: room.participants || [],
      maxParticipants: room.maxParticipants || 3,
      hostInstrument: room.hostInstrument || 'piano',
      createdAt: room.createdAt || serverTimestamp(),
      allowDifferentInstruments: room.allowDifferentInstruments ?? true,
      participantIds: participantIds, // Make sure this is properly synced with participants
      lastUpdated: serverTimestamp() // Add this field to track when the room was last updated
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
  onError?: (error: any) => void
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
        participantIds: doc.data().participantIds || []
      }));
      onSuccess(rooms);
    },
    (error) => {
      console.error("🔥 Firestore listener error:", error);
      if (onError) onError(error);
    }
  );
};

// Check if user is a participant in a room
export const isUserRoomParticipant = async (roomId: string, userId: string): Promise<boolean> => {
  try {
    const roomRef = doc(db, "musicRooms", roomId);
    const roomSnap = await getDoc(roomRef);
    
    if (roomSnap.exists()) {
      const roomData = roomSnap.data();
      
      // Check if user is in participants array
      const participantIds = roomData.participantIds || [];
      const participants = roomData.participants || [];
      
      // Check both participantIds array and participants array to be safe
      return participantIds.includes(userId) || participants.some((p: any) => p.id === userId);
    }
    
    return false;
  } catch (error) {
    console.error("Error checking room participation:", error);
    return false;
  }
};

// Add user as a participant to room
export const addUserToRoom = async (roomId: string, user: any): Promise<boolean> => {
  try {
    const roomRef = doc(db, "musicRooms", roomId);
    const roomSnap = await getDoc(roomRef);
    
    if (!roomSnap.exists()) {
      toast({ description: "Room no longer exists." });
      return false;
    }
    
    const roomData = roomSnap.data();
    let participants = roomData.participants || [];
    const participantIds = roomData.participantIds || [];
    
    // Check if user is already a participant
    if (participantIds.includes(user.uid)) {
      console.log("User is already a participant of this room");
      return true; // User is already in the room
    }
    
    // Check if room is full
    if (participants.length >= (roomData.maxParticipants || 3)) {
      toast({ description: "Room is full." });
      return false;
    }
    
    // For private rooms, check if user is approved
    if (!roomData.isPublic) {
      const pendingRequests = roomData.pendingRequests || [];
      const isApproved = pendingRequests.includes(user.uid);
      const isHost = roomData.participants && roomData.participants.some((p: any) => p.id === user.uid && p.isHost);
      
      if (!isApproved && !isHost) {
        toast({ description: "You need approval to join this private room." });
        return false;
      }
      
      // Remove from pending requests if approved
      if (isApproved) {
        await updateDoc(roomRef, {
          pendingRequests: arrayRemove(user.uid)
        });
      }
    }
    
    // Add user to participants
    const newParticipant = {
      id: user.uid,
      name: user.displayName || 'Anonymous',
      instrument: 'piano', // Default instrument
      avatar: user.photoURL || '',
      isHost: false,
      status: 'active'
    };
    
    await updateDoc(roomRef, {
       participantIds: arrayUnion(user.uid)
    });
    
    // Then update participants array
    await updateDoc(roomRef, {
      participants: arrayUnion(newParticipant),
    });
    
    console.log("User successfully added to room:", user.uid);
    toast({ description: "Successfully joined room!" });
    return true;
  } catch (error) {
    console.error("Error adding user to room:", error);
    toast({ description: "Failed to join room. Please try again." });
    return false;
  }
};

// Remove user from a room
export const removeUserFromRoom = async (roomId: string, userId: string): Promise<void> => {
  try {
    const roomRef = doc(db, "musicRooms", roomId);
    const roomSnap = await getDoc(roomRef);
    
    if (!roomSnap.exists()) return;
    
    const roomData = roomSnap.data();
    const participants = roomData.participants || [];
    
    // Find user in participants
    const userIndex = participants.findIndex((p: any) => p.id === userId);
    
    if (userIndex === -1) return; // User not in room
    
    // Check if user is host
    const isHost = participants[userIndex].isHost;
    
    if (isHost && participants.length > 1) {
      // If host is leaving and there are other participants, assign a new host
      const newHost = participants.find((p: any) => p.id !== userId);
      
      if (newHost) {
        // Remove old host
        const updatedParticipants = participants.filter((p: any) => p.id !== userId);
        
        // Update new host status
        const newHostIndex = updatedParticipants.findIndex((p: any) => p.id === newHost.id);
        if (newHostIndex !== -1) {
          updatedParticipants[newHostIndex].isHost = true;
        }
        
        // Update room with new host and without old host
        await updateDoc(roomRef, {
          participants: updatedParticipants,
          participantIds: roomData.participantIds.filter((id: string) => id !== userId)
        });
      }
    } else if (isHost) {
      // If host is the only one or last one leaving, delete room
      await deleteRoomFromFirestore(roomId);
    } else {
      // Regular participant leaving
      const updatedParticipants = participants.filter((p: any) => p.id !== userId);
      
      await updateDoc(roomRef, {
        participants: updatedParticipants,
        participantIds: roomData.participantIds.filter((id: string) => id !== userId)
      });
    }
  } catch (error) {
    console.error("Error removing user from room:", error);
    toast({ description: "Failed to leave room properly." });
  }
};

// Update participant's instrument in a room
export const updateUserInstrument = async (roomId: string, userId: string, instrument: string): Promise<void> => {
  try {
    const roomRef = doc(db, "musicRooms", roomId);
    const roomSnap = await getDoc(roomRef);
    
    if (!roomSnap.exists()) return;
    
    const roomData = roomSnap.data();
    const participants = roomData.participants || [];
    
    // Find and update the user's instrument
    const updatedParticipants = participants.map((p: any) => {
      if (p.id === userId) {
        return { ...p, instrument };
      }
      return p;
    });
    
    await updateDoc(roomRef, {
      participants: updatedParticipants
    });
  } catch (error) {
    console.error("Error updating instrument:", error);
    toast({ description: "Failed to update your instrument." });
  }
};

// Handle join request for private rooms
export const handleJoinRequest = async (roomId: string, userId: string, approve: boolean): Promise<void> => {
  try {
    const roomRef = doc(db, "musicRooms", roomId);
    
    if (approve) {
      // If approved, first add to participantIds (critical for security rules)
      await updateDoc(roomRef, {
        pendingRequests: arrayRemove(userId),
        participantIds: arrayUnion(userId)
      });
      
      // Fetch user data to add to participants
      const userRecord = await getDoc(doc(db, "users", userId));
      let userData: any = { id: userId, name: 'Anonymous', avatar: '' };
      
      if (userRecord.exists()) {
        userData = {
          id: userId,
          name: userRecord.data().displayName || 'Anonymous',
          instrument: 'piano',
          avatar: userRecord.data().photoURL || '',
          isHost: false,
          status: 'active'
        };
      } else {
        // If user record doesn't exist, try to get info from auth
        const authUsers = await getDocs(collection(db, "users"));
        const foundUser = authUsers.docs.find(doc => doc.id === userId);
        if (foundUser) {
          const data = foundUser.data();
          userData = {
            id: userId,
            name: data.displayName || 'Anonymous',
            instrument: 'piano',
            avatar: data.photoURL || '',
            isHost: false,
            status: 'active'
          };
        }
      }
      
      // Then add to participants array
      await updateDoc(roomRef, {
        participants: arrayUnion(userData)
      });
    } else {
      // If rejected, just remove from pendingRequests
      await updateDoc(roomRef, {
        pendingRequests: arrayRemove(userId)
      });
    }
  } catch (error) {
    console.error("Error handling join request:", error);
    toast({ description: "Failed to process join request." });
  }
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



// New function to get room data and listen for updates
export const listenToRoomData = (
  roomId: string,
  onSuccess: (room: any) => void,
  onError?: (error: any) => void
) => {
  const roomRef = doc(db, "musicRooms", roomId);
  
  return onSnapshot(
    roomRef,
    (doc) => {
      if (doc.exists()) {
        const roomData = {
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt || new Date(),
          participants: doc.data().participants || [],
          pendingRequests: doc.data().pendingRequests || [],
          participantIds: doc.data().participantIds || []
        };
        onSuccess(roomData);
      } else {
        // Room doesn't exist
        if (onError) onError(new Error("Room not found"));
      }
    },
    (error) => {
      console.error("Error listening to room:", error);
      if (onError) onError(error);
    }
  );
};

// Add private messaging between room participants
export const sendPrivateMessage = async (
  roomId: string, 
  senderId: string, 
  receiverId: string, 
  message: string
): Promise<boolean> => {
  try {
    await addDoc(collection(db, "musicRooms", roomId, "privateMessages"), {
      senderId,
      receiverId,
      message,
      timestamp: serverTimestamp(),
      read: false
    });
    return true;
  } catch (error) {
    console.error("Error sending private message:", error);
    toast({ description: "Failed to send private message." });
    return false;
  }
};

// Get private messages between two users in a room
export const getPrivateMessages = (
  roomId: string,
  userId1: string,
  userId2: string,
  onSuccess: (messages: any[]) => void,
  onError?: (error: any) => void
) => {
  const q = query(
    collection(db, "musicRooms", roomId, "privateMessages"),
    where("senderId", "in", [userId1, userId2]),
    where("receiverId", "in", [userId1, userId2])
  );

  return onSnapshot(
    q,
    (snapshot) => {
      const messages = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data()
      }));
      onSuccess(messages);
    },
    (error) => {
      console.error("Error getting private messages:", error);
      if (onError) onError(error);
    }
  );
};

// Mark private message as read
export const markMessageAsRead = async (
  roomId: string,
  messageId: string
): Promise<void> => {
  try {
    const messageRef = doc(db, "musicRooms", roomId, "privateMessages", messageId);
    await updateDoc(messageRef, { read: true });
  } catch (error) {
    console.error("Error marking message as read:", error);
  }
};

// Save a room template
export const saveRoomTemplate = async (
  userId: string,
  template: any
): Promise<string | null> => {
  try {
    const templateRef = await addDoc(collection(db, "roomTemplates"), {
      ...template,
      creatorId: userId,
      createdAt: serverTimestamp()
    });
    
    return templateRef.id;
  } catch (error) {
    console.error("Error saving room template:", error);
    toast({ description: "Failed to save room template." });
    return null;
  }
};

// Get user's room templates
export const getUserRoomTemplates = (
  userId: string,
  onSuccess: (templates: any[]) => void,
  onError?: (error: any) => void
) => {
  const q = query(
    collection(db, "roomTemplates"),
    where("creatorId", "==", userId)
  );
  
  return onSnapshot(
    q,
    (snapshot) => {
      const templates = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data()
      }));
      onSuccess(templates);
    },
    (error) => {
      console.error("Error getting room templates:", error);
      if (onError) onError(error);
    }
  );
};

// Create a room from a template
export const createRoomFromTemplate = async (
  template: any,
  user: any
): Promise<string | null> => {
  try {
    // Generate a unique ID for the new room
    const roomId = doc(collection(db, "musicRooms")).id;
    
    // Create the host participant
    const hostParticipant = {
      id: user.uid,
      name: user.displayName || 'Anonymous',
      instrument: template.hostInstrument || 'piano',
      avatar: user.photoURL || '',
      isHost: true,
      status: 'active'
    };
    
    // Create the new room with template settings
    const newRoom = {
      id: roomId,
      name: template.name || 'Music Room',
      description: template.description || '',
      isPublic: template.isPublic ?? true,
      maxParticipants: template.maxParticipants || 3,
      hostInstrument: template.hostInstrument || 'piano',
      allowDifferentInstruments: template.allowDifferentInstruments ?? true,
      participants: [hostParticipant],
      participantIds: [user.uid],
      pendingRequests: [],
      createdAt: serverTimestamp(),
      creatorId: user.uid,
      lastUpdated: serverTimestamp()
    };
    
    await setDoc(doc(db, "musicRooms", roomId), newRoom);
    
    return roomId;
  } catch (error) {
    console.error("Error creating room from template:", error);
    toast({ description: "Failed to create room from template." });
    return null;
  }
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