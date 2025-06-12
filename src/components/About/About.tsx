
import React from 'react';

const About: React.FC = () => {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">About HarmonyHub</h1>
      <div className="bg-gray-100 dark:bg-gray-800 p-8 rounded-lg">
        <p className="text-lg mb-4">
          HarmonyHub is the world's most comprehensive virtual musical instruments platform.
        </p>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          We believe that music should be accessible to everyone. Our platform allows you to play, 
          learn, and create music with high-quality virtual instruments right from your browser.
        </p>
        <p className="text-gray-600 dark:text-gray-400">
          Whether you're a beginner or a professional musician, HarmonyHub provides the tools 
          you need to express your creativity and improve your musical skills.
        </p>
      </div>
    </div>
  );
};

export default About;
