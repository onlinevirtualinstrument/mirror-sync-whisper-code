
export interface BlogPost {
  id: string;
  title: string;
  content: string;
  authorId: string;
  authorName: string;
  authorPhotoURL?: string;          // optional
  createdAt?: number;
  updatedAt?: number;    
  imageUrl?:string;
  status?:string;           // optional
  scheduledFor?: number;    // optional - timestamp for scheduled posts
  authorContactDetails?: string;   // optional (was required)

}

 
export interface UserRole {
  userId: string;
  email: string;
  displayName?: string;
  role: 'user' | 'admin' | 'super_admin';
  createdAt: number;
}


// src/components/blog/types.ts
export interface BlogDraft {
  id: string;
  title: string;
  content: string;
  imageUrl?: string;
  authorId: string;
  authorName: string;
  createdAt: number;
  updatedAt: number;
  status: 'draft' | 'published';
}
