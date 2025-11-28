
import { useState, useEffect } from 'react';
import { useOfflineMode } from './useOfflineMode';
import { SyncService } from '../services/syncService';

export const useSync = (isAuthenticated: boolean) => {
  const isOnline = useOfflineMode();
  const [isSyncing, setIsSyncing] = useState(false);

  // Auto-sync when coming back online
  useEffect(() => {
    if (isOnline && isAuthenticated) {
      triggerSync();
    }
  }, [isOnline, isAuthenticated]);

  // Periodic background sync (every 5 mins)
  useEffect(() => {
    if (!isAuthenticated) return;
    const interval = setInterval(() => {
        if (navigator.onLine) triggerSync();
    }, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [isAuthenticated]);

  const triggerSync = async () => {
    if (isSyncing) return;
    setIsSyncing(true);
    try {
      // 1. Push local changes
      await SyncService.processQueue();
      // 2. Pull remote changes
      await SyncService.pullLatestData();
    } catch (e) {
      console.error("Sync failed", e);
    } finally {
      setIsSyncing(false);
    }
  };

  return { isSyncing, triggerSync, isOnline };
};
