import { v4 as uuidv4 } from 'uuid';
import type { UserProfile } from '@/types';

const KEY = 'wip_user_profile';

const DEFAULT_PROFILE: Omit<UserProfile, 'id' | 'fullName' | 'email' | 'workspaceName' | 'createdAt'> = {
  username: '',
  bio: '',
  profileImage: undefined,
  role: '',
  company: '',
  location: '',
  website: '',
  github: '',
  linkedin: '',
  twitter: '',
  timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
  language: 'English',
  updatedAt: new Date().toISOString(),
  lastLogin: new Date().toISOString(),
};

export const UserStorage = {
  /** Get the stored profile, merging any defaults for missing fields. */
  get(): UserProfile | null {
    try {
      const raw = localStorage.getItem(KEY);
      if (!raw) return null;
      return JSON.parse(raw) as UserProfile;
    } catch {
      return null;
    }
  },

  /**
   * Initialize the profile from AuthStorage data on first use.
   * Called during signup / first login. Will NOT overwrite an existing profile.
   */
  initFromAuth(id: string, fullName: string, email: string, workspaceName: string): UserProfile {
    const existing = this.get();
    if (existing && existing.id === id) return existing;

    const now = new Date().toISOString();
    const profile: UserProfile = {
      ...DEFAULT_PROFILE,
      id,
      fullName,
      email,
      workspaceName,
      username: email.split('@')[0].toLowerCase().replace(/[^a-z0-9_]/g, ''),
      createdAt: now,
      updatedAt: now,
      lastLogin: now,
    };
    localStorage.setItem(KEY, JSON.stringify(profile));
    return profile;
  },

  /** Update specific profile fields. Always stamps updatedAt. */
  update(data: Partial<Omit<UserProfile, 'id' | 'createdAt'>>): UserProfile | null {
    const current = this.get();
    if (!current) return null;
    const updated: UserProfile = {
      ...current,
      ...data,
      updatedAt: new Date().toISOString(),
    };
    localStorage.setItem(KEY, JSON.stringify(updated));
    return updated;
  },

  /** Record a login timestamp. */
  recordLogin(): void {
    this.update({ lastLogin: new Date().toISOString() });
  },

  /** Export the profile as a plain object (for JSON download). */
  export(): UserProfile | null {
    return this.get();
  },

  /** Restore a previously exported profile. */
  import(data: UserProfile): void {
    localStorage.setItem(KEY, JSON.stringify({ ...data, updatedAt: new Date().toISOString() }));
  },

  /** Wipe the profile (used on workspace reset). */
  clear(): void {
    localStorage.removeItem(KEY);
  },

  /** Generate initials from a full name. */
  getInitials(name?: string): string {
    if (!name) return '?';
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0][0]?.toUpperCase() || '?';
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  },
};
