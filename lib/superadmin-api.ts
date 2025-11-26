const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '';

class SuperadminAPI {
  private async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const response = await fetch(`${API_BASE_URL}/api/superadmin${endpoint}`, {
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      ...options,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Network error' }));
      throw new Error(error.message || `HTTP ${response.status}`);
    }

    return response.json();
  }

  // Get all platform stats
  async getStats() {
    return this.request<{
      users: { total: number; active: number };
      workspaces: number;
      agents: number;
      conversations: number;
      knowledgeBases: number;
      workflows: number;
      widgets: number;
    }>('/stats');
  }

  // Get all users
  async getUsers() {
    return this.request<any[]>('/users');
  }

  // Get all workspaces
  async getWorkspaces() {
    return this.request<any[]>('/workspaces');
  }

  // Get all agents
  async getAgents() {
    return this.request<any[]>('/agents');
  }

  // Get all knowledge bases
  async getKnowledgeBases() {
    return this.request<any[]>('/knowledge-bases');
  }

  // Get all workflows
  async getWorkflows() {
    return this.request<any[]>('/workflows');
  }

  // Get all widgets
  async getWidgets() {
    return this.request<any[]>('/widgets');
  }

  // Get all conversations
  async getConversations() {
    return this.request<any[]>('/conversations');
  }

  // Update user
  async updateUser(userId: string, data: {
    name?: string;
    email?: string;
    role?: 'user' | 'admin';
    banned?: boolean;
    banReason?: string;
  }) {
    return this.request(`/users/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // Delete user
  async deleteUser(userId: string) {
    return this.request(`/users/${userId}`, {
      method: 'DELETE',
    });
  }
}

export const superadminAPI = new SuperadminAPI();