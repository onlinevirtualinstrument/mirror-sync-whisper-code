
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
  authorContactDetails?: string;   // optional (was required)

}

 
export interface UserRole {
  userId: string;
  email: string;
  displayName?: string;
  role: 'user' | 'admin' | 'super_admin';
  createdAt: number;
}
