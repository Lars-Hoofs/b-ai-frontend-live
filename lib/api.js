const API_BASE_URL = 'https://api.bonsaimedia.nl/'; // Empty = same origin (uses Next.js proxy)

/**
 * Verbeterde API client met HttpOnly cookies en betere error handling
 */
export async function apiRequest(endpoint, options = {}) {
  const { suppressErrorLog, suppressNetworkErrorLog, ...fetchOptions } = options;

  const headers = {
    'Content-Type': 'application/json',
    ...fetchOptions.headers,
  };

  const config = {
    ...fetchOptions,
    headers,
    credentials: 'include', // Stuurt cookies automatisch mee
  };

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    
    // Als de token expired is (401), trigger logout event (geen error)
    if (response.status === 401) {
      // Trigger een global event voor logout
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('auth:logout'));
      }
      // Return null in plaats van error gooien - dit is normaal gedrag
      return null;
    }

    // Lege responses (204 No Content)
    if (response.status === 204) {
      return null;
    }

    // Check of response JSON is
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      const text = await response.text();
      console.error('Non-JSON response:', {
        status: response.status,
        statusText: response.statusText,
        url: `${API_BASE_URL}${endpoint}`,
        contentType,
        body: text.substring(0, 500) // Eerste 500 chars voor debugging
      });
      throw new Error(`Server returned non-JSON response (${response.status}). Is the backend running on ${API_BASE_URL}?`);
    }

    const data = await response.json();
    
    if (!response.ok) {
      // Log detailed error for debugging (unless explicitly suppressed)
      if (!suppressErrorLog) {
        console.error('API Error Details:', {
          status: response.status,
          url: `${API_BASE_URL}${endpoint}`,
          data: data,
          error: data.error,
          message: data.message,
          details: data.details
        });
      }
      throw new Error(data.message || data.error || 'Er is iets fout gegaan');
    }

    return data;
  } catch (error) {
    // Als het een fetch error is (bijv. connection refused)
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      if (!suppressNetworkErrorLog) {
        console.error('Network error - is backend running?', error);
      }
      throw new Error(`Cannot connect to API at ${API_BASE_URL}. Is the backend server running?`);
    }
    
    if (!suppressErrorLog) {
      console.error('API Error:', error);
    }
    throw error;
  }
}

// ============================================
// AUTH - Nu zonder localStorage
// ============================================

/**
 * Register functie - Backend stuurt HttpOnly cookie via Better Auth
 */
export async function register(name, email, password) {
  return apiRequest('/api/auth/sign-up/email', {
    method: 'POST',
    body: JSON.stringify({ name, email, password }),
  });
}

/**
 * Login functie - Backend stuurt HttpOnly cookie via Better Auth
 */
export async function login(email, password) {
  const response = await fetch('/api/auth/sign-in/email', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify({ email, password }),
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Login failed');
  }
  
  const data = await response.json();
  
  // Better Auth sets the cookie, we just need to verify the response
  if (!data.user && !data.session) {
    throw new Error('Login failed - no session created');
  }
  
  return data;
}

/**
 * Logout functie - Backend verwijdert cookie
 */
export async function logout() {
  try {
    await apiRequest('/api/auth/sign-out', { method: 'POST' });
  } finally {
    window.location.href = '/login';
  }
}

/**
 * Haal de huidige gebruiker op van de backend
 * Better Auth sessie wordt via cookies geverifieerd
 */
export async function getCurrentUser() {
  try {
    // Direct fetch gebruiken om cookies correct mee te sturen
    const response = await fetch('/api/users/me', {
      credentials: 'include', // Belangrijk: stuurt cookies mee
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      if (response.status === 401) {
        return null;
      }
      throw new Error(`Failed to get user: ${response.status}`);
    }
    
    const user = await response.json();
    return user;
  } catch (error) {
    // Silent fail for authentication checks
    return null;
  }
}

/**
 * Refresh de sessie (optioneel, als je refresh tokens gebruikt)
 */
export async function refreshSession() {
  return apiRequest('/api/auth/refresh', { method: 'POST' });
}

// ============================================
// USER
// ============================================

export const userAPI = {
  getMe: () => apiRequest('/api/users/me'),
  updateMe: (data) => apiRequest('/api/users/me', {
    method: 'PATCH',
    body: JSON.stringify(data),
  }),
  deleteMe: () => apiRequest('/api/users/me', { method: 'DELETE' }),
};

// ============================================
// WORKSPACE
// ============================================

export const workspaceAPI = {
  create: (data) => apiRequest('/api/workspaces', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  getAll: () => apiRequest('/api/workspaces'),
  getById: (id) => apiRequest(`/api/workspaces/${id}`),
  update: (id, data) => apiRequest(`/api/workspaces/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  }),
  delete: (id) => apiRequest(`/api/workspaces/${id}`, { method: 'DELETE' }),
  
  // Webhooks
  getWebhookEvents: (id) => apiRequest(`/api/workspaces/${id}/webhooks/events`),
  getWebhooks: (id) => apiRequest(`/api/workspaces/${id}/webhooks`),
  configureWebhooks: (id, data) => apiRequest(`/api/workspaces/${id}/webhooks`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  }),
  testWebhook: (id) => apiRequest(`/api/workspaces/${id}/webhooks/test`, {
    method: 'POST',
  }),
};

// ============================================
// AGENT
// ============================================

export const agentAPI = {
  create: (data) => apiRequest('/api/agents', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  getWorkspaceAgents: (workspaceId) => apiRequest(`/api/agents/workspace/${workspaceId}`),
  getById: (id, workspaceId) => apiRequest(`/api/agents/${id}?workspaceId=${workspaceId}`),
  update: (id, data) => apiRequest(`/api/agents/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  }),
  delete: (id, workspaceId) => apiRequest(`/api/agents/${id}?workspaceId=${workspaceId}`, {
    method: 'DELETE',
  }),
  toggle: (id, workspaceId, isActive) => apiRequest(`/api/agents/${id}/toggle`, {
    method: 'POST',
    body: JSON.stringify({ workspaceId, isActive }),
  }),
};

// ============================================
// CHAT
// ============================================

export const chatAPI = {
  // Public endpoints
  startConversation: (data) => apiRequest('/api/chat/conversations/start', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  getConversation: (id) => apiRequest(`/api/chat/conversations/${id}`),
  getMessages: (conversationId, page = 1, pageSize = 50) => 
    apiRequest(`/api/chat/conversations/${conversationId}/messages?page=${page}&pageSize=${pageSize}`),
  sendMessage: (data) => apiRequest('/api/chat/messages', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  resolveConversation: (id, rating, feedback) => apiRequest(`/api/chat/conversations/${id}/resolve`, {
    method: 'POST',
    body: JSON.stringify({ rating, feedback }),
  }),
  
  // Authenticated endpoints
  getWorkspaceConversations: (workspaceId, filters = {}) => {
    const params = new URLSearchParams(filters).toString();
    return apiRequest(`/api/chat/workspace/${workspaceId}/conversations?${params}`);
  },
  assignConversation: (id, userId) => apiRequest(`/api/chat/conversations/${id}/assign`, {
    method: 'POST',
    body: JSON.stringify({ userId }),
  }),
};

// ============================================
// WIDGET
// ============================================

export const widgetAPI = {
  create: (data) => apiRequest('/api/widgets', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  getWorkspaceWidgets: (workspaceId) => apiRequest(`/api/widgets/workspace/${workspaceId}`),
  getById: (id, workspaceId) => apiRequest(`/api/widgets/${id}?workspaceId=${workspaceId}`),
  update: (id, data) => apiRequest(`/api/widgets/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  }),
  delete: (id, workspaceId) => apiRequest(`/api/widgets/${id}?workspaceId=${workspaceId}`, {
    method: 'DELETE',
  }),
  toggle: (id, workspaceId, isActive) => apiRequest(`/api/widgets/${id}/toggle`, {
    method: 'POST',
    body: JSON.stringify({ workspaceId, isActive }),
  }),
  getConfig: (installCode) => apiRequest(`/api/widgets/config/${installCode}`),
  preview: (id, workspaceId) => apiRequest(`/api/widgets/preview/${id}?workspaceId=${workspaceId}`),
};

// ============================================
// KNOWLEDGE BASE
// ============================================

export const knowledgeBaseAPI = {
  create: (data) => apiRequest('/api/knowledge-bases', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  getWorkspaceKBs: (workspaceId) => apiRequest(`/api/knowledge-bases/workspace/${workspaceId}`),
  getById: (id, workspaceId) => apiRequest(`/api/knowledge-bases/${id}?workspaceId=${workspaceId}`),
  delete: (id, workspaceId) => apiRequest(`/api/knowledge-bases/${id}?workspaceId=${workspaceId}`, {
    method: 'DELETE',
  }),
  search: (id, query, limit = 10) => apiRequest(`/api/knowledge-bases/${id}/search`, {
    method: 'POST',
    body: JSON.stringify({ query, limit }),
  }),
  
  // Documents
  createDocument: (data) => apiRequest('/api/knowledge-bases/documents', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  getDocument: (id, workspaceId) => apiRequest(`/api/knowledge-bases/documents/${id}?workspaceId=${workspaceId}`),
  deleteDocument: (id, workspaceId) => apiRequest(`/api/knowledge-bases/documents/${id}?workspaceId=${workspaceId}`, {
    method: 'DELETE',
  }),
};

// ============================================
// WORKFLOW
// ============================================

export const workflowAPI = {
  create: (data) => apiRequest('/api/workflows', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  getWorkspaceWorkflows: (workspaceId) => apiRequest(`/api/workflows/workspace/${workspaceId}`),
  getById: (id, workspaceId) => apiRequest(`/api/workflows/${id}?workspaceId=${workspaceId}`),
  update: (id, data) => apiRequest(`/api/workflows/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  }),
  delete: (id, workspaceId) => apiRequest(`/api/workflows/${id}?workspaceId=${workspaceId}`, {
    method: 'DELETE',
  }),
  toggle: (id, workspaceId, isActive) => apiRequest(`/api/workflows/${id}/toggle`, {
    method: 'POST',
    body: JSON.stringify({ workspaceId, isActive }),
  }),
  execute: (id, conversationId, initialData) => apiRequest(`/api/workflows/${id}/execute`, {
    method: 'POST',
    body: JSON.stringify({ conversationId, initialData }),
  }),
  
  // Nodes
  deleteAllNodes: (workflowId, workspaceId) => apiRequest(`/api/workflows/${workflowId}/nodes?workspaceId=${workspaceId}`, {
    method: 'DELETE',
    // Dit is een niet-kritische cleanup stap tijdens het opslaan van een workflow.
    // Als deze faalt willen we geen console vol errors; de nieuwe nodes/edges worden alsnog aangemaakt.
    suppressErrorLog: true,
  }),
  createNode: (workflowId, data) => apiRequest(`/api/workflows/${workflowId}/nodes`, {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  updateNode: (nodeId, data) => apiRequest(`/api/workflows/nodes/${nodeId}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  }),
  deleteNode: (nodeId, workspaceId) => apiRequest(`/api/workflows/nodes/${nodeId}?workspaceId=${workspaceId}`, {
    method: 'DELETE',
  }),
  
  // Edges
  createEdge: (workflowId, data) => apiRequest(`/api/workflows/${workflowId}/edges`, {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  deleteEdge: (edgeId, workspaceId) => apiRequest(`/api/workflows/edges/${edgeId}?workspaceId=${workspaceId}`, {
    method: 'DELETE',
  }),
  
  // Batch operations (atomic)
  batchSave: (workflowId, data) => apiRequest(`/api/workflows/${workflowId}/batch-save`, {
    method: 'POST',
    body: JSON.stringify(data),
  }),
};

// ============================================
// INVITE
// ============================================

export const inviteAPI = {
  getWorkspaceInvites: (workspaceId) => apiRequest(`/api/invites/workspace/${workspaceId}`),
  create: (workspaceId, data) => apiRequest(`/api/invites/workspace/${workspaceId}`, {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  getByToken: (token) => apiRequest(`/api/invites/token/${token}`),
  accept: (token) => apiRequest(`/api/invites/accept/${token}`, { method: 'POST' }),
  decline: (token) => apiRequest(`/api/invites/decline/${token}`, { method: 'POST' }),
  revoke: (inviteId) => apiRequest(`/api/invites/${inviteId}`, { method: 'DELETE' }),
  removeMember: (workspaceId, userId) => apiRequest(`/api/invites/workspace/${workspaceId}/member/${userId}`, {
    method: 'DELETE',
  }),
  updateMemberRole: (workspaceId, userId, role) => apiRequest(`/api/invites/workspace/${workspaceId}/member/${userId}`, {
    method: 'PATCH',
    body: JSON.stringify({ role }),
  }),
};

// ============================================
// DASHBOARD / ANALYTICS
// ============================================

export const dashboardAPI = {
  getAnalytics: (workspaceId, startDate, endDate) => {
    const params = new URLSearchParams({ workspaceId });
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    return apiRequest(`/api/dashboard/analytics?${params}`);
  },
  getRealtimeStats: (workspaceId) => apiRequest(`/api/dashboard/realtime?workspaceId=${workspaceId}`),
  setPresence: (status, awayMessage) => apiRequest('/api/dashboard/presence', {
    method: 'POST',
    body: JSON.stringify({ status, awayMessage }),
  }),
  getAgents: (workspaceId, status) => {
    const params = new URLSearchParams({ workspaceId });
    if (status) params.append('status', status);
    return apiRequest(`/api/dashboard/agents?${params}`);
  },
  getConversations: (workspaceId, filters = {}) => {
    const params = new URLSearchParams({ workspaceId, ...filters });
    return apiRequest(`/api/dashboard/conversations?${params}`);
  },
};

// ============================================
// SCRAPER
// ============================================

export const scraperAPI = {
  scrapeUrl: (url, knowledgeBaseId) => apiRequest('/api/scraper/scrape-url', {
    method: 'POST',
    body: JSON.stringify({ url, knowledgeBaseId }),
  }),
  scrapeWebsite: (baseUrl, knowledgeBaseId, maxPages) => apiRequest('/api/scraper/scrape-website', {
    method: 'POST',
    body: JSON.stringify({ baseUrl, knowledgeBaseId, maxPages }),
  }),
  getPageContext: (url, knowledgeBaseId) => 
    apiRequest(`/api/scraper/page-context?url=${encodeURIComponent(url)}&knowledgeBaseId=${knowledgeBaseId}`),
  
  // Job-based scraping
  createJob: (baseUrl, knowledgeBaseId, maxPages) => apiRequest('/api/scraper/jobs/create', {
    method: 'POST',
    body: JSON.stringify({ baseUrl, knowledgeBaseId, maxPages }),
  }),
  getJob: (jobId) => apiRequest(`/api/scraper/jobs/${jobId}`),
  getJobsForKB: (knowledgeBaseId) => apiRequest(`/api/scraper/jobs/kb/${knowledgeBaseId}`),
  startJob: (jobId, selectedUrls) => apiRequest(`/api/scraper/jobs/${jobId}/start`, {
    method: 'POST',
    body: JSON.stringify({ selectedUrls }),
  }),
};

// ============================================
// MEDIA
// ============================================

export const mediaAPI = {
  // Upload media (authenticated)
  upload: async (file, messageId, metadata = {}) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('messageId', messageId);
    if (metadata.width) formData.append('width', metadata.width.toString());
    if (metadata.height) formData.append('height', metadata.height.toString());
    if (metadata.duration) formData.append('duration', metadata.duration.toString());

    const response = await fetch(`${API_BASE_URL}/api/media/upload`, {
      method: 'POST',
      credentials: 'include', // Cookies meesturen
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Upload failed');
    }

    return response.json();
  },

  // Upload media (public - for widget)
  uploadPublic: async (file, messageId) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('messageId', messageId);

    const response = await fetch(`${API_BASE_URL}/api/media/upload-public`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Upload failed');
    }

    return response.json();
  },

  getAttachment: (attachmentId) => apiRequest(`/api/media/${attachmentId}`),
  getMessageAttachments: (messageId) => apiRequest(`/api/media/message/${messageId}/attachments`),
  deleteAttachment: (attachmentId) => apiRequest(`/api/media/${attachmentId}`, { method: 'DELETE' }),
  getConfig: () => apiRequest('/api/media/config'),
  
  // Helper to get file URL
  getFileUrl: (type, filename) => `${API_BASE_URL}/api/media/file/${type}/${filename}`,
}