
import React, { useState, useRef, useEffect } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogFooter, DialogTitle } from '@/components/ui/dialog';
import { createBlogPost, updateBlogPost, getBlogPostById, saveDraftToFirestore, getDraftById, deleteDraftById, getUserDrafts } from '@/components/blog/blogService';
import { useNavigate, useParams, Link, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import { auth } from '@/utils/auth/firebase';
import { Save, ArrowLeft, DraftingCompass, Calendar } from 'lucide-react';

const BlogEditor: React.FC<{ mode: 'create' | 'edit' }> = ({ mode }) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(mode === 'edit');
  const [autoSaveTimer, setAutoSaveTimer] = useState<NodeJS.Timeout | null>(null);
  const [isDraftMode, setIsDraftMode] = useState(false);
  const [scheduleDialogOpen, setScheduleDialogOpen] = useState(false);
  const [scheduledDate, setScheduledDate] = useState('');
  const [scheduledTime, setScheduledTime] = useState('');
  const navigate = useNavigate();
  const { id } = useParams();
  const [searchParams] = useSearchParams();

  const modules = {
    toolbar: [
      [{ 'header': [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike', 'blockquote'],
      [{ 'list': 'ordered' }, { 'list': 'bullet' }, { 'indent': '-1' }, { 'indent': '+1' }],
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
    const isDraft = searchParams.get('isDraft') === 'true';
    setIsDraftMode(isDraft);

    if (mode === 'edit' && id) {
      const fetchData = async () => {
        try {
          let postData = null;
          
          if (isDraft) {
            // Load from drafts
            postData = await getDraftById(id);
          } else {
            // Load from published posts
            postData = await getBlogPostById(id);
          }

          if (postData) {
            setTitle(postData.title || '');
            setContent(postData.content || '');
            setImageUrl(postData.imageUrl || '');
          } else {
            toast.error(isDraft ? 'Draft not found' : 'Blog post not found');
            navigate('/blog');
          }
        } catch (error) {
          console.error('Error loading data:', error);
          toast.error('Failed to load content');
        } finally {
          setInitialLoading(false);
        }
      };
      fetchData();
    }
  }, [id, mode, navigate, searchParams]);

  // Auto-save draft functionality
  useEffect(() => {
    if (autoSaveTimer) {
      clearTimeout(autoSaveTimer);
    }

    const timer = setTimeout(() => {
      if (title || content) {
        saveDraft();
      }
    }, 3000); // Auto-save after 3 seconds of inactivity

    setAutoSaveTimer(timer);

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [title, content, imageUrl]);

  const saveDraft = async () => {
    const user = auth.currentUser;
    if (!user) return;

    const draftId = id || `draft-${user.uid}-${Date.now()}`;
    const draft = {
      id: draftId,
      title,
      content,
      imageUrl,
      authorId: user.uid,
      authorName: user.displayName || 'Anonymous',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      status: 'draft',
    };

    try {
      await saveDraftToFirestore(draftId, draft);
    } catch (err) {
      console.error('Error saving draft:', err);
    }
  };

  const handleSaveDraft = async () => {
    await saveDraft();
    toast.success('Draft saved successfully');
  };

  const handleScheduleSubmit = async () => {
    if (!scheduledDate || !scheduledTime) {
      toast.error('Please select both date and time');
      return;
    }

    const scheduledDateTime = new Date(`${scheduledDate}T${scheduledTime}`);
    if (scheduledDateTime <= new Date()) {
      toast.error('Scheduled time must be in the future');
      return;
    }

    setLoading(true);
    try {
      const user = auth.currentUser;

      if (!user) {
        toast.error('You must be logged in to schedule a post');
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
        scheduledFor: scheduledDateTime.getTime(),
        status: 'scheduled'
      };

      // Save as scheduled post
      const postId = await createBlogPost(postData);

      // If this was a draft being scheduled, delete the draft
      if (isDraftMode && id) {
        try {
          await deleteDraftById(id);
          toast.success('Blog scheduled and removed from drafts');
        } catch (error) {
          console.error('Error deleting draft after scheduling:', error);
          toast.success('Blog scheduled successfully');
        }
      } else {
        toast.success('Blog scheduled successfully');
      }

      navigate('/blog');
    } catch (error: any) {
      toast.error(error.message || 'Failed to schedule blog');
    } finally {
      setLoading(false);
      setScheduleDialogOpen(false);
    }
  };

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

      if (mode === 'create' || isDraftMode) {
        // Creating new post or publishing a draft
        const postId = await createBlogPost(postData);

        // If this was a draft being published, delete the draft
        if (isDraftMode && id) {
          try {
            await deleteDraftById(id);
            toast.success('Draft published and removed from drafts');
          } catch (error) {
            console.error('Error deleting draft after publishing:', error);
            toast.success('Blog post published');
          }
        } else {
          // Remove from localStorage drafts if exists
          const existingDrafts = JSON.parse(localStorage.getItem('blog-drafts') || '[]');
          const updatedDrafts = existingDrafts.filter((d: any) =>
            !(d.title === title && d.authorId === user.uid)
          );
          localStorage.setItem('blog-drafts', JSON.stringify(updatedDrafts));
          toast.success('Blog post created');
        }

        navigate(`/blog/${postId}`);
      } else if (mode === 'edit' && id) {
        // Updating existing published post
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
      <div className="mb-4 flex justify-between">
        <Button variant="ghost" asChild className="mb-6 text-[#7E69AB]">
          <Link to="/blog" className="flex items-center gap-2">
            <ArrowLeft size={16} />
            <span>Back to all posts</span>
          </Link>
        </Button>
        <Link to="/blog/drafts" className="flex items-center gap-2">
          <Button className="flex items-center gap-2 bg-gradient-to-r from-[#9b87f5] to-[#1EAEDB] text-white hover:brightness-110 shadow-lg transition-all animate-scale-in">
            <DraftingCompass size={16} />
            View Drafts
          </Button>
        </Link>
      </div>
      
      <Card className="allow-copy p-6 bg-gradient-to-r from-[#F1F0FB] to-[#D6BCFA] border-2 border-[#E5DEFF] shadow-lg animate-fade-in">
        <form onSubmit={handleSubmit} className="space-y-6">
          {isDraftMode && (
            <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mb-4">
              <strong>Editing Draft:</strong> This post will be published when you click "Publish Post" and removed from your drafts.
            </div>
          )}

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

            <div className="mb-6">
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

          <div className="flex justify-between items-center">
            <div className="flex space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={handleSaveDraft}
                className="border-[#9b87f5] text-[#7E69AB] hover:bg-[#E5DEFF]"
              >
                <Save className="h-4 w-4 mr-2" />
                Save Draft
              </Button>

              <Button
                type="button"
                variant="outline"
                onClick={() => setScheduleDialogOpen(true)}
                className="border-[#9b87f5] text-[#7E69AB] hover:bg-[#E5DEFF]"
              >
                <Calendar className="h-4 w-4 mr-2" />
                Schedule
              </Button>
            </div>

            <div className="flex space-x-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/blog')}
                disabled={loading}
                className="border-[#9b87f5] text-[#7E69AB] hover:bg-[#E5DEFF]"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="bg-gradient-to-r from-[#9b87f5] to-[#1EAEDB] text-white font-bold hover:shadow-md transition-all"
              >
                {loading ? 'Saving...' : (mode === 'create' || isDraftMode) ? 'Publish Post' : 'Update Post'}
              </Button>
            </div>
          </div>
        </form>
      </Card>

      {/* Schedule Dialog */}
      <Dialog open={scheduleDialogOpen} onOpenChange={setScheduleDialogOpen}>
        <DialogContent className="sm:max-w-md animate-fade-in">
          <DialogHeader>
            <DialogTitle>Schedule Blog Post</DialogTitle>
            <DialogDescription>
              Choose when you want this blog post to be published.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label htmlFor="schedule-date" className="text-sm font-medium">
                Publication Date
              </label>
              <Input
                id="schedule-date"
                type="date"
                value={scheduledDate}
                onChange={(e) => setScheduledDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                className="w-full"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="schedule-time" className="text-sm font-medium">
                Publication Time
              </label>
              <Input
                id="schedule-time"
                type="time"
                value={scheduledTime}
                onChange={(e) => setScheduledTime(e.target.value)}
                className="w-full"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="secondary"
              onClick={() => setScheduleDialogOpen(false)}
              disabled={loading}
              className="hover:bg-muted/80 transition-colors"
            >
              Cancel
            </Button>
            <Button
              onClick={handleScheduleSubmit}
              disabled={loading || !scheduledDate || !scheduledTime}
              className="hover:bg-primary/90 transition-colors"
            >
              {loading ? (
                <span className="flex items-center">
                  <span className="animate-spin mr-2 h-4 w-4 border-2 border-primary-foreground border-opacity-50 border-t-transparent rounded-full"></span>
                  Scheduling...
                </span>
              ) : (
                'Schedule Post'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BlogEditor;