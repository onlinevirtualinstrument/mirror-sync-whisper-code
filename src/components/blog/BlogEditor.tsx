
import React, { useState, useRef, useEffect } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogFooter, DialogTitle } from '@/components/ui/dialog';
import { createBlogPost, updateBlogPost, getBlogPostById, saveDraftToFirestore, getDraftById, deleteDraftById } from '@/components/blog/blogService';
import { useNavigate, useParams, Link, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import { auth } from '@/utils/auth/firebase';
import { Save, ArrowLeft, DraftingCompass, Calendar, Clock } from 'lucide-react';

const BlogEditor: React.FC<{ mode: 'create' | 'edit' }> = ({ mode }) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(mode === 'edit');
  const [autoSaveTimer, setAutoSaveTimer] = useState<NodeJS.Timeout | null>(null);
  const [isDraftMode, setIsDraftMode] = useState(false);
  const [isScheduledMode, setIsScheduledMode] = useState(false);
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
            postData = await getDraftById(id);
          } else {
            postData = await getBlogPostById(id);
            // Check if it's a scheduled post
            if (postData && postData.status === 'scheduled') {
              setIsScheduledMode(true);
            }
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

  useEffect(() => {
    if (autoSaveTimer) {
      clearTimeout(autoSaveTimer);
    }

    const timer = setTimeout(() => {
      if (title || content) {
        saveDraft();
        toast.success('Autosaved draft');
      }
    }, 3000);

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
    if (!title.trim() && !content.trim()) {
      toast.error('Cannot save empty draft');
      return;
    }

    await saveDraft();
    toast.success('Draft saved successfully');
  };

  const handleConvertToDraft = async () => {
    if (!title.trim() || !content.trim()) {
      toast.error('Title and content are required');
      return;
    }

    setLoading(true);
    try {
      const user = auth.currentUser;
      if (!user) {
        toast.error('You must be logged in');
        setLoading(false);
        return;
      }

      // Create new draft
      const draftId = `draft-${user.uid}-${Date.now()}`;
      const draftData = {
        id: draftId,
        title: title.trim(),
        content: content.trim(),
        imageUrl,
        authorId: user.uid,
        authorName: user.displayName || 'Anonymous',
        createdAt: Date.now(),
        updatedAt: Date.now(),
        status: 'draft',
      };

      await saveDraftToFirestore(draftId, draftData);

      // Delete from published/scheduled if editing existing post
      if (mode === 'edit' && id && !isDraftMode) {
        // await updateBlogPost(id, { status: 'deleted' }); // Mark as deleted instead of actual deletion
        await deleteDraftById(id);
      }

      toast.success('Post converted to draft successfully');
      navigate('/blog/drafts');
    } catch (error: any) {
      console.error('Error converting to draft:', error);
      toast.error('Failed to convert to draft');
    } finally {
      setLoading(false);
    }
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

    if (!title.trim() || !content.trim()) {
      toast.error('Title and content are required');
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
        title: title.trim(),
        content: content.trim(),
        imageUrl,
        authorId: user.uid,
        authorName: user.displayName || 'Anonymous',
        authorPhotoURL: user.photoURL || '',
        createdAt: Date.now(),
        scheduledFor: scheduledDateTime.getTime(),
        status: 'scheduled'
      };

      if (mode === 'create' || isDraftMode) {
        // Create new scheduled post
        await createBlogPost(postData);

        // Delete from drafts if it was a draft
        if (isDraftMode && id) {
          await deleteDraftById(id);
          toast.success('Draft scheduled for publication');
        } else {
          toast.success('Post scheduled successfully');
        }
      } else if (mode === 'edit' && id) {
        // Update existing post to scheduled
        await updateBlogPost(id, {
          ...postData,
          updatedAt: Date.now()
        });
        toast.success('Post rescheduled successfully');
      }

      navigate('/blog');
    } catch (error: any) {
      console.error('Error scheduling post:', error);
      toast.error(error.message || 'Failed to schedule post');
    } finally {
      setLoading(false);
      setScheduleDialogOpen(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim() || !content.trim()) {
      toast.error('Title and content are required');
      return;
    }

    setLoading(true);
    try {
      const user = auth.currentUser;
      if (!user) {
        toast.error('You must be logged in to create a post');
        setLoading(false);
        return;
      }

      const postData = {
        title: title.trim(),
        content: content.trim(),
        imageUrl,
        authorId: user.uid,
        authorName: user.displayName || 'Anonymous',
        authorPhotoURL: user.photoURL || '',
        createdAt: Date.now(),
        publishedAt: Date.now(),
        status: 'published'
      };

      if (mode === 'create' || isDraftMode) {
        const postId = await createBlogPost(postData);

        if (isDraftMode && id) {
          await deleteDraftById(id);
          toast.success('Draft published successfully');
        } else {
          toast.success('Blog post published successfully');
        }

        navigate(`/blog/${postId}`);
      } else if (mode === 'edit' && id) {
        await updateBlogPost(id, {
          ...postData,
          updatedAt: Date.now()
        });
        toast.success('Blog post updated successfully');
        navigate(`/blog/${id}`);
      }
    } catch (error: any) {
      console.error('Error saving blog:', error);
      toast.error(error.message || 'Failed to save blog');
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) return <p className="text-center py-20 animate-pulse">Loading blog editor...</p>;

  return (
    <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-10">
      <div className="mb-4 flex flex-col sm:flex-row justify-between gap-4">
        <Button variant="ghost" asChild className="text-[#7E69AB] self-start">
          <Link to="/blog" className="flex items-center gap-2">
            <ArrowLeft size={16} />
            <span>Back to all posts</span>
          </Link>
        </Button>
        <div className="flex flex-wrap gap-2">
          <Link to="/blog/drafts" className="flex items-center gap-2">
            <Button className="flex items-center gap-2 bg-gradient-to-r from-[#9b87f5] to-[#1EAEDB] text-white hover:brightness-110 shadow-lg transition-all animate-scale-in text-sm">
              <DraftingCompass size={16} />
              <span className="hidden sm:inline">View Drafts</span>
              <span className="sm:hidden">Drafts</span>
            </Button>
          </Link>
        </div>
      </div>

      <Card className="allow-copy p-4 sm:p-6 bg-gradient-to-r from-[#F1F0FB] to-[#D6BCFA] border-2 border-[#E5DEFF] shadow-lg animate-fade-in">
        <form onSubmit={handleSubmit} className="space-y-6">
          {isDraftMode && (
            <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mb-4">
              <strong>Editing Draft:</strong> This post will be published when you click "Publish Post" and removed from your drafts.
            </div>
          )}

          {isScheduledMode && (
            <div className="bg-orange-100 border border-orange-400 text-orange-700 px-4 py-3 rounded mb-4">
              <strong>Editing Scheduled Post:</strong> You can reschedule, publish now, or convert to draft.
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
            <div className="flex flex-col sm:flex-row justify-between items-start gap-2">
              <label htmlFor="imageUrl" className="text-sm font-medium text-[#7E69AB]">
                Optional Blog Image URL
              </label>
              {imageUrl && (
                <span className="text-sm font-medium text-[#7E69AB]">
                  Image Preview
                </span>
              )}
            </div>

            <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 items-start">
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
                  className="w-full sm:w-32 h-20 object-cover rounded border shadow hover:scale-105 transition-transform"
                />
              )}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={handleSaveDraft}
                disabled={loading}
                className="border-[#9b87f5] text-[#7E69AB] hover:bg-[#E5DEFF] text-sm"
              >
                <Save className="h-4 w-4 mr-2" />
                Save Draft
              </Button>

              {(mode === 'edit' && !isDraftMode) && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleConvertToDraft}
                  disabled={loading}
                  className="border-[#9b87f5] text-[#7E69AB] hover:bg-[#E5DEFF] text-sm"
                >
                  <DraftingCompass className="h-4 w-4 mr-2" />
                  Convert to Draft
                </Button>
              )}

              <Button
                type="button"
                variant="outline"
                onClick={() => setScheduleDialogOpen(true)}
                disabled={loading}
                className="border-[#9b87f5] text-[#7E69AB] hover:bg-[#E5DEFF] text-sm"
              >
                <Calendar className="h-4 w-4 mr-2" />
                {isScheduledMode ? 'Reschedule' : 'Schedule'}
              </Button>
            </div>

            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/blog')}
                disabled={loading}
                className="border-[#9b87f5] text-[#7E69AB] hover:bg-[#E5DEFF] text-sm"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="bg-gradient-to-r from-[#9b87f5] to-[#1EAEDB] text-white font-bold hover:shadow-md transition-all text-sm"
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
            {scheduledDate && scheduledTime && (
              <p className="text-xs text-[#7E69AB] mt-1">
                📅 Schedule for: {new Date(`${scheduledDate}T${scheduledTime}`).toLocaleString()}
              </p>
            )}
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