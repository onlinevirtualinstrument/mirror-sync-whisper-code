
export type Language = 'html' | 'css' | 'javascript';

export interface CodeState {
  html: string;
  css: string;
  javascript: string;
  activeTab: Language;
}
