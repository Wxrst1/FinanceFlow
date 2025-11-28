

import React, { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react';
import { generateId } from '../utils';

export type NotificationType = 'success' | 'error' | 'info' | 'warning';

export interface Notification {
  id: string;
  message: string;
  type: NotificationType;
  timestamp: number;
}

interface NotificationContextType {
  notifications: Notification[];
  history: Notification[];
  addNotification: (message: string, type: NotificationType, persist?: boolean) => void;
  removeNotification: (id: string) => void;
  clearHistory: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider = ({ children }: { children?: ReactNode }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [history, setHistory] = useState<Notification[]>(() => {
      try {
          const saved = localStorage.getItem('financeflow_notifications_history');
          return saved ? JSON.parse(saved) : [];
      } catch { return []; }
  });

  useEffect(() => {
      localStorage.setItem('financeflow_notifications_history', JSON.stringify(history));
  }, [history]);

  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  const clearHistory = useCallback(() => {
      setHistory([]);
  }, []);

  const addNotification = useCallback((message: string, type: NotificationType, persist: boolean = true) => {
    const id = generateId();
    const newNotif = { id, message, type, timestamp: Date.now() };
    
    setNotifications(prev => [...prev, newNotif]);
    
    if (persist) {
        setHistory(prev => [newNotif, ...prev].slice(0, 50));
    }
    
    setTimeout(() => {
      removeNotification(id);
    }, 3000);
  }, [removeNotification]);

  return (
    <NotificationContext.Provider value={{ notifications, history, addNotification, removeNotification, clearHistory }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) throw new Error('useNotification must be used within a NotificationProvider');
  return context;
};