
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import AppLayout from '@/components/layout/AppLayout';
import BlogList from '@/components/blog/BlogList';
import BlogDetail from '@/components/blog/BlogDetail';
import BlogEditor from '@/components/blog/BlogEditor';
import UserRoleManager from '@/components/blog/UserRoleManager';
import { useAuth } from '@/hooks/useAuth';
import { canUserEditBlogs } from '@/services/blogService';
import { useEffect, useState } from 'react';

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
          path="/admin/roles"
          element={<UserRoleManager />}
        />
      </Routes>
    </AppLayout>
  );
};

export default Blog;