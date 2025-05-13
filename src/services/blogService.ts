import { collection, addDoc, updateDoc, deleteDoc, doc, getDocs, getDoc, query, where, orderBy, serverTimestamp, Timestamp } from 'firebase/firestore';
import { auth } from '@/utils/auth/firebase';
import { db } from '@/utils/blog/firebase-config';
import { BlogPost, UserRole } from '@/types/blog';

// Blog posts collection reference
const blogsCollection = collection(db, 'blogs');
const userRolesCollection = collection(db, 'userRoles');

// Get all blog posts ordered by creation date
export const getAllBlogPosts = async (): Promise<BlogPost[]> => {
  const q = query(blogsCollection, orderBy('createdAt', 'desc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as BlogPost));
};

// Get a single blog post by ID
export const getBlogPostById = async (id: string): Promise<BlogPost | null> => {
  const docRef = doc(db, 'blogs', id);
  const docSnap = await getDoc(docRef);
  
  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() } as BlogPost;
  }
  
  return null;
};

// Create a new blog post
export const createBlogPost = async (postData: Omit<BlogPost, 'id' | 'authorId' | 'createdAt' | 'authorName' | 'authorPhotoURL'>): Promise<string> => {
  const user = auth.currentUser;
  
  if (!user) {
    throw new Error('User must be logged in to create a blog post');
  }
  
  const userRole = await getUserRole(user.uid);
  
  if (!userRole || (userRole.role !== 'admin' && userRole.role !== 'super_admin')) {
    throw new Error('User does not have permission to create blog posts');
  }
  
  const newPost = {
    ...postData,
    authorId: user.uid,
    authorName: user.displayName || 'Anonymous',
    authorPhotoURL: user.photoURL || '',
    createdAt: Date.now()
  };
  
  const docRef = await addDoc(blogsCollection, newPost);
  return docRef.id;
};

// Update an existing blog post
export const updateBlogPost = async (id: string, postData: Partial<Omit<BlogPost, 'id' | 'authorId' | 'createdAt'>>): Promise<void> => {
  const user = auth.currentUser;
  
  if (!user) {
    throw new Error('User must be logged in to update a blog post');
  }
  
  const blogPost = await getBlogPostById(id);
  
  if (!blogPost) {
    throw new Error('Blog post not found');
  }
  
  const userRole = await getUserRole(user.uid);
  
  // Check if user has permission to edit this post
  if (blogPost.authorId !== user.uid && (!userRole || userRole.role !== 'super_admin')) {
    throw new Error('User does not have permission to edit this blog post');
  }
  
  const updatedData = {
    ...postData,
    updatedAt: Date.now()
  };
  
  const blogRef = doc(db, 'blogs', id);
  await updateDoc(blogRef, updatedData);
};

// Delete a blog post
export const deleteBlogPost = async (id: string): Promise<void> => {
  const user = auth.currentUser;
  
  if (!user) {
    throw new Error('User must be logged in to delete a blog post');
  }
  
  const blogPost = await getBlogPostById(id);
  
  if (!blogPost) {
    throw new Error('Blog post not found');
  }
  
  const userRole = await getUserRole(user.uid);
  
  // Only super_admin or the author can delete a post
  if (blogPost.authorId !== user.uid && (!userRole || userRole.role !== 'super_admin')) {
    throw new Error('User does not have permission to delete this blog post');
  }
  
  const blogRef = doc(db, 'blogs', id);
  await deleteDoc(blogRef);
};

// Get user role
export const getUserRole = async (userId: string): Promise<UserRole | null> => {
  const q = query(userRolesCollection, where('userId', '==', userId));
  const snapshot = await getDocs(q);
  
  if (snapshot.empty) {
    return null;
  }

  const docData = snapshot.docs[0]?.data();
  if (
    docData &&
    typeof docData.userId === 'string' &&
    typeof docData.email === 'string' &&
    typeof docData.role === 'string' &&
    typeof docData.createdAt === 'number'
  ) {
    return {
      id: snapshot.docs[0].id,
      userId: docData.userId,
      email: docData.email,
      role: docData.role,
      displayName: docData.displayName,
      createdAt: docData.createdAt,
    } as UserRole;
  }
  
  return null;
};

// Set user role (super_admin only)
export const setUserRole = async (email: string, role: 'user' | 'admin' | 'super_admin'): Promise<void> => {
  const user = auth.currentUser;
  
  if (!user) {
    throw new Error('User must be logged in to set user roles');
  }
  
  const userRole = await getUserRole(user.uid);
  
  if (!userRole || userRole.role !== 'super_admin') {
    throw new Error('Only super admins can set user roles');
  }
  
  // Check if user already has a role
  const q = query(userRolesCollection, where('email', '==', email));
  const snapshot = await getDocs(q);
  
  if (!snapshot.empty) {
    // Update existing role
    const docRef = doc(db, 'userRoles', snapshot.docs[0].id);
    await updateDoc(docRef, { role, updatedAt: Date.now() });
  } else {
    // Create new role
    await addDoc(userRolesCollection, {
      email,
      role,
      createdAt: Date.now()
    });
  }
};

// Check if current user can create/edit blogs
export const canUserEditBlogs = async (): Promise<boolean> => {
  const user = auth.currentUser;
  
  if (!user) {
    return false;
  }
  
  const userRole = await getUserRole(user.uid);
  
  return !!userRole && (userRole.role === 'admin' || userRole.role === 'super_admin');
};

// Check if current user is super_admin
export const isUserSuperAdmin = async (): Promise<boolean> => {
  const user = auth.currentUser;
  
  if (!user) {
    return false;
  }
  
  const userRole = await getUserRole(user.uid);
  
  return !!userRole && userRole.role === 'super_admin';
};
