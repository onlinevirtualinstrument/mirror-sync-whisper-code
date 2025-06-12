
import React from 'react';

const Contact: React.FC = () => {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Contact Us</h1>
      <div className="bg-gray-100 dark:bg-gray-800 p-8 rounded-lg">
        <p className="text-lg mb-4">Get in touch with us!</p>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          We'd love to hear from you. Send us a message and we'll respond as soon as possible.
        </p>
        <div className="space-y-2">
          <p><strong>Email:</strong> contact@harmonyhub.app</p>
          <p><strong>Phone:</strong> +1 (555) 123-4567</p>
        </div>
      </div>
    </div>
  );
};

export default Contact;
