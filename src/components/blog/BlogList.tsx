

import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { deleteBlogPost, updateBlogPost, getBlogPostById, getAllBlogPosts, canUserEditBlogs } from '@/components/blog/blogService';
import { BlogPost } from '@/components/blog/blog';
import { toast } from 'sonner';
import { FileText, Plus, DraftingCompass, Edit, Trash2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useAuth } from '@/hooks/useAuth';
import BlogSearchFilter from '@/components/blog/BlogSearchFilter';
import { motion } from 'framer-motion';

const BlogList: React.FC = () => {
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [canEdit, setCanEdit] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();

  const [filteredPosts, setFilteredPosts] = useState<BlogPost[]>([]);
  const [originalPosts, setOriginalPosts] = useState<BlogPost[]>([]);

  const [visibleCount, setVisibleCount] = useState(1);      //.....number of post to show 


  const handleSearch = ({ query, sort, startDate, endDate }) => {
    let posts = [...originalPosts];

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
    if (sort === 'az') posts.sort((a, b) => a.title.localeCompare(b.title));
    if (sort === 'za') posts.sort((a, b) => b.title.localeCompare(a.title));


    setFilteredPosts(posts);
  };


  useEffect(() => {
    const fetchBlogPosts = async () => {
      try {
        const posts = await getAllBlogPosts();
        const validPosts = posts.filter(post => post.createdAt && !isNaN(post.createdAt));
        setBlogPosts(validPosts);
        setOriginalPosts(validPosts); // set initial copy
        setFilteredPosts(validPosts); // show initially
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
      <div className="container mx-auto px-6 py-10">
        <BlogSearchFilter onSearch={handleSearch} />
        {/* ... render filteredPosts here ... */}
      </div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-[#7E69AB] animate-fade-in">Blog Posts</h1>
        {canEdit && (
          <div className='flex flexrow gap-2'>
            <Link to="/blog/drafts" className="flex items-center gap-2">
              <Button className="flex items-center gap-2 bg-gradient-to-r from-[#9b87f5] to-[#1EAEDB] text-white hover:brightness-110 shadow-lg transition-all animate-scale-in">
                <DraftingCompass size={16} />
                View Drafts
              </Button></Link>
            <Button onClick={() => navigate('/blog/new')} className="flex items-center gap-2 bg-gradient-to-r from-[#9b87f5] to-[#1EAEDB] text-white hover:brightness-110 shadow-lg transition-all animate-scale-in" >
              <Plus size={16} />
              <span>New Post</span>
            </Button>
          </div>
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

          {filteredPosts.slice(0, visibleCount).map((post, idx) => (

            <motion.div
              key={post.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
            >

              <Card
                key={post.id}
                className="hover:shadow-2xl hover:scale-[1.018] transition-all duration-200 bg-gradient-to-br from-[#F1F0FB] via-white to-[#E5DEFF] border-2 border-[#E5DEFF] animate-fade-in"
                style={{ animationDelay: `${idx * 70}ms` }}
              >
                <CardHeader>

                  <CardTitle className="line-clamp-2 text-[#1A1F2C]">
                    <Link to={`/blog/${post.id}`} className="hover:underline story-link">
                      {post.title}
                    </Link>
                  </CardTitle>
                  <CardDescription>
                    <div className="flex items-center gap-2">
                      {post.authorPhotoURL ? (
                        <img
                          src={post.authorPhotoURL}
                          alt={post.authorName}
                          className="w-5 h-5 rounded-full border-2 border-[#9b87f5]"
                        />
                      ) : (
                        <div className="w-5 h-5 rounded-full bg-[#D6BCFA] text-[#7E69AB] flex items-center justify-center text-xs font-bold">
                          {post.authorName?.charAt(0) || '?'}
                        </div>
                      )}
                      <span className="text-[#7E69AB] text-sm">
                        {post.authorName || 'Unknown'}
                      </span>
                    </div>
                  </CardDescription>
                </CardHeader>

                <CardContent>
                  {post.imageUrl && (
                    <div className="mb-3 flex justify-center">
                      <img
                        src={post.imageUrl}
                        alt="Thumbnail"
                        className=" w-[250px] h-[150px] object-cover rounded-lg shadow-md"
                      />
                    </div>
                  )}
                  <div
                    className="prose max-w-none"
                    dangerouslySetInnerHTML={{
                      __html: post.content.substring(0, 100) + '...',
                    }}
                  />
                </CardContent>

                <CardFooter className="flex justify-between items-center">
                  <span className="text-xs text-[#9b87f5]">
                    {post.createdAt
                      ? formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })
                      : 'Unknown date'}
                  </span>

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      asChild
                      className="text-[#1EAEDB] hover:text-[#7E69AB] border-[#D6BCFA] hover:bg-[#F3F0FF]"
                    >
                      <Link to={`/blog/${post.id}`}>Read more</Link>
                    </Button>

                    {canEdit && (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => navigate(`/blog/edit/${post.id}`)}
                          className="text-[#7E69AB] border-[#D6BCFA] hover:bg-[#F3F0FF]"
                        >
                          <Edit size={16} /> 
                          {/* Edit */}
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={async () => {
                            const confirmed = window.confirm("Are you sure you want to delete this post?");
                            if (confirmed) {
                              try {
                                await deleteBlogPost(post.id); // Make sure this function is defined in your blogService
                                setBlogPosts(prev => prev.filter(p => p.id !== post.id));
                                toast.success("Blog post deleted");
                              } catch (err) {
                                toast.error("Failed to delete blog post");
                              }
                            }
                          }}
                        >
                          <Trash2 size={16} />
                          {/* Delete */}
                        </Button>
                      </>
                    )}
                  </div>
                </CardFooter>
              </Card>
            </motion.div>
          ))}

        </div>


      )}
      {visibleCount < filteredPosts.length && (
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
