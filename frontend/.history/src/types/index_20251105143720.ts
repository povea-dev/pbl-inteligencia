export interface Message {
  id: string;
  sessionId: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  metadata?: {
    tokens?: {
      prompt: number;
      completion: number;
      total: number;
    };
  };
}

export interface Problem {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty: 'facil' | 'medio' | 'dificil';
  learningObjectives: string[];
  rubric?: {
    [key: string]: string;
  };
}

export interface ChatSession {
  id: string;
  studentId: string;
  problemId: string;
  startedAt: Date;
  lastActivityAt: Date;
  status: 'active' | 'completed' | 'abandoned';
  metadata?: Record<string, any>;
}

export interface FeedbackRequest {
  sessionId: string;
  problemId: string;
  studentResponse: string;
  conversationHistory: Message[];
}

export interface FeedbackResponse {
  feedback: string;
  suggestions?: string[];
  nextQuestion?: string;
  assessment?: {
    score: number;
    strengths: string[];
    areasToImprove: string[];
  };
}

export type UserRole = "teacher" | "student";

export type AppUser = {
  uid: string;
  email: string | null;
  role: UserRole;
  displayName?: string | null;
};

export type Course = {
  id: string;
  name: string;
  description?: string;
  teacherId: string;
};

export type ChatMessage = {
  id?: string;
  role: "user" | "assistant" | "system";
  content: string;
  createdAt?: number;
};
