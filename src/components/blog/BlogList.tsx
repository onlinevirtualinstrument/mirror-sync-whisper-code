
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { deleteBlogPost, getAllBlogPosts, getScheduledBlogPosts, canUserEditBlogs, getUserDrafts } from '@/components/blog/blogService';
import { BlogPost, BlogDraft } from '@/components/blog/blog';
import { toast } from 'sonner';
import { FileText, Plus, DraftingCompass, Clock, Edit2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import BlogSearchFilter from '@/components/blog/BlogSearchFilter';
import BlogCard from './components/BlogCard';

type ViewMode = 'published' | 'scheduled' | 'drafts';

const BlogList: React.FC = () => {
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [scheduledPosts, setScheduledPosts] = useState<BlogPost[]>([]);
  const [draftPosts, setDraftPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [canEdit, setCanEdit] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('published');
  const navigate = useNavigate();
  const { user } = useAuth();

  const [filteredPosts, setFilteredPosts] = useState<BlogPost[]>([]);
  const [visibleCount, setVisibleCount] = useState(6);

  const handleSearch = ({ query, sort, startDate, endDate }) => {
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
  };

  const fetchDrafts = async () => {
    if (!canEdit || !user) return;
    
    try {
      const drafts = await getUserDrafts(user.uid);
      // Convert BlogDraft to BlogPost format for consistency
      const draftPosts: BlogPost[] = drafts.map(draft => ({
        ...draft,
        status: 'draft'
      }));
      setDraftPosts(draftPosts);
      console.log('Fetched draft posts:', draftPosts);
    } catch (error) {
      console.error('Error fetching drafts:', error);
      toast.error('Failed to load drafts');
    }
  };

  const fetchScheduledPosts = async () => {
    if (!canEdit) return;
    
    try {
      const scheduled = await getScheduledBlogPosts();
      setScheduledPosts(scheduled);
      console.log('Fetched scheduled posts:', scheduled);
    } catch (error) {
      console.error('Error fetching scheduled posts:', error);
      toast.error('Failed to load scheduled posts');
    }
  };

  const handleViewModeChange = async (mode: ViewMode) => {
    setViewMode(mode);
    setVisibleCount(6);
    
    if (mode === 'scheduled') {
      await fetchScheduledPosts();
    } else if (mode === 'drafts') {
      await fetchDrafts();
    }
  };

  const handleDeletePost = async (postId: string, isScheduled: boolean = false, isDraft: boolean = false) => {
    let confirmMessage = 'Are you sure you want to delete this post?';
    if (isScheduled) confirmMessage = 'Are you sure you want to delete this scheduled post?';
    if (isDraft) confirmMessage = 'Are you sure you want to delete this draft?';
    
    const confirmed = window.confirm(confirmMessage);
    if (!confirmed) return;

    try {
      await deleteBlogPost(postId);
      
      if (isDraft) {
        setDraftPosts(prev => prev.filter(p => p.id !== postId));
        setFilteredPosts(prev => prev.filter(p => p.id !== postId));
        toast.success('Draft deleted successfully');
      } else if (isScheduled) {
        setScheduledPosts(prev => prev.filter(p => p.id !== postId));
        setFilteredPosts(prev => prev.filter(p => p.id !== postId));
        toast.success('Scheduled post deleted successfully');
      } else {
        setBlogPosts(prev => prev.filter(p => p.id !== postId));
        setFilteredPosts(prev => prev.filter(p => p.id !== postId));
        toast.success('Blog post deleted successfully');
      }
    } catch (error) {
      console.error('Error deleting post:', error);
      toast.error('Failed to delete post');
    }
  };

  useEffect(() => {
    const fetchBlogPosts = async () => {
      try {
        const posts = await getAllBlogPosts();
        setBlogPosts(posts);
        setFilteredPosts(posts);
      } catch (error) {
        console.error('Error fetching blog posts:', error);
        toast.error('Failed to load blog posts');
      } finally {
        setLoading(false);
      }
    };

    fetchBlogPosts();
  }, []);

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

  // Update filtered posts when switching between views
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

  if (loading) {
    return <div className="container mx-auto px-6 py-10 text-center animate-pulse">Loading blog posts...</div>;
  }

  const getViewTitle = () => {
    switch (viewMode) {
      case 'scheduled': return 'Scheduled Posts';
      case 'drafts': return 'Draft Posts';
      default: return 'Blog Posts';
    }
  };

  const getCurrentPosts = () => {
    switch (viewMode) {
      case 'scheduled': return scheduledPosts;
      case 'drafts': return draftPosts;
      default: return blogPosts;
    }
  };

  const displayPosts = filteredPosts.length > 0 ? filteredPosts : getCurrentPosts();

  return (
    <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-10">
      <div className="mb-6 sm:mb-8">
        <BlogSearchFilter onSearch={handleSearch} />
      </div>
      
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-[#7E69AB] animate-fade-in">
          {getViewTitle()}
        </h1>
        {canEdit && (
          <div className='flex flex-wrap gap-2'>
            <Button 
              onClick={() => handleViewModeChange('drafts')}
              className={`flex items-center gap-2 ${viewMode === 'drafts' ? 'bg-gradient-to-r from-yellow-600 to-orange-600' : 'bg-gradient-to-r from-yellow-500 to-orange-500'} text-white hover:brightness-110 shadow-lg transition-all animate-scale-in text-sm`}
            >
              <Edit2 size={16} />
              <span className="hidden sm:inline">Drafts</span>
              <span className="sm:hidden">Drafts</span>
            </Button>
            <Button 
              onClick={() => handleViewModeChange('scheduled')}
              className={`flex items-center gap-2 ${viewMode === 'scheduled' ? 'bg-gradient-to-r from-orange-600 to-red-600' : 'bg-gradient-to-r from-orange-500 to-red-500'} text-white hover:brightness-110 shadow-lg transition-all animate-scale-in text-sm`}
            >
              <Clock size={16} />
              <span className="hidden sm:inline">Scheduled</span>
              <span className="sm:hidden">Scheduled</span>
            </Button>
            <Button 
              onClick={() => handleViewModeChange('published')}
              className={`flex items-center gap-2 ${viewMode === 'published' ? 'bg-gradient-to-r from-blue-600 to-purple-600' : 'bg-gradient-to-r from-blue-500 to-purple-500'} text-white hover:brightness-110 shadow-lg transition-all animate-scale-in text-sm`}
            >
              <FileText size={16} />
              <span className="hidden sm:inline">Published</span>
              <span className="sm:hidden">Published</span>
            </Button>
            <Button onClick={() => navigate('/blog/new')} className="flex items-center gap-2 bg-gradient-to-r from-[#9b87f5] to-[#1EAEDB] text-white hover:brightness-110 shadow-lg transition-all animate-scale-in text-sm" >
              <Plus size={16} />
              <span className="hidden sm:inline">New Post</span>
              <span className="sm:hidden">New</span>
            </Button>
          </div>
        )}
      </div>

      {displayPosts.length === 0 ? (
        <div className="text-center py-12 animate-fade-in bg-[#F1F0FB] rounded-lg border border-[#E5DEFF] shadow-inner">
          <FileText className="mx-auto h-12 w-12 text-[#D6BCFA] mb-4 animate-bounce" />
          <h3 className="text-xl font-medium text-[#7E69AB] mb-2">
            {viewMode === 'scheduled' ? 'No scheduled posts' : 
             viewMode === 'drafts' ? 'No draft posts' : 'No blog posts yet'}
          </h3>
          <p className="text-gray-500">
            {viewMode === 'scheduled' 
              ? "You don't have any posts scheduled for publication yet."
              : viewMode === 'drafts'
                ? "You don't have any draft posts yet."
                : canEdit
                  ? "Get started by creating your first blog post."
                  : "Check back later for new blog posts."
            }
          </p>
          {canEdit && viewMode === 'published' && (
            <Button
              onClick={() => navigate('/blog/new')}
              variant="outline"
              className="mt-4 border-[#9b87f5] text-[#9b87f5] animate-fade-in"
            >
              Create your first post
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {displayPosts.slice(0, visibleCount).map((post, idx) => (
            <BlogCard
              key={post.id}
              post={post}
              index={idx}
              canEdit={canEdit}
              showScheduled={viewMode === 'scheduled'}
              onDelete={(postId, isScheduled) => handleDeletePost(postId, isScheduled, viewMode === 'drafts')}
            />
          ))}
        </div>
      )}

      {visibleCount < displayPosts.length && (
        <div className="flex justify-center mt-6">
          <Button
            onClick={() => setVisibleCount(prev => prev + 3)}
            className="bg-gradient-to-r from-purple-500 to-blue-500 text-white hover:brightness-110 shadow-md"
          >
            Load More Posts
          </Button>
        </div>
      )}
    </div>
  );
};

export default BlogList;
