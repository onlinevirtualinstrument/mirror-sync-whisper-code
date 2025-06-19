
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { deleteBlogPost, getAllBlogPosts, getScheduledBlogPosts, canUserEditBlogs } from '@/components/blog/blogService';
import { BlogPost } from '@/components/blog/blog';
import { toast } from 'sonner';
import { FileText, Plus, DraftingCompass, Clock } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import BlogSearchFilter from '@/components/blog/BlogSearchFilter';
import BlogCard from './components/BlogCard';

const BlogList: React.FC = () => {
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [scheduledPosts, setScheduledPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [canEdit, setCanEdit] = useState(false);
  const [showScheduled, setShowScheduled] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();

  const [filteredPosts, setFilteredPosts] = useState<BlogPost[]>([]);
  const [originalPosts, setOriginalPosts] = useState<BlogPost[]>([]);
  const [visibleCount, setVisibleCount] = useState(6);

  const handleSearch = ({ query, sort, startDate, endDate }) => {
    const postsToFilter = showScheduled ? scheduledPosts : originalPosts;
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

  const handleViewScheduled = async () => {
    if (!showScheduled) {
      await fetchScheduledPosts();
    }
    setShowScheduled(prev => {
      const newState = !prev;
      console.log('Switching to scheduled view:', newState);
      setVisibleCount(6);
      return newState;
    });
  };

  const handleDeletePost = async (postId: string, isScheduled: boolean = false) => {
    const confirmed = window.confirm(`Are you sure you want to delete this ${isScheduled ? 'scheduled ' : ''}post?`);
    if (!confirmed) return;

    try {
      await deleteBlogPost(postId);
      
      if (isScheduled) {
        setScheduledPosts(prev => prev.filter(p => p.id !== postId));
        setFilteredPosts(prev => prev.filter(p => p.id !== postId));
      } else {
        setBlogPosts(prev => prev.filter(p => p.id !== postId));
        setOriginalPosts(prev => prev.filter(p => p.id !== postId));
        setFilteredPosts(prev => prev.filter(p => p.id !== postId));
      }
      
      toast.success(`${isScheduled ? 'Scheduled ' : ''}Blog post deleted successfully`);
    } catch (error) {
      console.error('Error deleting post:', error);
      toast.error(`Failed to delete ${isScheduled ? 'scheduled ' : ''}blog post`);
    }
  };

  useEffect(() => {
    const fetchBlogPosts = async () => {
      try {
        const posts = await getAllBlogPosts();
        // Filter out scheduled posts from main blog list - they should only appear in scheduled view for admins
        const publishedPosts = posts.filter(post => 
          post.status === 'published' || post.status === undefined
        );
        setBlogPosts(publishedPosts);
        setOriginalPosts(publishedPosts);
        setFilteredPosts(publishedPosts);
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
    console.log('Updating filtered posts, showScheduled:', showScheduled);
    if (showScheduled) {
      console.log('Setting filtered posts to scheduled posts:', scheduledPosts);
      setFilteredPosts(scheduledPosts);
    } else {
      console.log('Setting filtered posts to original posts:', originalPosts);
      setFilteredPosts(originalPosts);
    }
  }, [showScheduled, scheduledPosts, originalPosts]);

  if (loading) {
    return <div className="container mx-auto px-6 py-10 text-center animate-pulse">Loading blog posts...</div>;
  }

  const currentPosts = showScheduled ? scheduledPosts : blogPosts;
  const displayPosts = filteredPosts.length > 0 ? filteredPosts : currentPosts;

  console.log('Render state:', { showScheduled, currentPosts: currentPosts.length, displayPosts: displayPosts.length });

  return (
    <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-10">
      <div className="mb-6 sm:mb-8">
        <BlogSearchFilter onSearch={handleSearch} />
      </div>
      
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-[#7E69AB] animate-fade-in">
          {showScheduled ? 'Scheduled Posts' : 'Blog Posts'}
        </h1>
        {canEdit && (
          <div className='flex flex-wrap gap-2'>
            <Link to="/blog/drafts" className="flex items-center gap-2">
              <Button className="flex items-center gap-2 bg-gradient-to-r from-[#9b87f5] to-[#1EAEDB] text-white hover:brightness-110 shadow-lg transition-all animate-scale-in text-sm">
                <DraftingCompass size={16} />
                <span className="hidden sm:inline">View Drafts</span>
                <span className="sm:hidden">Drafts</span>
              </Button>
            </Link>
            <Button 
              onClick={handleViewScheduled}
              className={`flex items-center gap-2 ${showScheduled ? 'bg-gradient-to-r from-orange-600 to-red-600' : 'bg-gradient-to-r from-orange-500 to-red-500'} text-white hover:brightness-110 shadow-lg transition-all animate-scale-in text-sm`}
            >
              <Clock size={16} />
              <span className="hidden sm:inline">{showScheduled ? 'View Published' : 'View Scheduled'}</span>
              <span className="sm:hidden">{showScheduled ? 'Published' : 'Scheduled'}</span>
            </Button>
            {/* {!showScheduled && ( */}
              <Button onClick={() => navigate('/blog/new')} className="flex items-center gap-2 bg-gradient-to-r from-[#9b87f5] to-[#1EAEDB] text-white hover:brightness-110 shadow-lg transition-all animate-scale-in text-sm" >
                <Plus size={16} />
                <span className="hidden sm:inline">New Post</span>
                <span className="sm:hidden">New</span>
              </Button>
            {/* )} */}
          </div>
        )}
      </div>

      {displayPosts.length === 0 ? (
        <div className="text-center py-12 animate-fade-in bg-[#F1F0FB] rounded-lg border border-[#E5DEFF] shadow-inner">
          <FileText className="mx-auto h-12 w-12 text-[#D6BCFA] mb-4 animate-bounce" />
          <h3 className="text-xl font-medium text-[#7E69AB] mb-2">
            {showScheduled ? 'No scheduled posts' : 'No blog posts yet'}
          </h3>
          <p className="text-gray-500">
            {showScheduled 
              ? "You don't have any posts scheduled for publication yet."
              : canEdit
                ? "Get started by creating your first blog post."
                : "Check back later for new blog posts."
            }
          </p>
          {canEdit && !showScheduled && (
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
              showScheduled={showScheduled}
              onDelete={handleDeletePost}
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