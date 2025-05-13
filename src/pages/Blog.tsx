import React from 'react';
import AppLayout from '@/components/layout/AppLayout';
import SectionTitle from '@/components/ui-components/SectionTitle'; 

const Blog = () => {
  return (
    <AppLayout>
      <div className="container mx-auto px-6 py-20">
        <SectionTitle 
          title="Blog" 
          subtitle="Articles, tips, and news about music and instruments" 
        />
        
        <div className="py-10 text-center">
          <p className="text-gray-600 dark:text-gray-400">
            Blog posts are coming soon!
          </p>
        </div>
      </div>
    </AppLayout>
  );
};

export default Blog;