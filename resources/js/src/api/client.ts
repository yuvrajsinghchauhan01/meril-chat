// Custom error class for API errors
class ApiError extends Error {
  response?: { data: any };
  constructor(message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  pagination?: any;
  errors?: any;
}

// User type definition
export interface ApiUser {
  id: number;
  name: string;
  email: string;
  created_at: string;
  updated_at: string;
}

const API_BASE = import.meta.env.VITE_API_BASE_URL as string | undefined;

function buildUrl(path: string) {
  // If an absolute base URL is provided (e.g., for production), prefix it.
  if (API_BASE) {
    const base = API_BASE.replace(/\/$/, '');
    return `${base}${path}`;
  }
  // In dev, Vite proxy will handle "/api".
  return path;
}

export async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const headers: Record<string, string> = {
    Accept: 'application/json',
  };

  // Only set Content-Type for non-FormData bodies
  const isForm = init?.body instanceof FormData;
  if (init?.body && !isForm) headers['Content-Type'] = 'application/json';

  // Add CSRF token from meta tag
  const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
  if (csrfToken) {
    headers['X-CSRF-TOKEN'] = csrfToken;
  }

  // Add Bearer token if available
  const token = localStorage.getItem('auth_token');
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(buildUrl(path), {
    credentials: 'include',
    ...init,
    headers: {
      ...headers,
      ...(init?.headers || {}),
    },
  });

  const text = await res.text();
  let json: any = null;
  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    // non-JSON response
  }

  if (!res.ok) {
    let errorMessage = '';
    if (res.status === 401) {
      errorMessage = 'Not authenticated';
    } else if (res.status === 422 && json?.errors) {
      // Laravel validation error format
      errorMessage = Object.values(json.errors).flat().join('\n');
    } else {
      errorMessage = (json && (json.message || json.error)) || res.statusText || `Request failed with status ${res.status}`;
    }
    const error = new ApiError(errorMessage);
    if (json) {
      error.response = { data: json };
    }
    throw error;
  }

  // For successful responses, require JSON if body is non-empty.
  if (text && json === null) {
    throw new Error('Non-JSON response from server');
  }

  return (json as T);
}

// ---- Projects ----
export interface ApiProject {
  id: number;
  name: string;
  description?: string | null;
  created_at: string;
  updated_at: string;
}

export const ProjectsAPI = {
  async list(): Promise<ApiProject[]> {
    const res = await apiFetch<ApiResponse<ApiProject[]>>('/api/projects');
    return res.data;
  },
  async create(payload: { name: string; description?: string }) {
    const res = await apiFetch<ApiResponse<ApiProject>>('/api/projects', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    return res.data;
  },
  async update(id: number | string, payload: { name?: string; description?: string; is_archived?: boolean }) {
    const res = await apiFetch<ApiResponse<ApiProject>>(`/api/projects/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
    return res.data;
  },
  async delete(id: number | string) {
    await apiFetch<ApiResponse<unknown>>(`/api/projects/${id}`, { method: 'DELETE' });
  },
  async addConversations(projectId: number | string, conversationIds: number[]) {
    const res = await apiFetch<{ success: boolean; message: string; count: number }>(`/api/projects/${projectId}/conversations/add`, {
      method: 'POST',
      body: JSON.stringify({ conversation_ids: conversationIds }),
    });
    return res;
  },
};

// ---- System ----
export const SystemAPI = {
  async test() {
    return apiFetch<{ message: string }>("/api/test");
  },
};

// ---- Chat ----
export interface ChatRequest {
  model: string;
  message: string;
  project_id?: number;
  conversation_id?: number | string;
  messages?: Array<{
    role: 'user' | 'assistant' | 'system';
    content: string;
  }>;
  temperature?: number;
  max_tokens?: number;
  system_prompt?: string;
  enable_web_search?: boolean;
  search_query?: string;
}

export interface ChatMessage {
  id: number;
  role: 'assistant' | 'user' | 'system';
  content: string;
  created_at: string;
}

export interface ChatResponseData {
  conversation_id: number;
  message: ChatMessage;
  model?: string;
}

// ---- Search ----
export interface SearchRequest {
  query: string;
  type?: 'conversations' | 'messages' | 'web' | 'all';
  limit?: number;
}

export interface SearchResult {
  id: string;
  type: 'conversation' | 'message' | 'web';
  title: string;
  content: string;
  snippet: string;
  url?: string;
  created_at?: string;
  conversation_id?: number;
  relevance_score?: number;
}

export interface SearchResponse {
  results: SearchResult[];
  total: number;
  query: string;
  search_time_ms: number;
}

export const SearchAPI = {
  async search(req: SearchRequest): Promise<SearchResponse> {
    const res = await apiFetch<ApiResponse<SearchResponse>>('/api/search', {
      method: 'POST',
      body: JSON.stringify(req),
    });
    return res.data;
  },
  
  async webSearch(query: string): Promise<SearchResponse> {
    const res = await apiFetch<ApiResponse<SearchResponse>>('/api/search/web', {
      method: 'POST',
      body: JSON.stringify({ query }),
    });
    return res.data;
  },
};

export const ChatAPI = {
  async send(req: ChatRequest) {
    const payload: any = {
      model: req.model,
      message: req.message,
    };
    
    if (req.project_id) {
      payload.project_id = req.project_id;
    }
    
    if (req.conversation_id) {
      payload.conversation_id = req.conversation_id;
    }

    if (req.temperature !== undefined) {
      payload.temperature = req.temperature;
    }

    if (req.max_tokens !== undefined) {
      payload.max_tokens = req.max_tokens;
    }

    if (req.system_prompt) {
      payload.system_prompt = req.system_prompt;
    }
    
    if (req.enable_web_search) {
      payload.enable_web_search = req.enable_web_search;
    }
    
    if (req.search_query) {
      payload.search_query = req.search_query;
    }

    const res = await fetch(buildUrl('/api/chat'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const text = await res.text();
    let json;
    
    try {
      json = text ? JSON.parse(text) : null;
    } catch (e) {
      // If response is not JSON, handle it as text
    }

    if (!res.ok) {
      const msg = (json && (json.message || json.error)) || text || res.statusText || 'Request failed';
      throw new Error(msg);
    }

    if (!text) {
      throw new Error(`Empty response body (status ${res.status})`);
    }

    if (json) {
      let data: any = json.data ?? json;
      if (typeof data === 'string') {
        try { 
          data = JSON.parse(data); 
        } catch (e) {
          throw new Error('Invalid JSON response from server');
        }
      }
      if (data && data.conversation_id && data.message) {
        return data as ChatResponseData;
      }
      throw new Error('Unexpected JSON response format from server');
    }

    // Non-JSON successful response: surface first 200 chars for debugging
    throw new Error(`Non-JSON response: ${String(text).slice(0, 200)}`);
  },
  /**
   * Stream chat completions from the server using `/api/chat/stream`.
   * Supports both SSE (text/event-stream) and raw text streams.
   * onToken is called with incremental text; onMeta receives any parsed JSON events.
   */
  async sendStream(
    req: ChatRequest,
    onToken: (token: string) => void,
    onMeta?: (meta: any) => void,
    options?: { signal?: AbortSignal }
  ): Promise<Partial<ChatResponseData>> {
    const payload: any = {
      model: req.model,
      message: req.message,
    };
  
    if (req.project_id) payload.project_id = req.project_id;
    if (req.conversation_id) payload.conversation_id = req.conversation_id;
    if (req.temperature !== undefined) payload.temperature = req.temperature;
    if (req.max_tokens !== undefined) payload.max_tokens = req.max_tokens;
    if (req.system_prompt) payload.system_prompt = req.system_prompt;
  
    // Build headers with authentication
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Accept': 'text/event-stream, text/plain, application/json',
      'Cache-Control': 'no-cache',
    };
    
    // Add CSRF token from meta tag
    const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
    if (csrfToken) {
      headers['X-CSRF-TOKEN'] = csrfToken;
    }
    
    // Add Bearer token if available
    const token = localStorage.getItem('auth_token');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    const res = await fetch(buildUrl('/api/chat/stream'), {
      method: 'POST',
      credentials: 'include',
      headers,
      body: JSON.stringify(payload),
      signal: options?.signal,
    });
  
    if (!res.ok || !res.body) {
      const msg = (await res.text().catch(() => '')) || res.statusText || 'Stream request failed';
      throw new Error(msg);
    }
  
    const contentType = res.headers.get('content-type') || '';
    const reader = res.body.getReader();
    const decoder = new TextDecoder('utf-8');
    let finalMeta: Partial<ChatResponseData> = {};
    let buffer = '';
  
    const emitImmediate = (textChunk: string) => {
      if (!textChunk) return;
      onToken(textChunk);
    };
  
    const processJSONChunk = (jsonStr: string) => {
      try {
        const json = JSON.parse(jsonStr);
        onMeta?.(json);
        
        // Extract content from various possible structures
        const content = 
          json.choices?.[0]?.delta?.content ?? 
          json.delta?.content ?? 
          json.content ?? 
          json.token ?? 
          '';
        
        if (content) {
          emitImmediate(String(content));
        }
        
        // Capture conversation_id if present
        if (json.conversation_id && !finalMeta.conversation_id) {
          finalMeta.conversation_id = json.conversation_id;
        }
        
        // Check for done signal
        if (json.choices?.[0]?.finish_reason || json.done) {
          return 'DONE';
        }
      } catch (e) {
        // If not valid JSON, ignore or emit as text
        console.warn('Failed to parse JSON chunk:', jsonStr);
      }
      return undefined;
    };
  
    const processSSEBlock = (block: string) => {
      const lines = block.split(/\n/);
      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed) continue;
        if (trimmed.startsWith('data:')) {
          const dataStr = trimmed.slice(5).trim();
          if (dataStr === '[DONE]') {
            return 'DONE';
          }
          return processJSONChunk(dataStr);
        }
      }
      return undefined;
    };
  
    if (contentType.includes('text/event-stream')) {
      // SSE format: data: {...}\n\n
      let sseBuffer = '';
      for (;;) {
        const { value, done } = await reader.read();
        if (done) break;
        sseBuffer += decoder.decode(value, { stream: true });
        const blocks = sseBuffer.split(/\n\n/);
        sseBuffer = blocks.pop() ?? '';
        for (const block of blocks) {
          const result = processSSEBlock(block);
          if (result === 'DONE') {
            try { await reader.cancel(); } catch {}
            sseBuffer = '';
            break;
          }
        }
      }
      if (sseBuffer) processSSEBlock(sseBuffer);
    } else {
      // Raw JSON streaming (newline-delimited JSON)
      for (;;) {
        const { value, done } = await reader.read();
        if (done) break;
        
        buffer += decoder.decode(value, { stream: true });
        
        // Split by newlines to get individual JSON objects
        const lines = buffer.split('\n');
        buffer = lines.pop() ?? ''; // Keep incomplete line in buffer
        
        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed) continue;
          
          const result = processJSONChunk(trimmed);
          if (result === 'DONE') {
            try { await reader.cancel(); } catch {}
            buffer = '';
            break;
          }
        }
      }
      
      // Process any remaining data in buffer
      if (buffer.trim()) {
        processJSONChunk(buffer.trim());
      }
    }
  
    return finalMeta;
  },
};

// ---- Conversations ----
export interface ApiConversation {
  id: number;
  title?: string | null;
  model_id?: string | null;
  created_at: string;
  updated_at: string;
  last_message_at?: string | null;
  messages?: ApiMessage[];
}

export interface ApiMessage {
  id: number;
  conversation_id: number;
  role: 'assistant' | 'user' | 'system';
  content: string;
  created_at: string;
}

export const ConversationsAPI = {
  async list(): Promise<ApiConversation[]> {
    const res = await apiFetch<ApiResponse<any>>('/api/conversations');
    let data: any = res.data;
    if (typeof data === 'string') {
      try { data = JSON.parse(data); } catch {}
    }
    return data as ApiConversation[];
  },
  async get(id: number | string): Promise<ApiConversation> {
    const res = await apiFetch<ApiResponse<any>>(`/api/conversations/${id}`);
    let data: any = res.data;
    if (typeof data === 'string') {
      try { data = JSON.parse(data); } catch {}
    }
    return data as ApiConversation;
  },
  async update(id: number | string, payload: { title?: string; model_id?: string | null; settings?: any }): Promise<ApiConversation> {
    const res = await apiFetch<ApiResponse<any>>(`/api/conversations/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
    let data: any = res.data;
    if (typeof data === 'string') {
      try { data = JSON.parse(data); } catch {}
    }
    return data as ApiConversation;
  },
  async delete(id: number | string): Promise<void> {
    await apiFetch<ApiResponse<unknown>>(`/api/conversations/${id}`, { method: 'DELETE' });
  },
};

// ---- Messages ----
export const MessagesAPI = {
  async edit(id: number | string, content: string): Promise<ApiMessage> {
    const res = await apiFetch<ApiResponse<ApiMessage>>(`/api/messages/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ content }),
    });
    return res.data;
  },
  async delete(id: number | string): Promise<void> {
    await apiFetch<ApiResponse<unknown>>(`/api/messages/${id}`, { method: 'DELETE' });
  },
  async regenerate(id: number | string): Promise<{ message: ApiMessage; usage?: any; model?: string }> {
    const res = await apiFetch<ApiResponse<{ message: ApiMessage; usage?: any; model?: string }>>(`/api/messages/${id}/regenerate`, {
      method: 'POST',
    });
    return res.data;
  },
  async editAndContinue(id: number | string, content: string): Promise<{ edited_message: ApiMessage; new_message: ApiMessage; usage?: any; model?: string }> {
    const res = await apiFetch<ApiResponse<{ edited_message: ApiMessage; new_message: ApiMessage; usage?: any; model?: string }>>(`/api/messages/${id}/edit-and-continue`, {
      method: 'POST',
      body: JSON.stringify({ content }),
    });
    return res.data;
  },
};

  // ---- Auth & User ----
export const AuthAPI = {
  async login(email: string, password: string) {
    // First get CSRF token
    try {
      await apiFetch('/sanctum/csrf-cookie', { method: 'GET' });
    } catch (error) {
      console.warn('Failed to fetch CSRF token:', error);
    }

    const res = await apiFetch<{
      success: boolean;
      message: string;
      user: ApiUser;
      token: string;
    }>('/api/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });
    console.log('Login response:', res);
    
    // Store the token in localStorage
    if (res.token) {
      localStorage.setItem('auth_token', res.token);
      console.log('Token stored in localStorage');
    }
    
    return { user: res.user };
  },

  async register(name: string, email: string, password: string, password_confirmation: string) {
    // First get CSRF token
    try {
      await apiFetch('/sanctum/csrf-cookie', { method: 'GET' });
    } catch (error) {
      console.warn('Failed to fetch CSRF token:', error);
    }

    const res = await apiFetch<{
      success: boolean;
      message: string;
      user: ApiUser;
      token: string;
    }>('/api/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password, password_confirmation }),
    });
    
    // Store the token in localStorage
    if (res.token) {
      localStorage.setItem('auth_token', res.token);
      console.log('Token stored in localStorage after registration');
    }
    
    return { user: res.user };
  },

  async logout() {
    try {
      await apiFetch<ApiResponse<void>>('/api/logout', {
        method: 'POST',
      });
    } finally {
      // Always clear the token from localStorage, even if the request fails
      localStorage.removeItem('auth_token');
      console.log('Token removed from localStorage');
    }
  },
  
  async getUser() {
    const res = await apiFetch<{
      success: boolean;
      user: ApiUser;
    }>('/api/user');
    return { user: res.user };
  },
};

// ---- Models ----
export interface ApiModelItem {
  id?: number; // local table id
  model_id: string; // external id
  name: string;
  provider?: string;
  context_length?: number;
}

export const ModelsAPI = {
  async list(): Promise<ApiModelItem[]> {
    const res = await apiFetch<ApiResponse<any[]>>('/api/models');
    // Controller returns array of full rows; normalize to a light shape
    return (res.data || []).map((m: any) => ({
      id: m.id,
      model_id: m.model_id,
      name: m.name ?? m.model_id,
      provider: m.provider,
      context_length: m.context_length,
    }));
  },
  async listPaginated(params?: { page?: number; per_page?: number; search?: string; category?: string; provider?: string; sort_by?: string; sort_order?: 'asc' | 'desc' }) {
    const query = new URLSearchParams();
    if (params?.page) query.set('page', String(params.page));
    if (params?.per_page) query.set('per_page', String(params.per_page));
    if (params?.search) query.set('search', params.search);
    if (params?.category) query.set('category', params.category);
    if (params?.provider) query.set('provider', params.provider);
    if (params?.sort_by) query.set('sort_by', params.sort_by);
    if (params?.sort_order) query.set('sort_order', params.sort_order);

    const path = `/api/models${query.toString() ? `?${query.toString()}` : ''}`;
    const res = await apiFetch<ApiResponse<any[]>>(
      path
    );

    const items: ApiModelItem[] = (res.data || []).map((m: any) => ({
      id: m.id,
      model_id: m.model_id,
      name: m.name ?? m.model_id,
      provider: m.provider,
      context_length: m.context_length,
    }));

    const pagination = res.pagination ?? {};
    return {
      items,
      pagination: {
        current_page: Number(pagination.current_page ?? 1),
        per_page: Number(pagination.per_page ?? items.length),
        total: Number(pagination.total ?? items.length),
        last_page: Number(pagination.last_page ?? 1),
        from: pagination.from ?? 1,
        to: pagination.to ?? items.length,
      },
    };
  },
  async sync(): Promise<{ success: boolean; message?: string }> {
    const res = await apiFetch<{ success: boolean; message?: string }>(
      '/api/models/sync',
      { method: 'POST' }
    );
    return res;
  },
};
