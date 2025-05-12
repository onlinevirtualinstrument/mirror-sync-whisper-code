
import { create } from 'zustand';
import { CodeState, Language } from '../types';

const DEFAULT_HTML = `<!DOCTYPE html>
<html>
  <head>
    <title>Code Mirror</title>
  </head>
  <body>
    <h1>Hello, Code Sync Magic Mirror!</h1>
    <p>Start editing to see your changes reflected in real-time.</p>
    <div class="container">
      <button id="demo-btn">Click Me!</button>
    </div>
  </body>
</html>`;

const DEFAULT_CSS = `body {
  font-family: system-ui, sans-serif;
  margin: 0;
  padding: 20px;
  background-color: #f9f9f9;
  color: #333;
}

h1 {
  color: #6366f1;
}

.container {
  margin-top: 20px;
}

#demo-btn {
  background-color: #6366f1;
  color: white;
  border: none;
  padding: 10px 15px;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s ease;
}

#demo-btn:hover {
  background-color: #4f46e5;
  transform: scale(1.05);
}`;

const DEFAULT_JS = `// Add your JavaScript code here
document.getElementById('demo-btn').addEventListener('click', function() {
  alert('Button clicked!');
});`;

export interface CodeStore extends CodeState {
  setCode: (language: Language, code: string) => void;
  setActiveTab: (tab: Language) => void;
  getSrcDoc: () => string;
  resetCode: () => void;
}

export const useCodeStore = create<CodeStore>((set, get) => ({
  html: DEFAULT_HTML,
  css: DEFAULT_CSS,
  javascript: DEFAULT_JS,
  activeTab: 'html',
  
  setCode: (language, code) => set({ [language]: code }),
  setActiveTab: (tab) => set({ activeTab: tab }),
  
  getSrcDoc: () => {
    const { html, css, javascript } = get();
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <style>${css}</style>
        </head>
        <body>
          ${html}
          <script>${javascript}</script>
        </body>
      </html>
    `;
  },
  
  resetCode: () => set({
    html: DEFAULT_HTML,
    css: DEFAULT_CSS,
    javascript: DEFAULT_JS
  })
}));
