
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import AppLayout from '@/components/layout/AppLayout';
import BlogList from '@/components/blog/BlogList';
import BlogDetail from '@/components/blog/BlogDetail';
import BlogEditor from '@/components/blog/BlogEditor';
import BlogDraftManager from '@/components/blog/BlogDraftManager';
import UserRoleManager from '@/components/blog/UserRoleManager';
import { BlogPost, UserRole } from '@/components/blog/blog';
import { useAuth } from '@/hooks/useAuth';
import { canUserEditBlogs } from '@/components/blog/blogService';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';


const Blog = () => {
  const { user } = useAuth();
  const [canEdit, setCanEdit] = useState(false);
  const [loading, setLoading] = useState(true);

  

  useEffect(() => {
    const checkPermission = async () => {
      if (user) {
        try {
          const hasPermission = await canUserEditBlogs();
          setCanEdit(hasPermission);
        } catch (error) {
          console.error('Error checking permissions:', error);
        }
      } else {
        setCanEdit(false);
      }
      setLoading(false);
    };

    checkPermission();

    }, [user]);

  return (
    <AppLayout 
      title="Blog | HarmonyHub" 
      description="Read the latest articles, tips, and news about music and instruments"
    >
      {/* Add beautiful animated gradient header */}
      <div className="w-full py-8 mb-2 bg-gradient-to-r from-[#E5DEFF] via-[#9b87f5] to-[#1EAEDB] animate-fade-in rounded-b-2xl shadow-lg flex flex-col md:flex-row items-center justify-between px-6 gap-4">
        <h1 className="text-3xl font-extrabold text-[#1A1F2C] tracking-tight drop-shadow-lg animate-fade-in">🎶 HarmonyHub Blog</h1>
        <span onClick={() => toast.info('Feature not available yet!')} className="text-md text-[#221F26] bg-white bg-opacity-70 px-3 py-1 rounded-xl font-medium shadow animate-scale-in">
          New: Share your music journey!
        </span>
      </div>

      <div className="animate-fade-in">
        <Routes>
          <Route path="/" element={<BlogList />} />
          <Route path="/:id" element={<BlogDetail />} />
          
          {/* Protected routes - only accessible to admin/super_admin */}
          <Route
            path="/new"
            element={
              loading ? (
                <div className="container mx-auto px-6 py-10 text-center">Checking permissions...</div>
              ) : canEdit ? (
                <BlogEditor mode="create" />
              ) : (
                <Navigate to="/blog" replace />
              )
            }
          />
          
          <Route
            path="/edit/:id"
            element={
              loading ? (
                <div className="container mx-auto px-6 py-10 text-center">Checking permissions...</div>
              ) : canEdit ? (
                <BlogEditor mode="edit" />
              ) : (
                <Navigate to="/blog" replace />
              )
            }
          />
          
          <Route
            path="/drafts"
            element={
              loading ? (
                <div className="container mx-auto px-6 py-10 text-center">Checking permissions...</div>
              ) : canEdit ? (
                <BlogDraftManager />
              ) : (
                <Navigate to="/blog" replace />
              )
            }
          />
          
          <Route
            path="/admin/roles"
            element={<UserRoleManager />}
          />
        </Routes>
      </div>
    </AppLayout>
  );
};

export default Blog;