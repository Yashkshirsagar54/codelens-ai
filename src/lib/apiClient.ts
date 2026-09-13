/**
 * apiClient.ts — Typed fetch client for the CodeLens AI backend
 */

const API_BASE = import.meta.env.VITE_API_BASE_URL || '';

export type AnalysisMode = 'general' | 'security' | 'performance' | 'refactor' | 'testgen';

export interface CodeMetrics {
  cyclomaticComplexity: number;
  maintainabilityIndex: number;
  cognitiveLoad: number;
  linesOfCode: number;
  commentRatio: number;
  securityScore: number;
  performanceScore: number;
}

export interface AnalyzeCodeRequest {
  code: string;
  language?: string;
  mode?: AnalysisMode;
}

export interface CodeIssue {
  severity: 'high' | 'medium' | 'low';
  line: number | null;
  title: string;
  description: string;
  suggestion: string;
}

export interface AnalysisRecord {
  id: string;
  userId: string;
  code: string;
  language: string;
  mode?: AnalysisMode;
  overallScore: number;
  summary: string;
  issues: CodeIssue[];
  strengths: string[];
  refactoredCode?: string;
  generatedTests?: string;
  metrics?: CodeMetrics;
  createdAt: string;
}

export interface AnalyzeCodeResponse {
  success: boolean;
  analysis: AnalysisRecord;
  usage: {
    remaining: number;
    limit: number;
  };
}

export interface HistoryResponse {
  success: boolean;
  data: AnalysisRecord[];
  pagination: {
    page: number;
    limit: number;
    totalItems: number;
    totalPages: number;
  };
  usage: {
    remaining: number;
    limit: number;
  };
}

export interface ChatMessageItem {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface ChatApiResponse {
  success: boolean;
  message: ChatMessageItem;
}

/** Makes an authenticated POST to /api/analyze-code */
export async function analyzeCode(
  request: AnalyzeCodeRequest,
  getToken: () => Promise<string | null>
): Promise<AnalyzeCodeResponse> {
  const token = await getToken();

  const response = await fetch(`${API_BASE}/api/analyze-code`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({ message: response.statusText }));
    throw new Error(errorBody.message || `API error: ${response.status}`);
  }

  return response.json();
}

/** Sends a message to the AI Chatbot Assistant (/api/chat) */
export async function sendChatMessage(
  messages: ChatMessageItem[],
  codeContext?: string,
  language?: string,
  getToken?: () => Promise<string | null>
): Promise<ChatApiResponse> {
  const token = getToken ? await getToken() : null;

  const response = await fetch(`${API_BASE}/api/chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ messages, codeContext, language }),
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({ message: response.statusText }));
    throw new Error(errorBody.message || `Chat API error: ${response.status}`);
  }

  return response.json();
}

/** Explains code using Gemini AI (/api/tools/explain) */
export async function explainCode(
  code: string,
  language?: string,
  getToken?: () => Promise<string | null>
): Promise<{ success: boolean; explanation: string }> {
  const token = getToken ? await getToken() : null;

  const response = await fetch(`${API_BASE}/api/tools/explain`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ code, language }),
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({ message: response.statusText }));
    throw new Error(errorBody.message || `Tools API error: ${response.status}`);
  }

  return response.json();
}

/** Translates code between languages (/api/tools/translate) */
export async function translateCode(
  code: string,
  fromLanguage: string,
  toLanguage: string,
  getToken?: () => Promise<string | null>
): Promise<{ success: boolean; translatedCode: string }> {
  const token = getToken ? await getToken() : null;

  const response = await fetch(`${API_BASE}/api/tools/translate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ code, fromLanguage, toLanguage }),
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({ message: response.statusText }));
    throw new Error(errorBody.message || `Tools API error: ${response.status}`);
  }

  return response.json();
}

/** Generates docstrings/JSDoc for code (/api/tools/docgen) */
export async function generateDocs(
  code: string,
  language?: string,
  getToken?: () => Promise<string | null>
): Promise<{ success: boolean; documentedCode: string }> {
  const token = getToken ? await getToken() : null;

  const response = await fetch(`${API_BASE}/api/tools/docgen`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ code, language }),
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({ message: response.statusText }));
    throw new Error(errorBody.message || `Tools API error: ${response.status}`);
  }

  return response.json();
}

/** Fetches analysis history for the current user */
export async function getAnalysisHistory(
  getToken: () => Promise<string | null>
): Promise<HistoryResponse> {
  const token = await getToken();

  const response = await fetch(`${API_BASE}/api/history`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({ message: response.statusText }));
    throw new Error(errorBody.message || `API error: ${response.status}`);
  }

  return response.json();
}

/** Deletes an analysis record by ID */
export async function deleteAnalysis(
  id: string,
  getToken: () => Promise<string | null>
): Promise<{ success: boolean }> {
  const token = await getToken();

  const response = await fetch(`${API_BASE}/api/history/${id}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({ message: response.statusText }));
    throw new Error(errorBody.message || `API error: ${response.status}`);
  }

  return response.json();
}
