export interface Source {
  title: string;
  type: 'pdf' | 'md' | 'html';
  page?: number;
  snippet?: string;
  score?: number;
}

export interface Message {
  id: string;
  sender: 'user' | 'assistant';
  content: string;
  timestamp: string;
  sources?: Source[];
  tokens?: {
    in: number;
    out: number;
  };
  latency?: number;
}

export interface Chatbot {
  id: string;
  name: string;
  status: 'active' | 'processing' | 'inactive';
  model: string;
  docsCount: number;
  conversationsCount: number;
  lastUpdated: string;
  welcomeMessage: string;
  themeColor: string;
  avatar: string; // 'smart_toy' or path
  position: 'right' | 'left';
  bubbleStyle: 'pill' | 'square' | 'rounded';
}

export interface RetrievalResult {
  rank: number;
  score: number;
  source: string;
  type: 'pdf' | 'md' | 'html';
  preview: string;
}

export interface LogEntry {
  id: string;
  timestamp: string;
  query: string;
  response: string;
  latency: number; // in seconds
  tokens: {
    in: number;
    out: number;
  };
  status: 'success' | 'error';
  model: string;
}
