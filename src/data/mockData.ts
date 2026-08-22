import type { Chatbot, RetrievalResult, LogEntry } from '../types';

export const mockChatbots: Chatbot[] = [
  {
    id: 'chatbot-1',
    name: 'Support Assistant',
    status: 'active',
    model: 'GPT-4o',
    docsCount: 24,
    conversationsCount: 1284,
    lastUpdated: '2h ago',
    welcomeMessage: 'Hi! How can I help you today?',
    themeColor: '#3525cd',
    avatar: 'support_agent',
    position: 'right',
    bubbleStyle: 'rounded',
  },
  {
    id: 'chatbot-2',
    name: 'Internal FAQ',
    status: 'processing',
    model: 'Claude 3.5',
    docsCount: 12,
    conversationsCount: 450,
    lastUpdated: '5h ago',
    welcomeMessage: 'Welcome to the internal FAQ assistant. Ask me anything about our company guidelines.',
    themeColor: '#10B981',
    avatar: 'quiz',
    position: 'right',
    bubbleStyle: 'rounded',
  },
  {
    id: 'chatbot-3',
    name: 'Sales Agent',
    status: 'inactive',
    model: 'GPT-3.5 Turbo',
    docsCount: 8,
    conversationsCount: 89,
    lastUpdated: '1d ago',
    welcomeMessage: 'Hello! Interested in our plans? I can guide you through our product offerings.',
    themeColor: '#F59E0B',
    avatar: 'shopping_bag',
    position: 'right',
    bubbleStyle: 'pill',
  }
];

export const mockRetrievalResults: Record<string, RetrievalResult[]> = {
  "How do I upgrade my plan?": [
    {
      rank: 1,
      score: 0.942,
      source: "Billing_Policy_v2.pdf",
      type: "pdf",
      preview: "To upgrade your plan, navigate to the Billing section in your workspace settings. Select 'Change Plan', choose your desired tier (Pro or Enterprise), and confirm the prorated charges..."
    },
    {
      rank: 2,
      score: 0.875,
      source: "FAQ_Account_Mgmt.md",
      type: "md",
      preview: "...can I change my subscription mid-cycle? Yes. If you decide to upgrade, the new features are available immediately. The cost difference will be added to your next invoice..."
    },
    {
      rank: 3,
      score: 0.712,
      source: "Pricing_Page_Scrape.html",
      type: "html",
      preview: "Our plans scale with your needs. The Starter plan is perfect for individuals, while the Pro plan offers advanced analytics and higher rate limits..."
    }
  ],
  "What is your refund policy?": [
    {
      rank: 1,
      score: 0.965,
      source: "refund-policy-2024.pdf",
      type: "pdf",
      preview: "We offer a 14-day money-back guarantee for all annual subscriptions. If you are not satisfied with our service, you can request a full refund within 14 days of purchase..."
    },
    {
      rank: 2,
      score: 0.824,
      source: "tos_annual_billing.md",
      type: "md",
      preview: "After 14 days of purchase, annual subscriptions are strictly non-refundable. However, you can cancel auto-renewal at any time to prevent billing for the next cycle..."
    }
  ],
  "How do I reset my password?": [
    {
      rank: 1,
      score: 0.912,
      source: "FAQ_Account_Mgmt.md",
      type: "md",
      preview: "To reset your password, click the 'Forgot Password' link on the login page. Enter your email address and we will send you a password reset link..."
    }
  ]
};

export const mockLogs: LogEntry[] = [
  {
    id: 'log-1',
    timestamp: '2026-08-11T20:50:12Z',
    query: 'How do I upgrade my plan?',
    response: 'To upgrade your plan, navigate to the Billing section in your workspace settings. Select \'Change Plan\', choose your desired tier (Pro or Enterprise), and confirm the prorated charges.',
    latency: 1.2,
    tokens: { in: 142, out: 185 },
    status: 'success',
    model: 'GPT-4o'
  },
  {
    id: 'log-2',
    timestamp: '2026-08-11T20:48:34Z',
    query: 'What is the refund policy?',
    response: 'You can request a full refund for annual subscriptions within 14 days of purchase. After 14 days, subscriptions are non-refundable but you can cancel auto-renewal.',
    latency: 1.1,
    tokens: { in: 110, out: 95 },
    status: 'success',
    model: 'GPT-4o'
  },
  {
    id: 'log-3',
    timestamp: '2026-08-11T20:45:01Z',
    query: 'How to delete database connector?',
    response: 'Error: Connection timeout. DB connector service did not respond.',
    latency: 4.5,
    tokens: { in: 85, out: 12 },
    status: 'error',
    model: 'Claude 3.5'
  }
];

export interface MockDoc {
  name: string;
  type: 'pdf' | 'md' | 'html';
  size: string;
  status: 'indexed' | 'indexing' | 'failed';
  uploadedAt: string;
  chunksCount: number;
}

export const mockDocuments: MockDoc[] = [
  {
    name: 'Billing_Policy_v2.pdf',
    type: 'pdf',
    size: '1.2 MB',
    status: 'indexed',
    uploadedAt: '2 days ago',
    chunksCount: 42
  },
  {
    name: 'FAQ_Account_Mgmt.md',
    type: 'md',
    size: '34 KB',
    status: 'indexed',
    uploadedAt: '3 days ago',
    chunksCount: 15
  },
  {
    name: 'Pricing_Page_Scrape.html',
    type: 'html',
    size: '128 KB',
    status: 'indexed',
    uploadedAt: '5 days ago',
    chunksCount: 22
  },
  {
    name: 'API_References_internal.pdf',
    type: 'pdf',
    size: '4.8 MB',
    status: 'indexing',
    uploadedAt: 'Just now',
    chunksCount: 0
  },
  {
    name: 'deprecated_tos_v1.html',
    type: 'html',
    size: '80 KB',
    status: 'failed',
    uploadedAt: '1 week ago',
    chunksCount: 0
  }
];

export const mockTestPrompts = [
  "How do I upgrade my plan?",
  "What is your refund policy?",
  "How do I reset my password?"
];
