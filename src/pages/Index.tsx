
import React, { useState, useEffect } from 'react';
import CodeEditor from '../components/CodeEditor';
import Preview from '../components/Preview';
import Header from '../components/Header';
import { useCodeStore } from '../utils/codeStore';
import { useResizable } from '@/hooks/use-resizable';

const Index = () => {
  const [showPreview, setShowPreview] = useState(true);
  const { activeTab, setCode } = useCodeStore();
  const { leftPaneRef, rightPaneRef, separatorRef, initResizable } = useResizable();

  // Initialize the resizable panes
  useEffect(() => {
    initResizable();

    // Check for shared code in URL
    const urlParams = new URLSearchParams(window.location.search);
    const sharedCode = urlParams.get('code');
    
    if (sharedCode) {
      try {
        const decodedData = JSON.parse(atob(sharedCode));
        if (decodedData.html) setCode('html', decodedData.html);
        if (decodedData.css) setCode('css', decodedData.css);
        if (decodedData.javascript) setCode('javascript', decodedData.javascript);
      } catch (error) {
        console.error('Failed to parse shared code', error);
      }
    }
  }, [initResizable, setCode]);

  return (
    <div className="h-screen flex flex-col bg-editor-bg">
      <Header showPreview={showPreview} setShowPreview={setShowPreview} />
      
      <div className="flex-1 flex overflow-hidden">
        <div 
          ref={leftPaneRef}
          className="flex-1 min-w-[30%] h-full overflow-hidden"
        >
          <CodeEditor language={activeTab} />
        </div>
        
        {showPreview && (
          <>
            <div ref={separatorRef} className="resizer" />
            <div 
              ref={rightPaneRef}
              className="flex-1 min-w-[30%] h-full p-4"
            >
              <Preview />
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Index;
