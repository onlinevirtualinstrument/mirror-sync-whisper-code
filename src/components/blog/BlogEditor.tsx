
import React, { useState, useRef, useEffect } from 'react';
import { Editor } from '@tinymce/tinymce-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { createBlogPost, updateBlogPost, getBlogPostById } from '@/services/blogService';
import { BlogPost } from '@/types/blog';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';

interface BlogEditorProps {
  mode: 'create' | 'edit';
}

const BlogEditor: React.FC<BlogEditorProps> = ({ mode }) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(mode === 'edit');
  const editorRef = useRef<any>(null);
  const navigate = useNavigate();
  const { id } = useParams();

  useEffect(() => {
    if (mode === 'edit' && id) {
      const fetchBlogPost = async () => {
        try {
          const post = await getBlogPostById(id);
          if (post) {
            setTitle(post.title);
            setContent(post.content);
          } else {
            toast.error('Blog post not found');
            navigate('/blog');
          }
        } catch (error) {
          console.error('Error fetching blog post:', error);
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
      if (editorRef.current) {
        const editorContent = editorRef.current.getContent();
        
        if (mode === 'create') {
          const postId = await createBlogPost({
            title,
            content: editorContent,
          });
          toast.success('Blog post created successfully!');
          navigate(`/blog/${postId}`);
        } else if (mode === 'edit' && id) {
          await updateBlogPost(id, {
            title,
            content: editorContent,
          });
          toast.success('Blog post updated successfully!');
          navigate(`/blog/${id}`);
        }
      }
    } catch (error: any) {
      console.error('Error saving blog post:', error);
      toast.error(error.message || 'Failed to save blog post');
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return <div className="container mx-auto px-6 py-10 text-center">Loading...</div>;
  }

  return (
    <div className="container mx-auto px-6 py-10">
      <Card className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label htmlFor="title" className="text-sm font-medium">
              Blog Title
            </label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter blog title"
              required
              className="w-full"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="content" className="text-sm font-medium">
              Content
            </label>
            <Editor
              onInit={(evt, editor) => (editorRef.current = editor)}
              initialValue={content}
              init={{
                height: 500,
                menubar: true,
                plugins: [
                  'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview',
                  'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
                  'insertdatetime', 'media', 'table', 'code', 'help', 'wordcount'
                ],
                toolbar: 'undo redo | blocks | ' +
                  'bold italic forecolor | alignleft aligncenter ' +
                  'alignright alignjustify | bullist numlist outdent indent | ' +
                  'removeformat | help',
                content_style: 'body { font-family:Helvetica,Arial,sans-serif; font-size:14px }'
              }}
            />
          </div>

          <div className="flex justify-end space-x-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/blog')}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving...' : mode === 'create' ? 'Publish Post' : 'Update Post'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default BlogEditor;
