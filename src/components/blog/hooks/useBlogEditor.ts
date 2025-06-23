
import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import { auth } from '@/utils/auth/firebase';
import { 
  createBlogPost, 
  updateBlogPost, 
  getBlogPostById, 
  deleteBlogPost 
} from '../services/blogDataService';
import { BlogPost } from '../blog';

export const useBlogEditor = (mode: 'create' | 'edit') => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(mode === 'edit');
  const [currentDraftId, setCurrentDraftId] = useState<string | null>(null);
  const [isDraftMode, setIsDraftMode] = useState(false);
  const [isScheduledMode, setIsScheduledMode] = useState(false);
  const [originalStatus, setOriginalStatus] = useState<string>('');
  const [scheduleDialogOpen, setScheduleDialogOpen] = useState(false);
  const [scheduledDate, setScheduledDate] = useState('');
  const [scheduledTime, setScheduledTime] = useState('');
  const [lastSavedContent, setLastSavedContent] = useState({ title: '', content: '', imageUrl: '' });
  
  const navigate = useNavigate();
  const { id } = useParams();
  const [searchParams] = useSearchParams();

  // Load existing post data for edit mode
  useEffect(() => {
    const isDraft = searchParams.get('isDraft') === 'true';
    setIsDraftMode(isDraft);

    if (mode === 'edit' && id) {
      const fetchData = async () => {
        try {
          const postData = await getBlogPostById(id);
          
          if (postData) {
            setTitle(postData.title || '');
            setContent(postData.content || '');
            setImageUrl(postData.imageUrl || '');
            setOriginalStatus(postData.status || 'published');
            setCurrentDraftId(postData.status === 'draft' ? id : null);
            
            if (postData.status === 'scheduled') {
              setIsScheduledMode(true);
              if (postData.scheduledFor) {
                const scheduleDate = new Date(postData.scheduledFor);
                setScheduledDate(scheduleDate.toISOString().split('T')[0]);
                setScheduledTime(scheduleDate.toTimeString().slice(0, 5));
              }
            }
            
            setLastSavedContent({
              title: postData.title || '',
              content: postData.content || '',
              imageUrl: postData.imageUrl || ''
            });
          } else {
            toast.error('Blog post not found');
            navigate('/blog');
          }
        } catch (error) {
          console.error('Error loading post:', error);
          toast.error('Failed to load content');
        } finally {
          setInitialLoading(false);
        }
      };
      fetchData();
    }
  }, [id, mode, navigate, searchParams]);

  const saveDraft = useCallback(async () => {
    const user = auth.currentUser;
    if (!user) {
      toast.error('You must be logged in to save a draft');
      return;
    }

    if (!title.trim() && !content.trim()) {
      toast.error('Cannot save empty draft');
      return;
    }

    try {
      setLoading(true);
      let draftId = currentDraftId;
      
      const postData = {
        title: title.trim(),
        content: content.trim(),
        imageUrl,
        authorId: user.uid,
        authorName: user.displayName || 'Anonymous',
        authorPhotoURL: user.photoURL || '',
        status: 'draft',
        updatedAt: Date.now(),
      };

      if (mode === 'create' || !draftId) {
        // Create new draft
        const newPostData = {
          ...postData,
          createdAt: Date.now()
        };
        draftId = await createBlogPost(newPostData);
        setCurrentDraftId(draftId);
      } else {
        // Update existing post to draft status
        await updateBlogPost(draftId, postData);
      }
      
      setLastSavedContent({ title: title.trim(), content: content.trim(), imageUrl });
      toast.success('Draft saved successfully');
    } catch (error) {
      console.error('Error saving draft:', error);
      toast.error('Failed to save draft');
    } finally {
      setLoading(false);
    }
  }, [title, content, imageUrl, currentDraftId, mode]);

  const convertToDraft = useCallback(async () => {
    if (!title.trim() || !content.trim()) {
      toast.error('Title and content are required');
      return;
    }

    if (mode === 'edit' && id) {
      try {
        setLoading(true);
        await updateBlogPost(id, {
          title: title.trim(),
          content: content.trim(),
          imageUrl,
          status: 'draft',
          updatedAt: Date.now(),
          scheduledFor: null // Remove scheduled fields
        });

        toast.success('Post converted to draft successfully');
        navigate('/blog');
      } catch (error) {
        console.error('Error converting to draft:', error);
        toast.error('Failed to convert to draft');
      } finally {
        setLoading(false);
      }
    }
  }, [title, content, imageUrl, mode, id, navigate]);

  const handleScheduleSubmit = useCallback(async () => {
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

    try {
      setLoading(true);
      const user = auth.currentUser;
      if (!user) {
        toast.error('You must be logged in to schedule a post');
        return;
      }

      const postData = {
        title: title.trim(),
        content: content.trim(),
        imageUrl,
        authorId: user.uid,
        authorName: user.displayName || 'Anonymous',
        authorPhotoURL: user.photoURL || '',
        scheduledFor: scheduledDateTime.getTime(),
        status: 'scheduled',
        updatedAt: Date.now()
      };

      if (mode === 'create' || (isDraftMode && currentDraftId)) {
        if (currentDraftId) {
          // Update existing draft to scheduled
          await updateBlogPost(currentDraftId, postData);
          toast.success('Draft scheduled for publication');
        } else {
          // Create new scheduled post
          const newPostData = { ...postData, createdAt: Date.now() };
          await createBlogPost(newPostData);
          toast.success('Post scheduled successfully');
        }
      } else if (mode === 'edit' && id) {
        // Update existing post to scheduled
        await updateBlogPost(id, postData);
        toast.success('Post rescheduled successfully');
      }

      navigate('/blog');
    } catch (error) {
      console.error('Error scheduling post:', error);
      toast.error('Failed to schedule post');
    } finally {
      setLoading(false);
      setScheduleDialogOpen(false);
    }
  }, [scheduledDate, scheduledTime, title, content, imageUrl, mode, isDraftMode, currentDraftId, id, navigate]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim() || !content.trim()) {
      toast.error('Title and content are required');
      return;
    }

    try {
      setLoading(true);
      const user = auth.currentUser;
      if (!user) {
        toast.error('You must be logged in to create a post');
        return;
      }

      const postData = {
        title: title.trim(),
        content: content.trim(),
        imageUrl,
        authorId: user.uid,
        authorName: user.displayName || 'Anonymous',
        authorPhotoURL: user.photoURL || '',
        publishedAt: Date.now(),
        status: 'published',
        updatedAt: Date.now(),
        scheduledFor: null // Remove scheduled fields when publishing
      };

      if (mode === 'create' || (isDraftMode && currentDraftId)) {
        if (currentDraftId) {
          // Update existing draft to published
          await updateBlogPost(currentDraftId, postData);
          toast.success('Draft published successfully');
        } else {
          // Create new published post
          const newPostData = { ...postData, createdAt: Date.now() };
          const postId = await createBlogPost(newPostData);
          navigate(`/blog/${postId}`);
          return;
        }
      } else if (mode === 'edit' && id) {
        // Update existing post to published
        await updateBlogPost(id, postData);
        toast.success('Blog post updated successfully');
        navigate(`/blog/${id}`);
        return;
      }
      
      navigate('/blog');
    } catch (error) {
      console.error('Error saving blog:', error);
      toast.error('Failed to save blog');
    } finally {
      setLoading(false);
    }
  }, [title, content, imageUrl, mode, isDraftMode, currentDraftId, id, navigate]);

  return {
    // State
    title, setTitle,
    content, setContent,
    imageUrl, setImageUrl,
    loading,
    initialLoading,
    isDraftMode,
    isScheduledMode,
    originalStatus,
    scheduleDialogOpen, setScheduleDialogOpen,
    scheduledDate, setScheduledDate,
    scheduledTime, setScheduledTime,
    
    // Actions
    saveDraft,
    convertToDraft,
    handleScheduleSubmit,
    handleSubmit,
    navigate
  };
};
