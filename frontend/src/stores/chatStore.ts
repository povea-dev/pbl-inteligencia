import { create } from 'zustand';
import { Message, Problem, ChatSession } from '../types';

interface ChatStore {
  messages: Message[];
  currentProblem: Problem | null;
  currentSession: ChatSession | null;
  isLoading: boolean;
  error: string | null;
  
  addMessage: (message: Omit<Message, 'id' | 'timestamp'>) => void;
  setMessages: (messages: Message[]) => void;
  setCurrentProblem: (problem: Problem | null) => void;
  setCurrentSession: (session: ChatSession | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearChat: () => void;
}

export const useChatStore = create<ChatStore>((set) => ({
  messages: [],
  currentProblem: null,
  currentSession: null,
  isLoading: false,
  error: null,
  
  addMessage: (message) => set((state) => ({
    messages: [...state.messages, {
      ...message,
      id: crypto.randomUUID(),
      timestamp: new Date()
    }]
  })),
  
  setMessages: (messages) => set({ messages }),
  
  setCurrentProblem: (problem) => set({ currentProblem: problem }),
  
  setCurrentSession: (session) => set({ currentSession: session }),
  
  setLoading: (loading) => set({ isLoading: loading }),
  
  setError: (error) => set({ error }),
  
  clearChat: () => set({ 
    messages: [], 
    currentProblem: null,
    currentSession: null,
    error: null
  })
}));