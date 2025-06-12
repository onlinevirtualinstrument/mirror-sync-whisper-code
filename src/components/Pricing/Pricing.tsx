
import React from 'react';

const Pricing: React.FC = () => {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Pricing</h1>
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-gray-100 dark:bg-gray-800 p-6 rounded-lg">
          <h2 className="text-xl font-bold mb-4">Free Plan</h2>
          <p className="text-2xl font-bold mb-4">$0/month</p>
          <ul className="space-y-2">
            <li>✓ Access to basic instruments</li>
            <li>✓ Limited recording time</li>
            <li>✓ Community support</li>
          </ul>
        </div>
        <div className="bg-primary text-primary-foreground p-6 rounded-lg">
          <h2 className="text-xl font-bold mb-4">Premium Plan</h2>
          <p className="text-2xl font-bold mb-4">$9.99/month</p>
          <ul className="space-y-2">
            <li>✓ All instruments</li>
            <li>✓ Unlimited recording</li>
            <li>✓ Priority support</li>
            <li>✓ Advanced features</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Pricing;
