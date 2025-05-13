
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { getBlogPostById, deleteBlogPost, getUserRole } from '@/services/blogService';
import { BlogPost, UserRole } from '@/types/blog';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { Edit, Trash, ArrowLeft } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

const BlogDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [blogPost, setBlogPost] = useState<BlogPost | null>(null);
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    const fetchBlogPost = async () => {
      if (!id) return;
      
      try {
        const post = await getBlogPostById(id);
        setBlogPost(post);
        
        if (user) {
          const role = await getUserRole(user.uid);
          setUserRole(role);
        }
      } catch (error) {
        console.error('Error fetching blog post:', error);
        toast.error('Failed to load blog post');
      } finally {
        setLoading(false);
      }
    };

    fetchBlogPost();
  }, [id, user]);

  const handleDelete = async () => {
    if (!id || !window.confirm('Are you sure you want to delete this blog post?')) {
      return;
    }

    try {
      await deleteBlogPost(id);
      toast.success('Blog post deleted successfully');
      navigate('/blog');
    } catch (error: any) {
      console.error('Error deleting blog post:', error);
      toast.error(error.message || 'Failed to delete blog post');
    }
  };

  const canEditPost = () => {
    if (!blogPost || !userRole || !user) return false;
    
    // Super admin can edit any post
    if (userRole.role === 'super_admin') return true;
    
    // Admin can only edit their own posts
    if (userRole.role === 'admin') {
      return blogPost.authorId === user.uid;
    }
    
    return false;
  };

  if (loading) {
    return <div className="container mx-auto px-6 py-10 text-center">Loading blog post...</div>;
  }

  if (!blogPost) {
    return (
      <div className="container mx-auto px-6 py-10 text-center">
        <h2 className="text-2xl font-bold mb-4">Blog post not found</h2>
        <Button asChild>
          <Link to="/blog">Back to Blog</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-6 py-10">
      <Button variant="ghost" asChild className="mb-6">
        <Link to="/blog" className="flex items-center gap-2">
          <ArrowLeft size={16} />
          <span>Back to all posts</span>
        </Link>
      </Button>

      <Card className="overflow-hidden">
        <div className="p-6">
          <div className="flex justify-between items-start">
            <h1 className="text-3xl font-bold">{blogPost.title}</h1>
            
            {canEditPost() && (
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => navigate(`/blog/edit/${blogPost.id}`)}
                >
                  <Edit className="mr-2 h-4 w-4" />
                  Edit
                </Button>
                <Button 
                  variant="destructive" 
                  size="sm" 
                  onClick={handleDelete}
                >
                  <Trash className="mr-2 h-4 w-4" />
                  Delete
                </Button>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 mt-4 text-sm text-gray-500">
            {blogPost.authorPhotoURL ? (
              <img
                src={blogPost.authorPhotoURL}
                alt={blogPost.authorName}
                className="w-6 h-6 rounded-full"
              />
            ) : (
              <div className="w-6 h-6 rounded-full bg-gray-300 flex items-center justify-center text-xs text-gray-700">
                {blogPost.authorName.charAt(0)}
              </div>
            )}
            <span>{blogPost.authorName}</span>
            <span>•</span>
            <span>{format(new Date(blogPost.createdAt), 'MMMM d, yyyy')}</span>
            {blogPost.updatedAt && (
              <>
                <span>•</span>
                <span>Updated {format(new Date(blogPost.updatedAt), 'MMMM d, yyyy')}</span>
              </>
            )}
          </div>

          <Separator className="my-6" />

          <div 
            className="prose dark:prose-invert max-w-none" 
            dangerouslySetInnerHTML={{ __html: blogPost.content }} 
          />
        </div>
      </Card>
    </div>
  );
};

export default BlogDetail;
