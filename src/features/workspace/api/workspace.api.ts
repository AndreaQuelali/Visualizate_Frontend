import api from '@/lib/axios';

export type WorkspaceRole = 'ADMIN' | 'DESIGNER' | 'ORGANIZER';
export type InvitationStatus = 'PENDING' | 'ACCEPTED' | 'CANCELLED';
export type MemberStatus = 'ACTIVE' | 'PENDING_VERIFICATION';

export interface Workspace {
  id: string;
  name: string;
  description: string | null;
  logoUrl: string | null;
  createdAt: string;
  updatedAt: string;
  role: WorkspaceRole;
  memberCount: number;
}

export interface WorkspaceMember {
  id: string;
  userId: string;
  role: WorkspaceRole;
  joinedAt: string;
  fullName: string;
  email: string;
  status: MemberStatus;
}

export interface WorkspaceInvitation {
  id: string;
  email: string;
  role: WorkspaceRole;
  status: InvitationStatus;
  expiresAt: string;
  createdAt: string;
}

export interface CreateWorkspacePayload {
  name: string;
  description?: string;
}

export interface UpdateWorkspacePayload {
  name?: string;
  description?: string;
}

export interface InviteMemberPayload {
  email: string;
  role: WorkspaceRole;
}

export const workspaceApi = {
  list: async (): Promise<Workspace[]> => {
    const { data } = await api.get<Workspace[]>('/workspaces');
    return data;
  },

  getById: async (id: string): Promise<Workspace> => {
    const { data } = await api.get<Workspace>(`/workspaces/${id}`);
    return data;
  },

  create: async (payload: CreateWorkspacePayload): Promise<Workspace> => {
    const { data } = await api.post<Workspace>('/workspaces', payload);
    return data;
  },

  update: async (
    id: string,
    payload: UpdateWorkspacePayload,
  ): Promise<Workspace> => {
    const { data } = await api.patch<Workspace>(`/workspaces/${id}`, payload);
    return data;
  },

  uploadLogo: async (id: string, file: File): Promise<{ logoUrl: string }> => {
    const formData = new FormData();
    formData.append('file', file);
    const { data } = await api.post<{ logoUrl: string }>(
      `/workspaces/${id}/logo`,
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } },
    );
    return data;
  },

  remove: async (id: string): Promise<void> => {
    await api.delete(`/workspaces/${id}`);
  },

  listMembers: async (id: string): Promise<WorkspaceMember[]> => {
    const { data } = await api.get<WorkspaceMember[]>(
      `/workspaces/${id}/members`,
    );
    return data;
  },

  changeRole: async (
    workspaceId: string,
    userId: string,
    role: WorkspaceRole,
  ): Promise<WorkspaceMember> => {
    const { data } = await api.patch<WorkspaceMember>(
      `/workspaces/${workspaceId}/members/${userId}/role`,
      { role },
    );
    return data;
  },

  removeMember: async (workspaceId: string, userId: string): Promise<void> => {
    await api.delete(`/workspaces/${workspaceId}/members/${userId}`);
  },

  leave: async (workspaceId: string): Promise<void> => {
    await api.delete(`/workspaces/${workspaceId}/members/me`);
  },

  invite: async (
    workspaceId: string,
    payload: InviteMemberPayload,
  ): Promise<WorkspaceInvitation> => {
    const { data } = await api.post<WorkspaceInvitation>(
      `/workspaces/${workspaceId}/invitations`,
      payload,
    );
    return data;
  },

  listInvitations: async (
    workspaceId: string,
  ): Promise<WorkspaceInvitation[]> => {
    const { data } = await api.get<WorkspaceInvitation[]>(
      `/workspaces/${workspaceId}/invitations`,
    );
    return data;
  },

  resendInvitation: async (
    workspaceId: string,
    invitationId: string,
  ): Promise<WorkspaceInvitation> => {
    const { data } = await api.post<WorkspaceInvitation>(
      `/workspaces/${workspaceId}/invitations/${invitationId}/resend`,
    );
    return data;
  },

  cancelInvitation: async (
    workspaceId: string,
    invitationId: string,
  ): Promise<void> => {
    await api.delete(
      `/workspaces/${workspaceId}/invitations/${invitationId}`,
    );
  },

  acceptInvitation: async (token: string): Promise<Workspace> => {
    const { data } = await api.post<Workspace>('/workspaces/accept-invitation', {
      token,
    });
    return data;
  },
};
