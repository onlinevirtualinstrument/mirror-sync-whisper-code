
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FileText, Eye, Edit, Trash2, Calendar, Send } from 'lucide-react';
import { BlogDraft } from '../blog';
import { createBlogPost, deleteDraftById } from '../blogService';
import { auth } from '@/utils/auth/firebase';
import { toast } from 'sonner';

interface DraftCardProps {
  draft: BlogDraft;
  onDelete: (draftId: string) => void;
  onPublish?: () => void;
}

const DraftCard: React.FC<DraftCardProps> = ({ draft, onDelete, onPublish }) => {
  const navigate = useNavigate();

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handlePublish = async () => {
    try {
      const user = auth.currentUser;
      if (!user) {
        toast.error('You must be logged in to publish');
        return;
      }

      const postData = {
        title: draft.title,
        content: draft.content,
        imageUrl: draft.imageUrl,
        authorId: user.uid,
        authorName: user.displayName || 'Anonymous',
        authorPhotoURL: user.photoURL || '',
        createdAt: Date.now(),
        status: 'published'
      };

      await createBlogPost(postData);
      await deleteDraftById(draft.id);
      toast.success('Draft published successfully');
      onPublish?.();
    } catch (error) {
      console.error('Error publishing draft:', error);
      toast.error('Failed to publish draft');
    }
  };

  const handlePreview = () => {
    const previewWindow = window.open('', '_blank');
    if (previewWindow) {
      previewWindow.document.write(`
        <html> 
          <head><title>Preview: ${draft.title}</title></head>
          <body style="max-width: 800px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
            <h1>${draft.title}</h1>
            ${draft.imageUrl ? `<img src="${draft.imageUrl}" style="max-width: 100%; height: auto;" />` : ''}
            <div>${draft.content}</div>
          </body>
        </html>
      `);
    }
  };

  return (
    <Card className="hover:shadow-xl transition-all duration-200 bg-gradient-to-br from-[#F1F0FB] via-white to-[#E5DEFF] border-2 border-[#E5DEFF] h-full flex flex-col">
      <CardHeader className="flex-shrink-0">
        <div className="flex justify-between items-start">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-sm sm:text-lg mb-2 line-clamp-2">
              {draft.title || 'Untitled Draft'}
            </CardTitle>
            <div className="flex items-center gap-2 sm:gap-4 text-xs sm:text-sm text-gray-600 flex-wrap">
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="truncate">{formatDate(draft.updatedAt)}</span>
              </div>
              <Badge variant="outline" className="text-blue-600 border-blue-300 text-xs">
                {draft.status}
              </Badge>
            </div>
          </div>
          {draft.imageUrl && (
            <img
              src={draft.imageUrl}
              alt="Draft preview"
              className="w-12 h-12 sm:w-16 sm:h-16 object-cover rounded ml-2 sm:ml-4 flex-shrink-0"
            />
          )}
        </div>
      </CardHeader>

      <CardContent className="flex-grow flex flex-col">
        <div className="mb-4 flex-grow">
          <div
            className="text-gray-700 line-clamp-3 text-xs sm:text-sm"
            dangerouslySetInnerHTML={{
              __html: draft.content ? draft.content.substring(0, 120) + '...' : 'No content'
            }}
          />
        </div>

        <div className="grid grid-cols-2 gap-1 sm:gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handlePreview}
            className="text-blue-600 border-blue-300 hover:bg-blue-50 text-xs p-1 sm:p-2"
          >
            <Eye className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-1" />
            <span className="hidden sm:inline">Preview</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate(`/blog/edit/${draft.id}?isDraft=true`)}
            className="text-green-600 border-green-300 hover:bg-green-50 text-xs p-1 sm:p-2"
          >
            <Edit className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-1" />
            <span className="hidden sm:inline">Edit</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handlePublish}
            className="text-purple-600 border-purple-300 hover:bg-purple-50 text-xs p-1 sm:p-2"
          >
            <Send className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-1" />
            <span className="hidden sm:inline">Publish</span>
          </Button>

          <Button
            variant="destructive"
            size="sm"
            onClick={() => {
              if (confirm('Are you sure you want to delete this draft?')) {
                onDelete(draft.id);
              }
            }}
            className="text-xs p-1 sm:p-2"
          >
            <Trash2 className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-1" />
            <span className="hidden sm:inline">Delete</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default DraftCard;