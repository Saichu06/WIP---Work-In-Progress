import { v4 as uuidv4 } from 'uuid';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  workspaceName: string;
  avatar?: string;
  createdAt: string;
}

const USER_KEY = 'wip_auth_user';
const SESSION_KEY = 'wip_auth_session';

export const AuthStorage = {
  getUser(): AuthUser | null {
    try {
      return JSON.parse(localStorage.getItem(USER_KEY) || 'null');
    } catch {
      return null;
    }
  },

  getSession(): { token: string; expiresAt: string } | null {
    try {
      return JSON.parse(localStorage.getItem(SESSION_KEY) || 'null');
    } catch {
      return null;
    }
  },

  isAuthenticated(): boolean {
    const session = this.getSession();
    if (!session) return false;
    return new Date(session.expiresAt) > new Date();
  },

  login(email: string, _password: string, remember: boolean): AuthUser | null {
    // In production, this would call an API. For now, we check stored user.
    const user = this.getUser();
    if (user && user.email.toLowerCase() === email.toLowerCase()) {
      const expiresAt = remember
        ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days
        : new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(); // 1 day
      localStorage.setItem(SESSION_KEY, JSON.stringify({ token: uuidv4(), expiresAt }));
      return user;
    }
    return null;
  },

  signup(name: string, email: string, _password: string, workspaceName: string): AuthUser {
    const user: AuthUser = {
      id: uuidv4(),
      name,
      email,
      workspaceName,
      createdAt: new Date().toISOString(),
    };
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
    localStorage.setItem(SESSION_KEY, JSON.stringify({ token: uuidv4(), expiresAt }));
    return user;
  },

  logout(): void {
    localStorage.removeItem(SESSION_KEY);
  },

  updateUser(data: Partial<AuthUser>): void {
    const user = this.getUser();
    if (user) {
      localStorage.setItem(USER_KEY, JSON.stringify({ ...user, ...data }));
    }
  },
};
