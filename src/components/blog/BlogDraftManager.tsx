
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { FileText, ArrowLeft, Plus } from 'lucide-react';
import { auth } from '@/utils/auth/firebase';
import { toast } from 'sonner';
import { getUserDrafts, deleteDraftById, canUserEditBlogs } from '@/components/blog/blogService';
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from '@/hooks/useAuth';
import { BlogDraft } from './blog';
import DraftCard from './components/DraftCard';

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

  if (loading) {
    return <div className="text-center py-8">Loading drafts...</div>;
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-10">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <Button variant="ghost" asChild className="text-[#7E69AB] self-start">
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

      <h1 className="text-2xl sm:text-3xl font-bold text-[#7E69AB] mb-6 sm:mb-8">Your Drafts</h1>

      {drafts.length === 0 ? (
        <div className="text-center py-12 bg-[#F1F0FB] rounded-lg border border-[#E5DEFF] shadow-inner">
          <FileText className="h-12 w-12 mx-auto mb-4 text-[#D6BCFA]" />
          <h3 className="text-lg font-medium mb-2 text-[#7E69AB]">No drafts yet</h3>
          <p className="text-gray-600 mb-4">Start writing your first blog post!</p>
          <Button onClick={() => navigate('/blog/new')} className="bg-gradient-to-r from-[#9b87f5] to-[#1EAEDB] text-white hover:brightness-110 shadow-lg transition-all animate-scale-in" >
            <Plus size={16} className="mr-2" />
            Create Draft
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
          {drafts.map((draft) => (
            <DraftCard
              key={draft.id}
              draft={draft}
              onDelete={deleteDraft}
              onPublish={loadDrafts}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default BlogDraftManager;