
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { 
  getAllBlogPosts, 
  getScheduledBlogPosts, 
  getUserDrafts,
  deleteBlogPost
} from '../services/blogDataService';
import { canUserEditBlogs } from '../services/authService';
import { BlogPost } from '../blog';

type ViewMode = 'published' | 'scheduled' | 'drafts';

export const useBlogList = () => {
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [scheduledPosts, setScheduledPosts] = useState<BlogPost[]>([]);
  const [draftPosts, setDraftPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [canEdit, setCanEdit] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('published');
  const [filteredPosts, setFilteredPosts] = useState<BlogPost[]>([]);
  const [visibleCount, setVisibleCount] = useState(6);
  
  const { user } = useAuth();

  const fetchPosts = useCallback(async () => {
    try {
      const posts = await getAllBlogPosts();
      setBlogPosts(posts);
      if (viewMode === 'published') {
        setFilteredPosts(posts);
      }
    } catch (error) {
      console.error('Error fetching blog posts:', error);
      toast.error('Failed to load blog posts');
    }
  }, [viewMode]);

  const fetchScheduledPosts = useCallback(async () => {
    if (!canEdit) return;
    
    try {
      const scheduled = await getScheduledBlogPosts();
      setScheduledPosts(scheduled);
      if (viewMode === 'scheduled') {
        setFilteredPosts(scheduled);
      }
    } catch (error) {
      console.error('Error fetching scheduled posts:', error);
      toast.error('Failed to load scheduled posts');
    }
  }, [canEdit, viewMode]);

  const fetchDrafts = useCallback(async () => {
    if (!canEdit || !user) return;
    
    try {
      const drafts = await getUserDrafts(user.uid);
      const draftPosts: BlogPost[] = drafts.map(draft => ({
        ...draft,
        status: 'draft'
      }));
      setDraftPosts(draftPosts);
      if (viewMode === 'drafts') {
        setFilteredPosts(draftPosts);
      }
    } catch (error) {
      console.error('Error fetching drafts:', error);
      toast.error('Failed to load drafts');
    }
  }, [canEdit, user, viewMode]);

  const handleViewModeChange = useCallback(async (mode: ViewMode) => {
    setViewMode(mode);
    setVisibleCount(6);
    
    switch (mode) {
      case 'scheduled':
        await fetchScheduledPosts();
        break;
      case 'drafts':
        await fetchDrafts();
        break;
      case 'published':
        setFilteredPosts(blogPosts);
        break;
    }
  }, [fetchScheduledPosts, fetchDrafts, blogPosts]);

  const handleDeletePost = useCallback(async (postId: string, isScheduled = false, isDraft = false) => {
    let confirmMessage = 'Are you sure you want to delete this post?';
    if (isScheduled) confirmMessage = 'Are you sure you want to delete this scheduled post?';
    if (isDraft) confirmMessage = 'Are you sure you want to delete this draft?';
    
    const confirmed = window.confirm(confirmMessage);
    if (!confirmed) return;

    try {
      await deleteBlogPost(postId);
      
      if (isDraft) {
        setDraftPosts(prev => prev.filter(p => p.id !== postId));
        toast.success('Draft deleted successfully');
      } else if (isScheduled) {
        setScheduledPosts(prev => prev.filter(p => p.id !== postId));
        toast.success('Scheduled post deleted successfully');
      } else {
        setBlogPosts(prev => prev.filter(p => p.id !== postId));
        toast.success('Blog post deleted successfully');
      }
      
      setFilteredPosts(prev => prev.filter(p => p.id !== postId));
    } catch (error) {
      console.error('Error deleting post:', error);
      toast.error('Failed to delete post');
    }
  }, []);

  const handleSearch = useCallback(({ query, sort, startDate, endDate }) => {
    let postsToFilter: BlogPost[] = [];
    
    switch (viewMode) {
      case 'published':
        postsToFilter = blogPosts;
        break;
      case 'scheduled':
        postsToFilter = scheduledPosts;
        break;
      case 'drafts':
        postsToFilter = draftPosts;
        break;
    }

    let posts = [...postsToFilter];

    if (query) {
      posts = posts.filter(
        (post) =>
          post.title?.toLowerCase().includes(query.toLowerCase()) ||
          post.content?.toLowerCase().includes(query.toLowerCase()) ||
          post.authorName?.toLowerCase().includes(query.toLowerCase())
      );
    }

    if (startDate && endDate) {
      posts = posts.filter((post) => {
        const date = new Date(post.createdAt);
        return date >= startDate && date <= endDate;
      });
    }

    if (sort === 'newest') posts.sort((a, b) => b.createdAt - a.createdAt);
    if (sort === 'oldest') posts.sort((a, b) => a.createdAt - b.createdAt);
    if (sort === 'za') posts.sort((a, b) => b.title.localeCompare(a.title));

    setFilteredPosts(posts);
  }, [viewMode, blogPosts, scheduledPosts, draftPosts]);

  // Initial load
  useEffect(() => {
    const initialize = async () => {
      try {
        await fetchPosts();
      } finally {
        setLoading(false);
      }
    };
    initialize();
  }, [fetchPosts]);

  // Check edit permissions
  useEffect(() => {
    const checkEditPermission = async () => {
      if (user) {
        const hasPermission = await canUserEditBlogs();
        setCanEdit(hasPermission);
      } else {
        setCanEdit(false);
      }
    };
    checkEditPermission();
  }, [user]);

  // Update filtered posts when data changes
  useEffect(() => {
    let currentPosts: BlogPost[] = [];
    
    switch (viewMode) {
      case 'published':
        currentPosts = blogPosts;
        break;
      case 'scheduled':
        currentPosts = scheduledPosts;
        break;
      case 'drafts':
        currentPosts = draftPosts;
        break;
    }
    
    setFilteredPosts(currentPosts);
  }, [viewMode, blogPosts, scheduledPosts, draftPosts]);

  const getCurrentPosts = useCallback(() => {
    switch (viewMode) {
      case 'scheduled': return scheduledPosts;
      case 'drafts': return draftPosts;
      default: return blogPosts;
    }
  }, [viewMode, scheduledPosts, draftPosts, blogPosts]);

  return {
    // State
    loading,
    canEdit,
    viewMode,
    filteredPosts,
    visibleCount,
    
    // Actions
    handleViewModeChange,
    handleDeletePost,
    handleSearch,
    setVisibleCount,
    getCurrentPosts,
    
    // Getters
    getViewTitle: () => {
      switch (viewMode) {
        case 'scheduled': return 'Scheduled Posts';
        case 'drafts': return 'Draft Posts';
        default: return 'Blog Posts';
      }
    }
  };
};
