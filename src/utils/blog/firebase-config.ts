
import { getFirestore } from 'firebase/firestore';
import { app } from '@/utils/auth/firebase';

// Initialize Cloud Firestore
export const db = getFirestore(app);
