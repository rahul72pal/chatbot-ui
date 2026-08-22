import { useState, useCallback } from 'react';
import { messageApi } from '../api';
import type { Message, Source } from '../types';
import { mockRetrievalResults } from '../data/mockData';

interface UseChatStreamOptions {
  chatbotId?: string;
  interactive?: boolean;
  onQueryExecuted?: (query: string, results: any) => void;
}

export function useChatStream({ chatbotId, interactive = true, onQueryExecuted }: UseChatStreamOptions = {}) {
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [streamStatus, setStreamStatus] = useState<string | null>(null);
  const [activeTool, setActiveTool] = useState<string | null>(null);
  const [isStreaming, setIsStreaming] = useState<boolean>(false);

  const resetStreamState = useCallback(() => {
    setConversationId(null);
    setStreamStatus(null);
    setActiveTool(null);
    setIsStreaming(false);
  }, []);

  const sendStreamMessage = useCallback(
    async (
      query: string,
      setMessages: React.Dispatch<React.SetStateAction<Message[]>>
    ) => {
      if (!query.trim() || isStreaming || !interactive) return;

      const isRealChatbot =
        chatbotId &&
        chatbotId !== 'chatbot-1' &&
        chatbotId !== 'chatbot-2' &&
        chatbotId !== 'chatbot-3' &&
        chatbotId !== 'new';

      if (isRealChatbot) {
        setIsStreaming(true);
        setStreamStatus('Thinking...');
        setActiveTool(null);

        const aiMsgId = `msg-${Date.now()}-ai`;
        const initialAiMsg: Message = {
          id: aiMsgId,
          sender: 'assistant',
          content: '',
          timestamp: 'Just now'
        };
        setMessages(prev => [...prev, initialAiMsg]);

        const startTime = Date.now();

        try {
          await messageApi.sendMessageStream(
            {
              message: query,
              conversation_id: conversationId,
              chatbot_id: chatbotId
            },
            (event: any) => {
              if (event.type === 'conversation' && event.conversation_id) {
                setConversationId(event.conversation_id);
              } else if (event.type === 'status') {
                setStreamStatus(event.message || 'Thinking...');
                setActiveTool(event.tool || null);
              } else if (event.type === 'reasoning_delta') {
                setStreamStatus('Thinking...');
                setActiveTool(null);
              } else if (event.type === 'text_delta' && event.delta) {
                setMessages(prev =>
                  prev.map(m => (m.id === aiMsgId ? { ...m, content: m.content + event.delta } : m))
                );
              } else if (event.type === 'done') {
                const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
                setStreamStatus(null);
                setActiveTool(null);
                setIsStreaming(false);

                const promptToks = event.usage?.prompt_tokens || Math.max(12, Math.floor(query.length / 4));
                const completionToks =
                  event.usage?.completion_tokens || Math.max(5, Math.floor((event.message || '').length / 4));

                setMessages(prev =>
                  prev.map(m =>
                    m.id === aiMsgId
                      ? {
                          ...m,
                          content: m.content || event.message || '',
                          latency: parseFloat(elapsed),
                          tokens: {
                            in: promptToks,
                            out: completionToks
                          }
                        }
                      : m
                  )
                );
              } else if (event.type === 'error') {
                setStreamStatus(null);
                setActiveTool(null);
                setIsStreaming(false);
                setMessages(prev =>
                  prev.map(m =>
                    m.id === aiMsgId
                      ? { ...m, content: `Server issue: Please contact the chatbot owner.` }
                      : m
                  )
                );
              }
            }
          );
        } catch (err) {
          setStreamStatus(null);
          setActiveTool(null);
          setIsStreaming(false);
          setMessages(prev =>
            prev.map(m =>
              m.id === aiMsgId
                ? { ...m, content: `Server issue: Please contact the chatbot owner.` }
                : m
            )
          );
        }
      } else {
        // Mock latency & RAG retrieval fallback
        setTimeout(() => {
          let responseText =
            "I don't have that information in my knowledge base. Please configure your documents and try again.";
          let sources: Source[] = [];
          let latency = 0.8;
          let tokenIn = 95;
          let tokenOut = 120;

          const trimmedQuery = query.trim().toLowerCase();
          let matchedKey = '';
          if (trimmedQuery.includes('upgrade') || trimmedQuery.includes('plan')) {
            matchedKey = 'How do I upgrade my plan?';
          } else if (trimmedQuery.includes('refund') || trimmedQuery.includes('policy')) {
            matchedKey = 'What is your refund policy?';
          } else if (trimmedQuery.includes('password') || trimmedQuery.includes('reset')) {
            matchedKey = 'How do I reset my password?';
          }

          if (matchedKey && mockRetrievalResults[matchedKey]) {
            const results = mockRetrievalResults[matchedKey];
            if (matchedKey === 'How do I upgrade my plan?') {
              responseText =
                "Based on our current documentation, to upgrade your plan, navigate to the Billing section in your workspace settings. Select 'Change Plan', choose your desired tier (Pro or Enterprise), and confirm the prorated charges.";
              sources = [
                { title: 'Billing_Policy_v2.pdf', type: 'pdf', page: 2, score: 0.94 },
                { title: 'FAQ_Account_Mgmt.md', type: 'md', score: 0.87 },
                { title: 'Pricing_Page_Scrape.html', type: 'html', score: 0.71 }
              ];
              latency = 1.2;
              tokenIn = 142;
              tokenOut = 185;
            } else if (matchedKey === 'What is your refund policy?') {
              responseText =
                'Based on our current documentation, the refund policy for annual subscriptions is as follows:\n\n• Within 14 days: You are eligible for a full refund if requested within the first 14 days of purchase.\n• After 14 days: Annual subscriptions are non-refundable. You can cancel auto-renewal to avoid future billing.\n\nPlease note that setup fees for enterprise tiers are generally non-refundable unless specified otherwise in your contract.';
              sources = [
                { title: 'refund-policy-2024.pdf', type: 'pdf', page: 2, score: 0.96 },
                { title: 'tos_annual_billing.md', type: 'md', score: 0.82 }
              ];
              latency = 1.0;
              tokenIn = 128;
              tokenOut = 140;
            } else if (matchedKey === 'How do I reset my password?') {
              responseText =
                "To reset your password, visit the login page and click 'Forgot password?'. Enter your registered email address and we will immediately send you a secure password reset link.";
              sources = [{ title: 'FAQ_Account_Mgmt.md', type: 'md', score: 0.91 }];
              latency = 0.9;
              tokenIn = 110;
              tokenOut = 95;
            }

            if (onQueryExecuted) {
              onQueryExecuted(query, results);
            }
          }

          const assistantMessage: Message = {
            id: `msg-${Date.now()}-assistant`,
            sender: 'assistant',
            content: responseText,
            timestamp: 'Just now',
            sources,
            latency,
            tokens: { in: tokenIn, out: tokenOut }
          };

          setMessages(prev => [...prev, assistantMessage]);
        }, 1000);
      }
    },
    [chatbotId, conversationId, interactive, isStreaming, onQueryExecuted]
  );

  return {
    conversationId,
    streamStatus,
    activeTool,
    isStreaming,
    sendStreamMessage,
    resetStreamState
  };
}

export default useChatStream;
