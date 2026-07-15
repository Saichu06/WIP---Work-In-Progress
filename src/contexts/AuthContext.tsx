import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { AuthStorage, type AuthUser } from '@/storage/AuthStorage';

interface AuthContextValue {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string, remember: boolean) => Promise<{ success: boolean; error?: string }>;
  signup: (name: string, email: string, password: string, workspaceName: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize auth state from storage on mount
  useEffect(() => {
    const authenticated = AuthStorage.isAuthenticated();
    if (authenticated) {
      const storedUser = AuthStorage.getUser();
      setUser(storedUser);
      setIsAuthenticated(true);
    }
    setIsLoading(false);
  }, []);

  const login = useCallback(async (
    email: string,
    password: string,
    remember: boolean
  ): Promise<{ success: boolean; error?: string }> => {
    // Simulate network delay for realistic UX
    await new Promise(resolve => setTimeout(resolve, 700));

    if (!email.trim() || !password.trim()) {
      return { success: false, error: 'Email and password are required.' };
    }

    const loggedInUser = AuthStorage.login(email, password, remember);
    if (loggedInUser) {
      setUser(loggedInUser);
      setIsAuthenticated(true);
      return { success: true };
    }

    return { success: false, error: 'No account found with this email. Please sign up first.' };
  }, []);

  const signup = useCallback(async (
    name: string,
    email: string,
    password: string,
    workspaceName: string
  ): Promise<{ success: boolean; error?: string }> => {
    await new Promise(resolve => setTimeout(resolve, 700));

    if (!name.trim() || !email.trim() || !password.trim()) {
      return { success: false, error: 'All fields are required.' };
    }
    if (password.length < 6) {
      return { success: false, error: 'Password must be at least 6 characters.' };
    }
    if (!email.includes('@')) {
      return { success: false, error: 'Please enter a valid email address.' };
    }

    const newUser = AuthStorage.signup(name, email, password, workspaceName || `${name}'s Workspace`);
    setUser(newUser);
    setIsAuthenticated(true);
    return { success: true };
  }, []);

  const logout = useCallback(() => {
    AuthStorage.logout();
    setUser(null);
    setIsAuthenticated(false);
  }, []);

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, isLoading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
