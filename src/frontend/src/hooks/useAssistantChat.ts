import { useState, useEffect } from 'react';
import { processMessage, SessionState, QuickAction } from '@/utils/plushieAssistant';

export interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const STORAGE_KEY = 'plushie-assistant-chat';
const SESSION_KEY = 'plushie-assistant-session';

export function useAssistantChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [sessionState, setSessionState] = useState<SessionState>({ mode: 'idle' });

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      const storedSession = localStorage.getItem(SESSION_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          setMessages(parsed);
        }
      }
      if (storedSession) {
        const parsedSession = JSON.parse(storedSession);
        setSessionState(parsedSession);
      }
    } catch (error) {
      console.error('Failed to load chat history:', error);
    }
  }, []);

  // Save to localStorage whenever messages or session change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
      localStorage.setItem(SESSION_KEY, JSON.stringify(sessionState));
    } catch (error) {
      console.error('Failed to save chat history:', error);
    }
  }, [messages, sessionState]);

  const sendMessage = (userMessage: string) => {
    const userMsg: Message = { role: 'user', content: userMessage };
    
    // Process message through assistant logic
    const { response, newSessionState } = processMessage(userMessage, sessionState);
    
    const assistantMsg: Message = { role: 'assistant', content: response };
    
    setMessages((prev) => [...prev, userMsg, assistantMsg]);
    setSessionState(newSessionState);
  };

  const clearHistory = () => {
    setMessages([]);
    setSessionState({ mode: 'idle' });
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(SESSION_KEY);
  };

  const quickActions: QuickAction[] = [
    { label: '🧸 Care tips', prompt: 'How do I care for my plushies?' },
    { label: '✨ Recommend a plushie', prompt: 'Can you recommend a plushie for me?' },
    { label: '📖 Tell me a story', prompt: 'Tell me a plushie story' },
    { label: '💭 Fun facts', prompt: 'Tell me some fun plushie facts' },
  ];

  return {
    messages,
    input,
    setInput,
    sendMessage,
    clearHistory,
    sessionState,
    quickActions,
  };
}
