
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import BlogList from './BlogList';
import BlogDetail from './BlogDetail';
import BlogEditor from './BlogEditor';
import { scheduledPostService } from './services/scheduledPostService';

// Start the scheduled post service when the blog component mounts
scheduledPostService.start();

const Blog: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50">
      <Routes>
        <Route path="/" element={<BlogList />} />
        <Route path="/new" element={<BlogEditor mode="create" />} />
        <Route path="/edit/:id" element={<BlogEditor mode="edit" />} />
        <Route path="/:id" element={<BlogDetail />} />
      </Routes>
    </div>
  );
};

export default Blog;
