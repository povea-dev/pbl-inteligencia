// ========== AUTH & USERS ==========
export type UserRole = "teacher" | "student";

export interface AppUser {
  uid: string;
  email: string | null;
  role: UserRole;
  displayName?: string | null;
  firstName?: string;
  lastName?: string;
  hasSeenTutorial?: boolean; // Indica si el usuario ya vio el tutorial de bienvenida
}

// ========== COURSES ==========
export interface Course {
  id: string;
  title: string;
  description: string;
  teacherId: string;
  teacherName: string;
  createdAt: Date;
  status: 'active' | 'archived';
  maxPagesPerFile?: number; // Configuración de cuántas páginas leer por archivo PDF (default: 10)
}

export interface CourseFile {
  id: string;
  courseId: string;
  name: string;
  url: string;
  type: 'pdf' | 'docx' | 'txt' | 'other';
  size: number;
  uploadedAt: Date;
  uploadedBy: string;
  processed: boolean;
}

// ========== CONVERSATIONS ==========
export interface Conversation {
  id: string;
  courseId: string;
  userId: string;
  userRole: UserRole;
  title: string;
  createdAt: Date;
  lastMessageAt: Date;
  messageCount: number;
  status: 'active' | 'archived';
}

export interface SearchResult {
  conversation: Conversation;
  matches: {
    type: 'title' | 'message';
    content: string;
    snippet: string; // Fragmento destacado del contenido
  }[];
  relevanceScore: number; // Score de relevancia (0-1)
}

export interface Message {
  id: string;
  conversationId: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  tokens?: {
    prompt: number;
    completion: number;
    total: number;
  };
  sourcesUsed?: string[]; // IDs de archivos usados
}

// ========== ANALYTICS ==========
export interface DailyStats {
  date: string;
  totalMessages: number;
  activeStudents: number;
  avgResponseTime: number;
  topTopics: Array<{ topic: string; count: number }>;
}

export interface FrequentQuestion {
  id: string;
  question: string;
  count: number;
  lastAsked: Date;
  askedBy: string[];
}

export interface StudentActivity {
  studentId: string;
  studentEmail: string;
  totalMessages: number;
  conversationsCount: number;
  lastActivity: Date;
  topTopics: string[];
}



// ========== API TYPES ==========
export interface FeedbackRequest {
  conversationId: string;
  courseId: string;
  message: string;
  conversationHistory: Message[];
  idToken: string; // Firebase ID Token para auth
  courseFiles?: Array<{ name: string; type: string; url: string }>; // Archivos del curso con URLs para extraer contenido
  courseTitle?: string; // Título del curso
  maxPagesPerFile?: number; // Máximo de páginas a leer por archivo PDF
}

export interface FeedbackResponse {
  response: string;
  sourcesUsed?: string[];
  tokensUsed?: {
    prompt: number;
    completion: number;
    total: number;
    assessment?: {
      misuse_detected?: boolean;
      misuse_reason?: string;
      courseId?: string;
      conversationId?: string;
      studentMessage?: string;
    };
  };
}

// ========== LEGACY (mantener por compatibilidad) ==========
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