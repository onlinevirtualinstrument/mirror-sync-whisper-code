
import React from 'react';

const Terms: React.FC = () => {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Terms of Service</h1>
      <div className="bg-gray-100 dark:bg-gray-800 p-8 rounded-lg">
        <h2 className="text-xl font-bold mb-4">1. Acceptance of Terms</h2>
        <p className="mb-4">
          By using HarmonyHub, you agree to be bound by these Terms of Service.
        </p>
        
        <h2 className="text-xl font-bold mb-4">2. Use of Service</h2>
        <p className="mb-4">
          You may use our service for lawful purposes only. You agree not to use the service 
          in any way that violates any applicable laws or regulations.
        </p>
        
        <h2 className="text-xl font-bold mb-4">3. User Content</h2>
        <p className="mb-4">
          You retain ownership of any content you create using our platform. However, 
          you grant us a license to use such content for the operation of our service.
        </p>
      </div>
    </div>
  );
};

export default Terms;
