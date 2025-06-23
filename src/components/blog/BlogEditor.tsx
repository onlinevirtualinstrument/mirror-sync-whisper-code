
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogFooter, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { ArrowLeft } from 'lucide-react';
import { useBlogEditor } from './hooks/useBlogEditor';
import BlogEditorForm from './components/BlogEditorForm';

const BlogEditor: React.FC<{ mode: 'create' | 'edit' }> = ({ mode }) => {
  const {
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
    saveDraft,
    convertToDraft,
    handleScheduleSubmit,
    handleSubmit,
    navigate
  } = useBlogEditor(mode);

  if (initialLoading) {
    return <p className="text-center py-20 animate-pulse">Loading blog editor...</p>;
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-10">
      <div className="mb-4 flex flex-col sm:flex-row justify-between gap-4">
        <Button variant="ghost" asChild className="text-[#7E69AB] self-start">
          <Link to="/blog" className="flex items-center gap-2">
            <ArrowLeft size={16} />
            <span>Back to all posts</span>
          </Link>
        </Button>
      </div>

      <BlogEditorForm
        title={title}
        content={content}
        imageUrl={imageUrl}
        originalStatus={originalStatus}
        isDraftMode={isDraftMode}
        isScheduledMode={isScheduledMode}
        loading={loading}
        onTitleChange={setTitle}
        onContentChange={setContent}
        onImageUrlChange={setImageUrl}
        onSubmit={handleSubmit}
        onSaveDraft={saveDraft}
        onConvertToDraft={convertToDraft}
        onSchedule={() => setScheduleDialogOpen(true)}
        onCancel={() => navigate('/blog')}
      />

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