import { v4 as uuidv4 } from 'uuid';
import type { AppNotification, AppNotificationType } from '@/types';

const KEY = 'wip_notifications';
const MAX_NOTIFICATIONS = 100;

export const NotificationStorage = {
  get(): AppNotification[] {
    try {
      return JSON.parse(localStorage.getItem(KEY) || '[]');
    } catch {
      return [];
    }
  },

  getUnread(): AppNotification[] {
    return this.get().filter(n => !n.read);
  },

  getUnreadCount(): number {
    return this.getUnread().length;
  },

  add(
    title: string,
    message: string,
    type: AppNotificationType,
    entityId?: string,
    projectId?: string
  ): AppNotification {
    const notification: AppNotification = {
      id: uuidv4(),
      title,
      message,
      type,
      read: false,
      entityId,
      projectId,
      createdAt: new Date().toISOString(),
    };
    const all = this.get();
    const trimmed = [notification, ...all].slice(0, MAX_NOTIFICATIONS);
    localStorage.setItem(KEY, JSON.stringify(trimmed));
    return notification;
  },

  markRead(id: string): void {
    const all = this.get().map(n =>
      n.id === id ? { ...n, read: true } : n
    );
    localStorage.setItem(KEY, JSON.stringify(all));
  },

  markAllRead(): void {
    const all = this.get().map(n => ({ ...n, read: true }));
    localStorage.setItem(KEY, JSON.stringify(all));
  },

  delete(id: string): void {
    localStorage.setItem(KEY, JSON.stringify(this.get().filter(n => n.id !== id)));
  },

  clear(): void {
    localStorage.removeItem(KEY);
  },
};
