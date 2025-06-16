
import {
  setDoc,
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDocs,
  getDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
} from 'firebase/firestore';
import { auth, db } from '@/utils/auth/firebase';
import { BlogPost, UserRole, BlogDraft } from '@/components/blog/blog';


// Collections
const blogsCollection = collection(db, 'blogs');
const userRolesCollection = collection(db, 'userRoles');

// Get all blog posts
export const getAllBlogPosts = async (): Promise<BlogPost[]> => {
  const q = query(blogsCollection, orderBy('createdAt', 'desc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as BlogPost));
};

// Get blog by ID
export const getBlogPostById = async (id: string): Promise<BlogPost | null> => {
  const docRef = doc(db, 'blogs', id);
  const docSnap = await getDoc(docRef);
  return docSnap.exists() ? ({ id: docSnap.id, ...docSnap.data() } as BlogPost) : null;
};

// Get role of user from userRoles collection
export const getUserRole = async (email: string): Promise<UserRole | null> => {
  if (!email) return null;

  const docRef = doc(userRolesCollection, email); // ✅ use email as document ID
  const docSnap = await getDoc(docRef);

  if (!docSnap.exists()) return null;

  const data = docSnap.data();

  return {
    email: data.email,
    role: data.role,
    displayName: data.displayName,
    createdAt: data.createdAt,
  } as UserRole;
};



export const isUserSuperAdmin = async (): Promise<boolean> => {
  const user = auth.currentUser;
  if (!user || !user.email) return false;

  const roleDoc = await getUserRole(user.email.toLowerCase()); // ✅ use email as doc ID
  return (
    !!roleDoc &&
    roleDoc.role === 'super_admin' &&
    ['kamleshguptaom4@gmail.com', 'kamleshguptaom@gmail.com'].includes(roleDoc.email)
  );
};



export const canUserEditBlogs = async (): Promise<boolean> => {
  const user = auth.currentUser;
  if (!user || !user.email) return false;

  const roleDoc = await getUserRole(user.email);
  return !!roleDoc && ['admin', 'super_admin'].includes(roleDoc.role);
};




export const createBlogPost = async (
  postData: Omit<BlogPost, 'id' | 'authorId' | 'createdAt' | 'authorName' | 'authorPhotoURL'>
): Promise<string> => {
  const user = auth.currentUser;

  if (!user || !user.email) throw new Error('Login required');
console.log('createBlogPost - '+user.email )
console.log("Current user email:", auth.currentUser?.email);
  const roleDoc = await getUserRole(user.email.toLowerCase());
  console.log("Role doc fetched:", roleDoc);
  if (!roleDoc || !['admin', 'super_admin'].includes(roleDoc.role)) {
    console.log('createBlogPost - '+roleDoc )
    throw new Error('Insufficient permission');
  }

  const newPost = {
    ...postData,
    authorId: user.uid,
    authorName: user.displayName || 'Anonymous',
    authorPhotoURL: user.photoURL || '',
    createdAt: Date.now(),
  };

  const cleanedPost = JSON.parse(JSON.stringify(newPost));
  console.log("newPost ",newPost, " Cleaned postData to send: ", cleanedPost, "blogsCollection - ", blogsCollection);
  // const docRef = await addDoc(blogsCollection, cleanedPost);
  try {
  const docRef = await addDoc(blogsCollection, cleanedPost);
  return docRef.id;
} catch (error) {
  console.error('Error adding blog:', error);
  throw error;
}

  // return docRef.id;
};



// Update blog post
export const updateBlogPost = async (id: string, postData: Partial<Omit<BlogPost, 'id' | 'authorId' | 'createdAt'>>): Promise<void> => {
  const user = auth.currentUser;
  if (!user) throw new Error('Login required');

  const blogPost = await getBlogPostById(id);
  if (!blogPost) throw new Error('Post not found');

  const roleDoc = await getUserRole(user.uid);
  const isOwner = blogPost.authorId === user.uid;
  const isSuperAdmin = roleDoc?.role === 'super_admin';

  if (!isOwner && !isSuperAdmin) throw new Error('Not allowed');

  await updateDoc(doc(db, 'blogs', id), {
    ...postData,
    updatedAt: Date.now(),
  });
};

// Delete blog post
export const deleteBlogPost = async (id: string): Promise<void> => {
  const user = auth.currentUser;
  if (!user) throw new Error('Login required');

  const blogPost = await getBlogPostById(id);
  if (!blogPost) throw new Error('Post not found');

  const roleDoc = await getUserRole(user.uid);
  const isOwner = blogPost.authorId === user.uid;
  const isSuperAdmin = roleDoc?.role === 'super_admin';

  if (!isOwner && !isSuperAdmin) throw new Error('Not allowed');

  await deleteDoc(doc(db, 'blogs', id));
};

// Assign a role (only by super_admin)
export const setUserRole = async (email: string, role: 'user' | 'admin' | 'super_admin'): Promise<void> => {
  const user = auth.currentUser;
  if (!user) throw new Error('Login required');

  const currentRole = await getUserRole(user.uid);
  if (!currentRole || currentRole.role !== 'super_admin') {
    throw new Error('Only super admins can assign roles');
  }

  const existing = query(userRolesCollection, where('email', '==', email));
  // query(userRolesCollection, where('userId', '==', user.uid));
  const snapshot = await getDocs(existing);

  if (!snapshot.empty) {
    const docRef = doc(db, 'userRoles', snapshot.docs[0].id);
    await updateDoc(docRef, { role, updatedAt: Date.now() });
  } else {
    await addDoc(userRolesCollection, {
      email,
      role,
      createdAt: Date.now(),
      grantedBy: user.email,
    });
  }
};




export const saveDraftToFirestore = async (draftId: string, data: any) => {
  const draftRef = doc(collection(db, 'blog-drafts'), draftId);
  await setDoc(draftRef, data, { merge: true });
};

export const getDraftById = async (draftId: string) => {
  const draftRef = doc(db, 'blog-drafts', draftId);
  const snap = await getDoc(draftRef);
  return snap.exists() ? snap.data() : null;
};

export const deleteDraftById = async (draftId: string) => {
  const draftRef = doc(db, 'blog-drafts', draftId);
  await deleteDoc(draftRef);
};


export const getUserDrafts = async (uid: string): Promise<BlogDraft[]> => {
  const draftsRef = collection(db, 'blog-drafts');
  const q = query(draftsRef, where('authorId', '==', uid));
  const snapshot = await getDocs(q);

  const drafts: BlogDraft[] = snapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      id: doc.id,
      title: data.title || '',
      content: data.content || '',
      imageUrl: data.imageUrl || '',
      authorId: data.authorId,
      authorName: data.authorName || 'Anonymous',
      createdAt: data.createdAt || Date.now(),
      updatedAt: data.updatedAt || Date.now(),
      status: data.status || 'draft',
    };
  });

  return drafts;
};
