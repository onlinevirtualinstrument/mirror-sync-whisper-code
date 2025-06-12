
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FileText, Eye, Edit, Trash2, Calendar } from 'lucide-react';
import { auth } from '@/utils/auth/firebase';
import { toast } from 'sonner';

interface BlogDraft {
  id: string;
  title: string;
  content: string;
  imageUrl?: string;
  authorId: string;
  authorName: string;
  createdAt: number;
  updatedAt: number;
  status: 'draft' | 'published';
}

const BlogDraftManager: React.FC = () => {
  const [drafts, setDrafts] = useState<BlogDraft[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDrafts();
  }, []);

  const loadDrafts = () => {
    try {
      const savedDrafts = localStorage.getItem('blog-drafts');
      if (savedDrafts) {
        const parsedDrafts = JSON.parse(savedDrafts);
        setDrafts(parsedDrafts.filter((draft: BlogDraft) => 
          draft.authorId === auth.currentUser?.uid
        ));
      }
    } catch (error) {
      console.error('Error loading drafts:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveDraft = (draftData: Partial<BlogDraft>) => {
    const user = auth.currentUser;
    if (!user) return;

    const draft: BlogDraft = {
      id: draftData.id || `draft-${Date.now()}`,
      title: draftData.title || '',
      content: draftData.content || '',
      imageUrl: draftData.imageUrl,
      authorId: user.uid,
      authorName: user.displayName || 'Anonymous',
      createdAt: draftData.createdAt || Date.now(),
      updatedAt: Date.now(),
      status: 'draft'
    };

    const existingDrafts = JSON.parse(localStorage.getItem('blog-drafts') || '[]');
    const draftIndex = existingDrafts.findIndex((d: BlogDraft) => d.id === draft.id);
    
    if (draftIndex >= 0) {
      existingDrafts[draftIndex] = draft;
    } else {
      existingDrafts.push(draft);
    }

    localStorage.setItem('blog-drafts', JSON.stringify(existingDrafts));
    loadDrafts();
    toast.success('Draft saved successfully');
  };

  const deleteDraft = (draftId: string) => {
    const existingDrafts = JSON.parse(localStorage.getItem('blog-drafts') || '[]');
    const updatedDrafts = existingDrafts.filter((d: BlogDraft) => d.id !== draftId);
    localStorage.setItem('blog-drafts', JSON.stringify(updatedDrafts));
    loadDrafts();
    toast.success('Draft deleted');
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return <div className="text-center py-8">Loading drafts...</div>;
  }

  return (
    <div className="container mx-auto px-6 py-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Draft Manager</h1>
        <Button onClick={() => window.location.href = '/blog/create'}>
          <FileText className="h-4 w-4 mr-2" />
          New Draft
        </Button>
      </div>

      {drafts.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <FileText className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-medium mb-2">No drafts yet</h3>
            <p className="text-gray-600 mb-4">Start writing your first blog post!</p>
            <Button onClick={() => window.location.href = '/blog/create'}>
              Create Draft
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {drafts.map((draft) => (
            <Card key={draft.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <CardTitle className="text-xl mb-2">
                      {draft.title || 'Untitled Draft'}
                    </CardTitle>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {formatDate(draft.updatedAt)}
                      </div>
                      <Badge variant="outline">
                        {draft.status}
                      </Badge>
                    </div>
                  </div>
                  {draft.imageUrl && (
                    <img
                      src={draft.imageUrl}
                      alt="Draft preview"
                      className="w-16 h-16 object-cover rounded ml-4"
                    />
                  )}
                </div>
              </CardHeader>

              <CardContent>
                <div className="mb-4">
                  <div 
                    className="text-gray-700 line-clamp-3"
                    dangerouslySetInnerHTML={{ 
                      __html: draft.content.substring(0, 200) + '...' 
                    }}
                  />
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.location.href = `/blog/edit/${draft.id}`}
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    Edit
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      // Preview functionality
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
                    }}
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    Preview
                  </Button>

                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => {
                      if (confirm('Are you sure you want to delete this draft?')) {
                        deleteDraft(draft.id);
                      }
                    }}
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default BlogDraftManager;
