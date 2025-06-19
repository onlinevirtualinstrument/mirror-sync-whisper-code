
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { FileText, Plus, Edit2, Clock } from 'lucide-react';
import BlogSearchFilter from '@/components/blog/BlogSearchFilter';
import BlogCard from './components/BlogCard';
import { useBlogList } from './hooks/useBlogList';

const BlogList: React.FC = () => {
  const navigate = useNavigate();
  const {
    loading,
    canEdit,
    viewMode,
    filteredPosts,
    visibleCount,
    handleViewModeChange,
    handleDeletePost,
    handleSearch,
    setVisibleCount,
    getCurrentPosts,
    getViewTitle
  } = useBlogList();

  if (loading) {
    return <div className="container mx-auto px-6 py-10 text-center animate-pulse">Loading blog posts...</div>;
  }

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
