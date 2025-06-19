
import { doc, getDoc, addDoc, updateDoc, getDocs, query, where, collection } from 'firebase/firestore';
import { auth, db } from '@/utils/auth/firebase';
import { UserRole } from '../blog';

const userRolesCollection = collection(db, 'userRoles');

export const getUserRole = async (email: string): Promise<UserRole | null> => {
  try {
    if (!email) return null;

    const normalizedEmail = email.toLowerCase().trim();
    const docRef = doc(userRolesCollection, normalizedEmail);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) return null;

    const data = docSnap.data();
    return {
      userId: data.userId || '',
      email: data.email,
      role: data.role,
      displayName: data.displayName,
      createdAt: data.createdAt || Date.now(),
    } as UserRole;
  } catch (error) {
    console.error('Error fetching user role:', error);
    return null;
  }
};

export const isUserSuperAdmin = async (): Promise<boolean> => {
  try {
    const user = auth.currentUser;
    if (!user || !user.email) return false;

    const roleDoc = await getUserRole(user.email.toLowerCase());
    return (
      !!roleDoc &&
      roleDoc.role === 'super_admin' &&
      ['kamleshguptaom4@gmail.com', 'kamleshguptaom@gmail.com'].includes(roleDoc.email)
    );
  } catch (error) {
    console.error('Error checking super admin status:', error);
    return false;
  }
};

export const canUserEditBlogs = async (): Promise<boolean> => {
  try {
    const user = auth.currentUser;
    if (!user || !user.email) return false;

    const roleDoc = await getUserRole(user.email);
    return !!roleDoc && ['admin', 'super_admin'].includes(roleDoc.role);
  } catch (error) {
    console.error('Error checking edit permissions:', error);
    return false;
  }
};

export const setUserRole = async (email: string, role: 'user' | 'admin' | 'super_admin'): Promise<void> => {
  try {
    if (!email || !role) throw new Error('Email and role are required');
    
    const user = auth.currentUser;
    if (!user) throw new Error('Login required');

    const currentRole = await getUserRole(user.email || '');
    if (!currentRole || currentRole.role !== 'super_admin') {
      throw new Error('Only super admins can assign roles');
    }

    const existing = query(userRolesCollection, where('email', '==', email));
    const snapshot = await getDocs(existing);

    if (!snapshot.empty) {
      const docRef = doc(db, 'userRoles', snapshot.docs[0].id);
      await updateDoc(docRef, { role, updatedAt: Date.now() });
    } else {
      await addDoc(userRolesCollection, {
        userId: '',
        email,
        role,
        createdAt: Date.now(),
        grantedBy: user.email,
      });
    }
  } catch (error) {
    console.error('Error setting user role:', error);
    throw error;
  }
};
