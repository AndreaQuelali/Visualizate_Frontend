import { create } from 'zustand';

export interface User {
  id: string;
  email: string;
  fullName: string;
  isVerified: boolean;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
  updateUser: (user: Partial<User>) => void;
}

export const useAuthStore = create<AuthState>((set) => {
  // Load initial state from localStorage
  const savedToken = localStorage.getItem('token');
  const savedUserJson = localStorage.getItem('user');
  let savedUser: User | null = null;
  try {
    if (savedUserJson) {
      savedUser = JSON.parse(savedUserJson);
    }
  } catch (e) {
    console.error('Error parsing user from localStorage', e);
  }

  return {
    user: savedUser,
    token: savedToken,
    isAuthenticated: !!savedToken,
    login: (token, user) => {
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      set({ token, user, isAuthenticated: true });
    },
    logout: () => {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      set({ token: null, user: null, isAuthenticated: false });
    },
    updateUser: (updatedFields) => {
      set((state) => {
        if (!state.user) return state;
        const newUser = { ...state.user, ...updatedFields };
        localStorage.setItem('user', JSON.stringify(newUser));
        return { user: newUser };
      });
    },
  };
});
