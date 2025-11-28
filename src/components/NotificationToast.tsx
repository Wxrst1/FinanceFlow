

import React, { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react';
import { useNotification } from '../contexts/NotificationContext';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, Info, X, AlertTriangle } from 'lucide-react';

const NotificationToast = () => {
  const { notifications, removeNotification } = useNotification();

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
      <AnimatePresence>
        {notifications.map((notification) => (
          <motion.div
            key={notification.id}
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
            layout
            className="pointer-events-auto min-w-[300px] bg-surface border border-border rounded-lg shadow-xl p-4 flex items-start gap-3"
          >
            <div className="mt-0.5">
              {notification.type === 'success' && <CheckCircle className="text-green-500" size={20} />}
              {notification.type === 'error' && <XCircle className="text-red-500" size={20} />}
              {notification.type === 'info' && <Info className="text-blue-500" size={20} />}
              {notification.type === 'warning' && <AlertTriangle className="text-yellow-500" size={20} />}
            </div>
            
            <div className="flex-1">
              <p className="text-sm font-medium text-white">{notification.message}</p>
            </div>

            <button 
              onClick={() => removeNotification(notification.id)}
              className="text-text-muted hover:text-white transition-colors"
            >
              <X size={16} />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

export default NotificationToast;