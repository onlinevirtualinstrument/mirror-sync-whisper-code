
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import AppLayout from '@/components/layout/AppLayout';
import BlogList from '@/components/blog/BlogList';
import BlogDetail from '@/components/blog/BlogDetail';
import BlogEditor from '@/components/blog/BlogEditor';
import { toast } from 'sonner';
import { scheduledPostService } from './services/scheduledPostService';

// Start the scheduled post service when the blog component mounts
scheduledPostService.start();

const Blog = () => {

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

      <div className="animate-fade-in min-h-screen bg-gradient-to-br from-purple-50 to-blue-50">

        <Routes>
          <Route path="/" element={<BlogList />} />
          <Route path="/new" element={<BlogEditor mode="create" />} />
          <Route path="/edit/:id" element={<BlogEditor mode="edit" />} />
          <Route path="/:id" element={<BlogDetail />} />
        </Routes>

      </div>
    </AppLayout>
  );
};

export default Blog;