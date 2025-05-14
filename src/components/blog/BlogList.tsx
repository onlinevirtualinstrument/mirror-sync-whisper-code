import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { getAllBlogPosts, canUserEditBlogs } from '@/services/blogService';
import { BlogPost } from '@/types/blog';
import { toast } from 'sonner';
import { FileText, Plus } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useAuth } from '@/hooks/useAuth';

const BlogList: React.FC = () => {
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [canEdit, setCanEdit] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    const fetchBlogPosts = async () => {
      try {
        const posts = await getAllBlogPosts();
        setBlogPosts(posts);
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

  if (loading) {
    return <div className="container mx-auto px-6 py-10 text-center animate-pulse">Loading blog posts...</div>;
  }

  return (
    <div className="container mx-auto px-6 py-10">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-[#7E69AB] animate-fade-in">Blog Posts</h1>
        {canEdit && (
          <Button onClick={() => navigate('/blog/new')} className="flex items-center gap-2 bg-gradient-to-r from-[#9b87f5] to-[#1EAEDB] text-white hover:brightness-110 shadow-lg transition-all animate-scale-in" >
            <Plus size={16} />
            <span>New Post</span>
          </Button>
        )}
      </div>
      {blogPosts.length === 0 ? (
        <div className="text-center py-12 animate-fade-in bg-[#F1F0FB] rounded-lg border border-[#E5DEFF] shadow-inner">
          <FileText className="mx-auto h-12 w-12 text-[#D6BCFA] mb-4 animate-bounce" />
          <h3 className="text-xl font-medium text-[#7E69AB] mb-2">No blog posts yet</h3>
          <p className="text-gray-500">{
            canEdit
            ? "Get started by creating your first blog post."
            : "Check back later for new blog posts."}
          </p>
          {canEdit && (
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {blogPosts.map((post, idx) => (
            <Card key={post.id} className="hover:shadow-2xl hover:scale-[1.018] transition-all duration-200 bg-gradient-to-br from-[#F1F0FB] via-white to-[#E5DEFF] border-2 border-[#E5DEFF] animate-fade-in" style={{ animationDelay: `${idx * 70}ms` }}>
              <CardHeader>
                <CardTitle className="line-clamp-2 text-[#1A1F2C]">
                  <Link to={`/blog/${post.id}`} className="hover:underline story-link">{post.title}</Link>
                </CardTitle>
                <CardDescription>
                  <div className="flex items-center gap-2">
                    {post.authorPhotoURL ? (
                      <img src={post.authorPhotoURL} alt={post.authorName} className="w-5 h-5 rounded-full border-2 border-[#9b87f5]" />
                    ) : (
                      <div className="w-5 h-5 rounded-full bg-[#D6BCFA] text-[#7E69AB] flex items-center justify-center text-xs font-bold">{post.authorName.charAt(0)}</div>
                    )}
                    <span className="text-[#7E69AB] text-sm">{post.authorName}</span>
                  </div>
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="line-clamp-3 text-sm text-[#221F26]">{post.content.replace(/<[^>]+>/g, ' ').substring(0, 150) + "..."}</div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <span className="text-xs text-[#9b87f5]">{formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}</span>
                <Button variant="ghost" size="sm" asChild className="text-[#1EAEDB] hover:text-[#7E69AB]">
                  <Link to={`/blog/${post.id}`}>Read more</Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default BlogList;
