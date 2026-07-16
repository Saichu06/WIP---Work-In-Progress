import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { AuthStorage, type AuthUser } from '@/storage/AuthStorage';
import { UserStorage } from '@/storage/UserStorage';
import { ActivityStorage } from '@/storage/ActivityStorage';
import { NotificationStorage } from '@/storage/NotificationStorage';
import type { UserProfile } from '@/types';

interface AuthContextValue {
  user: AuthUser | null;
  profile: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string, remember: boolean) => Promise<{ success: boolean; error?: string }>;
  signup: (name: string, email: string, password: string, workspaceName: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  updateProfile: (data: Partial<UserProfile> & { name?: string; avatar?: string }) => void;
  refreshProfile: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const refreshProfile = useCallback(() => {
    const p = UserStorage.get();
    setProfile(p);
    // Sync avatar back to auth user if changed
    if (p?.profileImage) {
      const currentUser = AuthStorage.getUser();
      if (currentUser && currentUser.avatar !== p.profileImage) {
        AuthStorage.updateUser({ avatar: p.profileImage });
        setUser(prev => prev ? { ...prev, avatar: p.profileImage } : prev);
      }
    }
  }, []);

  // Initialize auth state from storage on mount
  useEffect(() => {
    const authenticated = AuthStorage.isAuthenticated();
    if (authenticated) {
      const storedUser = AuthStorage.getUser();
      setUser(storedUser);
      setIsAuthenticated(true);

      // Ensure UserProfile exists (handles users who signed up before this system)
      if (storedUser) {
        const existingProfile = UserStorage.get();
        if (!existingProfile) {
          UserStorage.initFromAuth(
            storedUser.id,
            storedUser.name,
            storedUser.email,
            storedUser.workspaceName
          );
        }
        const p = UserStorage.get();
        setProfile(p);
      }
    }
    setIsLoading(false);
  }, []);

  const login = useCallback(async (
    email: string,
    password: string,
    remember: boolean
  ): Promise<{ success: boolean; error?: string }> => {
    await new Promise(resolve => setTimeout(resolve, 700));

    if (!email.trim() || !password.trim()) {
      return { success: false, error: 'Email and password are required.' };
    }

    const loggedInUser = AuthStorage.login(email, password, remember);
    if (loggedInUser) {
      setUser(loggedInUser);
      setIsAuthenticated(true);

      // Ensure profile exists
      let p = UserStorage.get();
      if (!p) {
        p = UserStorage.initFromAuth(
          loggedInUser.id,
          loggedInUser.name,
          loggedInUser.email,
          loggedInUser.workspaceName
        );
      } else {
        UserStorage.recordLogin();
        p = UserStorage.get();
      }
      setProfile(p);

      // Log login activity
      ActivityStorage.log('user_login', 'Signed in', `Welcome back, ${loggedInUser.name.split(' ')[0]}!`);
      NotificationStorage.add('Welcome back!', `You signed in as ${loggedInUser.email}`, 'info');

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

    const resolvedWorkspace = workspaceName || `${name}'s Workspace`;
    const newUser = AuthStorage.signup(name, email, password, resolvedWorkspace);
    setUser(newUser);
    setIsAuthenticated(true);

    // Initialize full UserProfile
    const p = UserStorage.initFromAuth(newUser.id, name, email, resolvedWorkspace);
    setProfile(p);

    // Log signup activity
    ActivityStorage.log('user_login', 'Workspace created', `Welcome to WIP, ${name.split(' ')[0]}! Your workspace is ready.`);

    return { success: true };
  }, []);

  const logout = useCallback(() => {
    ActivityStorage.log('user_logout', 'Signed out', 'You have been signed out.');
    AuthStorage.logout();
    setUser(null);
    setProfile(null);
    setIsAuthenticated(false);
  }, []);

  /**
   * Update profile fields. Syncs both UserStorage and AuthStorage
   * so name/avatar changes appear everywhere immediately.
   */
  const updateProfile = useCallback((data: Partial<UserProfile> & { name?: string; avatar?: string }) => {
    const updatedProfile = UserStorage.update(data);
    setProfile(updatedProfile);

    // Sync auth-layer fields
    const authData: Partial<AuthUser> = {};
    if (data.fullName) authData.name = data.fullName;
    if (data.avatar !== undefined) authData.avatar = data.avatar;
    if (data.profileImage !== undefined) authData.avatar = data.profileImage;
    if (data.workspaceName) authData.workspaceName = data.workspaceName;
    if (Object.keys(authData).length > 0) {
      AuthStorage.updateUser(authData);
      setUser(prev => prev ? { ...prev, ...authData } : prev);
    }

    ActivityStorage.log('profile_updated', 'Profile updated', 'Your profile has been updated.');
  }, []);

  return (
    <AuthContext.Provider value={{
      user, profile, isAuthenticated, isLoading,
      login, signup, logout,
      updateProfile, refreshProfile,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
