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

async function fetchAPI<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    credentials: 'include',
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(error.error || `API Error: ${response.status}`);
  }

  return response.json();
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
