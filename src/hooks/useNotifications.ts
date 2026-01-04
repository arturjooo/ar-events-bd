"use client";

import { useState } from "react";

interface Notification {
  id: string;
  type: 'success' | 'error';
  message: string;
}

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const addNotification = (type: 'success' | 'error', message: string) => {
    const id = Date.now().toString();
    const newNotification: Notification = { id, type, message };
    
    setNotifications(prev => [...prev, newNotification]);
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  };

  const showSuccess = (message: string) => {
    addNotification('success', message);
  };

  const showError = (message: string) => {
    addNotification('error', message);
  };

  return {
    notifications,
    removeNotification,
    showSuccess,
    showError
  };
}
