
export interface BlogPost {
  id: string;
  title: string;
  content: string;
  authorId: string;
  authorName: string;
  authorPhotoURL?: string;
  createdAt: number;
  updatedAt?: number;
}
 
export interface UserRole {
  userId: string;
  email: string;
  displayName?: string;
  role: 'user' | 'admin' | 'super_admin';
  createdAt: number;
}
