
import React, { useState, useRef, useEffect } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { createBlogPost, updateBlogPost, getBlogPostById } from '@/components/blog/blogService';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { auth } from '@/utils/auth/firebase';

const BlogEditor: React.FC<{ mode: 'create' | 'edit' }> = ({ mode }) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [imageUrlError, setImageUrlError] = useState('');
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(mode === 'edit');
  const navigate = useNavigate();
  const { id } = useParams();

  // Quill editor modules and formats
  const modules = {
    toolbar: [
      [{ 'header': [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike', 'blockquote'],
      [{'list': 'ordered'}, {'list': 'bullet'}, {'indent': '-1'}, {'indent': '+1'}],
      ['link', 'image'],
      ['clean']
    ],
  };
  
  const formats = [
    'header',
    'bold', 'italic', 'underline', 'strike', 'blockquote',
    'list', 'bullet', 'indent',
    'link', 'image'
  ];

  useEffect(() => {
    if (mode === 'edit' && id) {
      const fetchBlogPost = async () => {
        try {
          const post = await getBlogPostById(id);
          if (post) {
            setTitle(post.title);
            setContent(post.content);
            setImageUrl(post.imageUrl || '');
          } else {
            toast.error('Blog post not found');
            navigate('/blog');
          }
        } catch {
          toast.error('Failed to load blog post');
        } finally {
          setInitialLoading(false);
        }
      };
      fetchBlogPost();
    }
  }, [id, mode, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = auth.currentUser;

      if (!user) {
        toast.error('You must be logged in to create a post');
        setLoading(false);
        return;
      }

      const postData = {
        title,
        content,
        imageUrl,
        authorId: user.uid,
        authorName: user.displayName || 'Anonymous',
        authorPhotoURL: user.photoURL || '',
        createdAt: Date.now(),
      };

      if (mode === 'create') {
        const postId = await createBlogPost(postData);
        toast.success('Blog post created');
        navigate(`/blog/${postId}`);
      } else if (mode === 'edit' && id) {
        await updateBlogPost(id, postData);
        toast.success('Blog post updated');
        navigate(`/blog/${id}`);
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to save blog');
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) return <p className="text-center py-20 animate-pulse">Loading blog editor...</p>;

  return (
    <div className="container mx-auto px-6 py-10">
      <Card className="allow-copy p-6 bg-gradient-to-r from-[#F1F0FB] to-[#D6BCFA] border-2 border-[#E5DEFF] shadow-lg animate-fade-in">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label htmlFor="title" className="text-sm font-medium text-[#7E69AB]">
              Blog Title
            </label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter blog title"
              required
              className="w-full border-[#9b87f5] bg-white"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="content" className="text-sm font-medium text-[#7E69AB]">
              Blog Content
            </label>

            <div className="mb-6"> {/* Add spacing below editor */}
              <ReactQuill
                theme="snow"
                value={content}
                onChange={setContent}
                modules={modules}
                formats={formats}
                className="custom-editor"
              />
              <style>
                {`
                  .custom-editor {
                    height: 300px;
                    background-color: white;
                    border-radius: 0.5rem;
                    overflow: hidden;
                  }
                  .custom-editor .ql-toolbar {
                    background-color: white;
                    border-top-left-radius: 0.5rem;
                    border-top-right-radius: 0.5rem;
                    border: 1px solid #9b87f5;
                  }
                  .custom-editor .ql-container {
                    height: calc(300px - 42px);
                    background-color: white;
                    border: 1px solid #9b87f5;
                    border-top: none;
                    border-bottom-left-radius: 0.5rem;
                    border-bottom-right-radius: 0.5rem;
                    font-family: inherit;
                  }
                `}
              </style>
            </div>
          </div>
             
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label htmlFor="imageUrl" className="text-sm font-medium text-[#7E69AB]">
                Optional Blog Image URL
              </label>
              {imageUrl && (
                <span className="text-sm font-medium text-[#7E69AB]">
                  Image Preview
                </span>
              )}
            </div>

            <div className="flex space-x-4 items-start">
              <Input
                type="url"
                id="imageUrl"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://example.com/image.jpg"
                className="bg-white border-[#9b87f5] flex-1"
              />
              {imageUrl && (
                <img
                  src={imageUrl}
                  alt="Preview"
                  className="w-32 h-20 object-cover rounded border shadow hover:scale-105 transition-transform"
                />
              )}
            </div>
          </div>

          <div className="flex justify-end space-x-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => navigate('/blog')} 
              disabled={loading}
              className="border-[#9b87f5] text-[#7E69AB] hover:bg-[#E5DEFF] animate-fade-in"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={loading}
              className="bg-gradient-to-r from-[#9b87f5] to-[#1EAEDB] text-white font-bold animate-scale-in hover:shadow-md transition-all"
            >
              {loading ? 'Saving...' : mode === 'create' ? 'Publish Post' : 'Update Post'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default BlogEditor;