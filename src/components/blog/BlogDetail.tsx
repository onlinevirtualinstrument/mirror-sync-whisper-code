


import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { getBlogPostById, deleteBlogPost, getUserRole } from '@/components/blog/blogService';
import { BlogPost, UserRole } from '@/components/blog/blog';
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
        if (post && post.title) {
          setBlogPost(post);
        } else {
          toast.error('Blog post not found');
          navigate('/blog');
        }

        if (user) {
          const role = await getUserRole(user.uid);
          setUserRole(role);
        }
      } catch (error) {
        console.error('Error fetching blog post:', error);
        toast.error('Failed to load blog post');
        navigate('/blog');
      } finally {
        setLoading(false);
      }
    };

    fetchBlogPost();
  }, [id, user, navigate]);

  const handleDelete = async () => {
    if (!id || !window.confirm('Are you sure you want to delete this blog post?')) return;

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
    if (userRole.role === 'super_admin') return true;
    if (userRole.role === 'admin') return blogPost.authorId === user.uid;
    return false;
  };

  if (loading) {
    return <div className="container mx-auto px-6 py-10 text-center animate-pulse">Loading blog post...</div>;
  }

  if (!blogPost) {
    return (
      <div className="container mx-auto px-6 py-10 text-center animate-fade-in">
        <h2 className="text-2xl font-bold mb-4 text-[#7E69AB]">Blog post not found</h2>
        <Button asChild className="bg-gradient-to-r from-[#9b87f5] to-[#1EAEDB] text-white animate-scale-in">
          <Link to="/blog">Back to Blog</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-6 py-10 animate-fade-in">
      <Button variant="ghost" asChild className="mb-6 text-[#7E69AB]">
        <Link to="/blog" className="flex items-center gap-2">
          <ArrowLeft size={16} />
          <span>Back to all posts</span>
        </Link>
      </Button>

      <Card className="overflow-hidden border-2 border-[#E5DEFF] bg-gradient-to-br from-[#F1F0FB] to-[#FFFFFF]">
        <div className="p-6">
          <div className="flex justify-between items-start">
            <h1 className="text-3xl font-bold text-[#221F26] drop-shadow">{blogPost.title}</h1>
            {canEditPost() && (
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => navigate(`/blog/edit/${blogPost.id}`)} className="border-[#9b87f5] text-[#9b87f5] animate-scale-in">
                  <Edit className="mr-2 h-4 w-4" />Edit
                </Button>
                <Button variant="destructive" size="sm" onClick={handleDelete} className="animate-scale-in">
                  <Trash className="mr-2 h-4 w-4" />Delete
                </Button>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 mt-4 text-sm text-[#7E69AB]">
            {blogPost.authorPhotoURL ? (
              <img src={blogPost.authorPhotoURL} alt={blogPost.authorName} className="w-6 h-6 rounded-full border-2 border-[#9b87f5]" />
            ) : (
              <div className="w-6 h-6 rounded-full bg-[#D6BCFA] flex items-center justify-center text-xs text-[#7E69AB] font-bold">
                {blogPost.authorName?.charAt(0) || 'U'}
              </div>
            )}
            <span>{blogPost.authorName}</span>
            <span>•</span>
            <span>{blogPost.createdAt ? format(new Date(blogPost.createdAt), 'MMMM d, yyyy') : 'Unknown date'}</span>
            {blogPost.updatedAt && (
              <>
                <span>•</span>
                <span>Updated {format(new Date(blogPost.updatedAt), 'MMMM d, yyyy')}</span>
              </>
            )}
          </div>

{blogPost.imageUrl && (
  <div className="my-6 flex justify-center">
    <img
      src={blogPost.imageUrl}
      alt="Blog visual"
      className="w-[300px] h-[200px] object-cover rounded-lg shadow"
    />
  </div>
)}


          <Separator className="my-6" />

          <div
            className="prose dark:prose-invert max-w-none animate-fade-in"
            dangerouslySetInnerHTML={{ __html: blogPost.content || '<p>No content available.</p>' }}
          />
        </div>
      </Card>
    </div>
  );
};

export default BlogDetail;
