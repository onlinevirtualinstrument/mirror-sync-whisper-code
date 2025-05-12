
import React, { useEffect, useState } from 'react';
import { useCodeStore } from '../utils/codeStore';

const Preview: React.FC = () => {
  const { getSrcDoc } = useCodeStore();
  const [srcDoc, setSrcDoc] = useState('');

  // Update preview with a slight delay to avoid too frequent updates
  useEffect(() => {
    const timer = setTimeout(() => {
      setSrcDoc(getSrcDoc());
    }, 750);

    return () => clearTimeout(timer);
  }, [getSrcDoc]);

  return (
    <div className="h-full w-full preview-container">
      <iframe
        title="preview"
        srcDoc={srcDoc}
        sandbox="allow-scripts allow-modals"
        width="100%"
        height="100%"
      />
    </div>
  );
};

export default Preview;
