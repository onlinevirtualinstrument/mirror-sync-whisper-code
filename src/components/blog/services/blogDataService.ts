
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
} from 'firebase/firestore';
import { auth, db } from '@/utils/auth/firebase';
import { BlogPost, BlogDraft } from '../blog';
import { checkAndPublishScheduledPosts } from './scheduledPostService';

// Collections
const blogsCollection = collection(db, 'blogs');

// Get all blog posts - filter based on user permissions
export const getAllBlogPosts = async (): Promise<BlogPost[]> => {
  try {
    await checkAndPublishScheduledPosts();
    
    const q = query(blogsCollection, orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    const allPosts = snapshot.docs.map((doc) => {
      const data = doc.data();
      return { 
        id: doc.id, 
        ...data,
        createdAt: data.createdAt || Date.now(),
        updatedAt: data.updatedAt || Date.now()
      } as BlogPost;
    });
    
    // Check if current user is admin
    const { canUserEditBlogs } = await import('./authService');
    const isAdmin = await canUserEditBlogs();
    
    if (!isAdmin) {
      return allPosts.filter(post => post.status === 'published' || post.status === undefined);
    }
    
    return allPosts.filter(post => post.status !== 'scheduled');
  } catch (error) {
    console.error('Error fetching blog posts:', error);
    throw new Error('Failed to fetch blog posts');
  }
};

// Get scheduled blog posts - only for admins
export const getScheduledBlogPosts = async (): Promise<BlogPost[]> => {
  try {
    const { canUserEditBlogs } = await import('./authService');
    const isAdmin = await canUserEditBlogs();
    if (!isAdmin) {
      throw new Error('Unauthorized access to scheduled posts');
    }
    
    await checkAndPublishScheduledPosts();
    
    const q = query(
      blogsCollection, 
      where('status', '==', 'scheduled'),
      orderBy('scheduledFor', 'asc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => {
      const data = doc.data();
      return { 
        id: doc.id, 
        ...data,
        createdAt: data.createdAt || Date.now(),
        updatedAt: data.updatedAt || Date.now(),
        scheduledFor: data.scheduledFor || Date.now()
      } as BlogPost;
    });
  } catch (error) {
    console.error('Error fetching scheduled posts:', error);
    throw error;
  }
};

// Get blog by ID
export const getBlogPostById = async (id: string): Promise<BlogPost | null> => {
  try {
    if (!id) throw new Error('Blog post ID is required');
    
    const docRef = doc(db, 'blogs', id);
    const docSnap = await getDoc(docRef);
    
    if (!docSnap.exists()) return null;
    
    const data = docSnap.data();
    return { 
      id: docSnap.id, 
      ...data,
      createdAt: data.createdAt || Date.now(),
      updatedAt: data.updatedAt || Date.now()
    } as BlogPost;
  } catch (error) {
    console.error('Error fetching blog post:', error);
    throw new Error('Failed to fetch blog post');
  }
};

// Create a new blog post
export const createBlogPost = async (postData: Omit<BlogPost, 'id'>): Promise<string> => {
  try {
    const user = auth.currentUser;
    if (!user || !user.email) throw new Error('Login required');
    
    const { canUserEditBlogs } = await import('./authService');
    if (!(await canUserEditBlogs())) {
      throw new Error('Insufficient permission');
    }

    if (!postData.title?.trim() || !postData.content?.trim()) {
      throw new Error('Title and content are required');
    }

    const newPost = {
      ...postData,
      title: postData.title.trim(),
      content: postData.content.trim(),
      authorId: user.uid,
      authorName: user.displayName || 'Anonymous',
      authorPhotoURL: user.photoURL || '',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      status: postData.status || 'published'
    };

    const cleanedPost = Object.fromEntries(
      Object.entries(newPost).filter(([_, value]) => value !== undefined)
    );
    
    const docRef = await addDoc(blogsCollection, cleanedPost);
    return docRef.id;
  } catch (error) {
    console.error('Error creating blog post:', error);
    throw error;
  }
};

// Update a blog post
export const updateBlogPost = async (id: string, postData: Partial<BlogPost>): Promise<void> => {
  try {
    if (!id) throw new Error('Blog post ID is required');
    
    const user = auth.currentUser;
    if (!user) throw new Error('Login required');

    const blogPost = await getBlogPostById(id);
    if (!blogPost) throw new Error('Post not found');

    const { getUserRole } = await import('./authService');
    const roleDoc = await getUserRole(user.email || '');
    const isOwner = blogPost.authorId === user.uid;
    const isSuperAdmin = roleDoc?.role === 'super_admin';

    if (!isOwner && !isSuperAdmin) throw new Error('Not allowed to edit this post');

    const updateData = {
      ...postData,
      updatedAt: Date.now(),
    };

    await updateDoc(doc(db, 'blogs', id), updateData);
  } catch (error) {
    console.error('Error updating blog post:', error);
    throw error;
  }
};

// Delete a blog post
export const deleteBlogPost = async (id: string): Promise<void> => {
  try {
    if (!id) throw new Error('Blog post ID is required');
    
    const user = auth.currentUser;
    if (!user) throw new Error('Login required');

    const blogPost = await getBlogPostById(id);
    if (!blogPost) throw new Error('Post not found');

    const { getUserRole } = await import('./authService');
    const roleDoc = await getUserRole(user.email || '');
    const isOwner = blogPost.authorId === user.uid;
    const isSuperAdmin = roleDoc?.role === 'super_admin';

    if (!isOwner && !isSuperAdmin) throw new Error('Not allowed to delete this post');

    await deleteDoc(doc(db, 'blogs', id));
  } catch (error) {
    console.error('Error deleting blog post:', error);
    throw error;
  }
};

// Draft operations
export const saveDraftToFirestore = async (draftId: string, data: any) => {
  try {
    if (!draftId || !data) throw new Error('Draft ID and data are required');
    
    const draftData = {
      ...data,
      title: data.title?.trim() || '',
      content: data.content?.trim() || '',
      updatedAt: Date.now()
    };
    
    const draftRef = doc(collection(db, 'blog-drafts'), draftId);
    await setDoc(draftRef, draftData, { merge: true });
  } catch (error) {
    console.error('Error saving draft:', error);
    throw error;
  }
};

export const getDraftById = async (draftId: string) => {
  try {
    if (!draftId) throw new Error('Draft ID is required');
    
    const draftRef = doc(db, 'blog-drafts', draftId);
    const snap = await getDoc(draftRef);
    return snap.exists() ? snap.data() : null;
  } catch (error) {
    console.error('Error fetching draft:', error);
    throw error;
  }
};

export const deleteDraftById = async (draftId: string) => {
  try {
    if (!draftId) throw new Error('Draft ID is required');
    
    const draftRef = doc(db, 'blog-drafts', draftId);
    await deleteDoc(draftRef);
  } catch (error) {
    console.error('Error deleting draft:', error);
    throw error;
  }
};

export const getUserDrafts = async (uid: string): Promise<BlogDraft[]> => {
  try {
    if (!uid) throw new Error('User ID is required');
    
    const draftsRef = collection(db, 'blog-drafts');
    const q = query(draftsRef, where('authorId', '==', uid));
    const snapshot = await getDocs(q);

    return snapshot.docs.map((doc) => {
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
  } catch (error) {
    console.error('Error fetching user drafts:', error);
    throw error;
  }
};
