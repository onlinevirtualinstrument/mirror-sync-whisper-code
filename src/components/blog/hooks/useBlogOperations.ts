
import { useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { 
  createBlogPost as createPost, 
  updateBlogPost as updatePost, 
  deleteBlogPost as deletePost,
  saveDraftToFirestore,
  deleteDraftById
} from '../services/blogDataService';
import { BlogPost } from '../blog';

export const useBlogOperations = () => {
  const { user } = useAuth();

  const createBlogPost = useCallback(async (postData: Omit<BlogPost, 'id'>) => {
    if (!user) {
      toast.error('You must be logged in');
      throw new Error('User not authenticated');
    }

    try {
      const postId = await createPost(postData);
      toast.success('Blog post created successfully');
      return postId;
    } catch (error) {
      console.error('Error creating blog post:', error);
      toast.error('Failed to create blog post');
      throw error;
    }
  }, [user]);

  const updateBlogPost = useCallback(async (id: string, postData: Partial<BlogPost>) => {
    if (!user) {
      toast.error('You must be logged in');
      throw new Error('User not authenticated');
    }

    try {
      await updatePost(id, postData);
      toast.success('Blog post updated successfully');
    } catch (error) {
      console.error('Error updating blog post:', error);
      toast.error('Failed to update blog post');
      throw error;
    }
  }, [user]);

  const deleteBlogPost = useCallback(async (id: string) => {
    if (!user) {
      toast.error('You must be logged in');
      throw new Error('User not authenticated');
    }

    try {
      await deletePost(id);
      toast.success('Blog post deleted successfully');
    } catch (error) {
      console.error('Error deleting blog post:', error);
      toast.error('Failed to delete blog post');
      throw error;
    }
  }, [user]);

  const saveDraft = useCallback(async (draftId: string, draftData: any) => {
    if (!user) {
      toast.error('You must be logged in');
      throw new Error('User not authenticated');
    }

    try {
      await saveDraftToFirestore(draftId, draftData);
      toast.success('Draft saved successfully');
    } catch (error) {
      console.error('Error saving draft:', error);
      toast.error('Failed to save draft');
      throw error;
    }
  }, [user]);

  const deleteDraft = useCallback(async (draftId: string) => {
    if (!user) {
      toast.error('You must be logged in');
      throw new Error('User not authenticated');
    }

    try {
      await deleteDraftById(draftId);
      toast.success('Draft deleted successfully');
    } catch (error) {
      console.error('Error deleting draft:', error);
      toast.error('Failed to delete draft');
      throw error;
    }
  }, [user]);

  return {
    createBlogPost,
    updateBlogPost,
    deleteBlogPost,
    saveDraft,
    deleteDraft
  };
};
