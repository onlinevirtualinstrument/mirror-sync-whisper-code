
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FileText, Eye, Edit, Trash2, Calendar, ArrowLeft, Plus } from 'lucide-react';
import { auth } from '@/utils/auth/firebase';
import { toast } from 'sonner';
import { getUserDrafts, deleteDraftById, canUserEditBlogs } from '@/components/blog/blogService';
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from '@/hooks/useAuth';

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
  const [canEdit, setCanEdit] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();
  
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

  useEffect(() => {
    loadDrafts();
  }, []);

  const loadDrafts = async () => {
    const user = auth.currentUser;
    if (!user) return;

    try {
      const fetched = await getUserDrafts(user.uid);
      setDrafts(fetched);
    } catch (err) {
      console.error('Error loading drafts:', err);
    } finally {
      setLoading(false);
    }
  };

  const deleteDraft = async (draftId: string) => {
    try {
      await deleteDraftById(draftId);
      toast.success('Draft deleted');
      loadDrafts();
    } catch (err) {
      toast.error('Failed to delete draft');
    }
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
        <Button variant="ghost" asChild className="mb-6 text-[#7E69AB]">
          <Link to="/blog" className="flex items-center gap-2">
            <ArrowLeft size={16} />
            <span>Back to all posts</span>
          </Link>
        </Button>
        <Button onClick={() => navigate('/blog/new')} className="flex items-center gap-2 bg-gradient-to-r from-[#9b87f5] to-[#1EAEDB] text-white hover:brightness-110 shadow-lg transition-all animate-scale-in" >
          <Plus size={16} />
          <span>New Post</span>
        </Button>
      </div>

      {drafts.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <FileText className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-medium mb-2">No drafts yet</h3>
            <p className="text-gray-600 mb-4">Start writing your first blog post!</p>
            <Button onClick={() => navigate('/blog/new')} className="bg-gradient-to-r from-[#9b87f5] to-[#1EAEDB] text-white hover:brightness-110 shadow-lg transition-all animate-scale-in" >
              <Plus size={16} />
              <span> Create Draft</span>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {drafts.map((draft) => (
            <Card
              key={draft.id}
              className="hover:shadow-2xl hover:scale-[1.018] transition-all duration-200 bg-gradient-to-br from-[#F1F0FB] via-white to-[#E5DEFF] border-2 border-[#E5DEFF] animate-fade-in" >
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
                    variant="outline"
                    size="sm"
                    onClick={() => navigate(`/blog/edit/${draft.id}?isDraft=true`)}
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    Edit
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