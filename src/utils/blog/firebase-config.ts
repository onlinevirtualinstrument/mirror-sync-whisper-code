
// Re-export all Firebase functionality for blog-related components
export * from '../firebase';

// Export specific types needed for blog components
export type { User } from "firebase/auth"; // ✅ Correct
export { Timestamp, QueryDocumentSnapshot } from "firebase/firestore";