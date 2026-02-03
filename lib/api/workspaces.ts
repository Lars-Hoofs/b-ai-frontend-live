export interface Workspace {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
  owner: {
    id: string;
    email: string;
    name: string | null;
    image: string | null;
  };
  members?: WorkspaceMember[];
  _count?: {
    members: number;
  };
}

export interface WorkspaceMember {
  id: string;
  userId: string;
  workspaceId: string;
  role: 'OWNER' | 'ADMIN' | 'MEMBER';
  joinedAt: string;
  user: {
    id: string;
    email: string;
    name: string | null;
    image: string | null;
  };
}

export interface CreateWorkspaceInput {
  name: string;
  slug: string;
  description?: string;
}

export interface UpdateWorkspaceInput {
  name?: string;
  slug?: string;
  description?: string;
}

export interface InviteMemberInput {
  email: string;
  role: 'ADMIN' | 'MEMBER';
}

const API_BASE = '/api';

// Track retry attempts per endpoint to prevent infinite loops
const retryAttempts = new Map<string, number>();
const MAX_RETRY_ATTEMPTS = 2;

async function fetchAPI<T>(
  endpoint: string,
  options?: RequestInit & { skipRetryOn401?: boolean; suppressErrorLog?: boolean }
): Promise<T> {
  const { skipRetryOn401, suppressErrorLog, ...fetchOptions } = options || {};

  const url = `${API_BASE}${endpoint}`;

  try {
    const response = await fetch(url, {
      ...fetchOptions,
      headers: {
        'Content-Type': 'application/json',
        ...fetchOptions.headers,
      },
      credentials: 'include',
    });

    // Handle 401 Unauthorized with retry logic
    if (response.status === 401) {
      const currentAttempts = retryAttempts.get(endpoint) || 0;

      if (skipRetryOn401) {
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('auth:logout'));
        }
        throw new Error('Unauthorized');
      }

      if (currentAttempts < MAX_RETRY_ATTEMPTS) {
        retryAttempts.set(endpoint, currentAttempts + 1);

        // Exponential backoff
        const delay = 500 * Math.pow(2, currentAttempts);
        console.log(`[API] 401 on ${endpoint}, retrying in ${delay}ms`);

        await new Promise(resolve => setTimeout(resolve, delay));
        return fetchAPI<T>(endpoint, options);
      }

      retryAttempts.delete(endpoint);
      console.log(`[API] 401 on ${endpoint} after max retries, triggering logout`);

      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('auth:logout'));
      }
      throw new Error('Session expired');
    }

    retryAttempts.delete(endpoint);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));

      if (!suppressErrorLog) {
        console.error('API Error:', {
          status: response.status,
          url,
          error: errorData
        });
      }

      throw new Error(errorData.error || errorData.message || `API Error: ${response.status}`);
    }

    return response.json();
  } catch (error: any) {
    if (!suppressErrorLog) {
      console.error('Fetch error:', error);
    }
    throw error;
  }
}

// Get all workspaces for current user
export async function getWorkspaces(): Promise<Workspace[]> {
  return fetchAPI<Workspace[]>('/workspaces');
}

// Get single workspace with members
export async function getWorkspace(id: string): Promise<Workspace> {
  return fetchAPI<Workspace>(`/workspaces/${id}`);
}

// Create new workspace
export async function createWorkspace(data: CreateWorkspaceInput): Promise<Workspace> {
  return fetchAPI<Workspace>('/workspaces', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

// Update workspace
export async function updateWorkspace(
  id: string,
  data: UpdateWorkspaceInput
): Promise<Workspace> {
  return fetchAPI<Workspace>(`/workspaces/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

// Delete workspace
export async function deleteWorkspace(id: string): Promise<{ success: boolean }> {
  return fetchAPI<{ success: boolean }>(`/workspaces/${id}`, {
    method: 'DELETE',
  });
}

// Get workspace members
export async function getWorkspaceMembers(workspaceId: string): Promise<WorkspaceMember[]> {
  const workspace = await getWorkspace(workspaceId);
  return workspace.members || [];
}

// Invite member (via invite routes)
export async function inviteMember(
  workspaceId: string,
  data: InviteMemberInput
): Promise<any> {
  return fetchAPI<any>(`/invites/workspace/${workspaceId}`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

// Update member role
export async function updateMemberRole(
  workspaceId: string,
  userId: string,
  role: 'ADMIN' | 'MEMBER'
): Promise<WorkspaceMember> {
  return fetchAPI<WorkspaceMember>(`/invites/workspace/${workspaceId}/member/${userId}`, {
    method: 'PATCH',
    body: JSON.stringify({ role }),
  });
}

// Remove member
export async function removeMember(
  workspaceId: string,
  userId: string
): Promise<{ success: boolean }> {
  return fetchAPI<{ success: boolean }>(`/invites/workspace/${workspaceId}/member/${userId}`, {
    method: 'DELETE',
  });
}
