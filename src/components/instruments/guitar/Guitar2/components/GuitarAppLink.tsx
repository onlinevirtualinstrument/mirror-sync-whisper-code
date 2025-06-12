
import React from 'react';
import { Link } from 'react-router-dom';

const GuitarAppLink: React.FC = () => {
  return (
    <Link to="/guitar" className="text-blue-500 hover:text-blue-700">
      Guitar App
    </Link>
  );
};

export default GuitarAppLink;
