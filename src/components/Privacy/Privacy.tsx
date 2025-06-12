
import React from 'react';

const Privacy: React.FC = () => {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Privacy Policy</h1>
      <div className="bg-gray-100 dark:bg-gray-800 p-8 rounded-lg">
        <h2 className="text-xl font-bold mb-4">Information We Collect</h2>
        <p className="mb-4">
          We collect information you provide directly to us, such as when you create an account, 
          use our services, or contact us for support.
        </p>
        
        <h2 className="text-xl font-bold mb-4">How We Use Your Information</h2>
        <p className="mb-4">
          We use the information we collect to provide, maintain, and improve our services, 
          process transactions, and communicate with you.
        </p>
        
        <h2 className="text-xl font-bold mb-4">Information Sharing</h2>
        <p className="mb-4">
          We do not sell, trade, or otherwise transfer your personal information to third parties 
          without your consent, except as described in this policy.
        </p>
      </div>
    </div>
  );
};

export default Privacy;
