
import React, { useEffect, useRef } from 'react';
import Editor from '@monaco-editor/react';
import { Language } from '../types';
import { useCodeStore } from '../utils/codeStore';

interface CodeEditorProps {
  language: Language;
}

const languageMap = {
  html: 'html',
  css: 'css',
  javascript: 'javascript'
};

const CodeEditor: React.FC<CodeEditorProps> = ({ language }) => {
  const { html, css, javascript, setCode } = useCodeStore();
  const editorRef = useRef(null);

  const codeMap = {
    html,
    css,
    javascript
  };

  const handleEditorChange = (value: string = '') => {
    setCode(language, value);
  };

  const handleEditorDidMount = (editor: any) => {
    editorRef.current = editor;
    editor.focus();
  };

  return (
    <div className="h-full w-full code-editor-container">
      <Editor
        height="100%"
        language={languageMap[language]}
        value={codeMap[language]}
        onChange={handleEditorChange}
        onMount={handleEditorDidMount}
        theme="vs-dark"
        options={{
          minimap: { enabled: false },
          fontSize: 14,
          wordWrap: 'on',
          scrollBeyondLastLine: false,
          automaticLayout: true,
          tabSize: 2,
          formatOnPaste: true,
          formatOnType: true,
          cursorBlinking: 'smooth',
          scrollbar: {
            verticalScrollbarSize: 10,
            horizontalScrollbarSize: 10
          }
        }}
      />
    </div>
  );
};

export default CodeEditor;
