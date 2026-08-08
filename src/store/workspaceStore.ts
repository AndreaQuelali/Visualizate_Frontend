import { create } from 'zustand';

interface WorkspaceState {
  activeWorkspaceId: string | null;
  setActiveWorkspace: (id: string) => void;
  clearActiveWorkspace: () => void;
}

export const useWorkspaceStore = create<WorkspaceState>((set) => {
  const savedId = localStorage.getItem('activeWorkspaceId');

  return {
    activeWorkspaceId: savedId,
    setActiveWorkspace: (id) => {
      localStorage.setItem('activeWorkspaceId', id);
      set({ activeWorkspaceId: id });
    },
    clearActiveWorkspace: () => {
      localStorage.removeItem('activeWorkspaceId');
      set({ activeWorkspaceId: null });
    },
  };
});
