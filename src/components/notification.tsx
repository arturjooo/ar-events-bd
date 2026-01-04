"use client";

import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, X, AlertCircle } from "lucide-react";

interface NotificationProps {
  id: string;
  type: 'success' | 'error';
  message: string;
  onClose: (id: string) => void;
}

export default function Notification({ id, type, message, onClose }: NotificationProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose(id);
    }, 5000);

    return () => clearTimeout(timer);
  }, [id, onClose]);

  return (
    <motion.div
      initial={{ opacity: 0, x: 100, scale: 0.8 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 100, scale: 0.8 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className={`fixed top-4 right-4 z-50 max-w-sm p-4 rounded-lg shadow-lg border ${
        type === 'success' 
          ? 'bg-green-900/90 border-green-500/30' 
          : 'bg-red-900/90 border-red-500/30'
      } backdrop-blur-sm`}
    >
      <div className="flex items-start gap-3">
        <div className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center ${
          type === 'success' ? 'bg-green-500' : 'bg-red-500'
        }`}>
          {type === 'success' ? (
            <Check size={14} className="text-white" />
          ) : (
            <AlertCircle size={14} className="text-white" />
          )}
        </div>
        
        <div className="flex-1">
          <p className={`text-sm font-medium ${
            type === 'success' ? 'text-green-300' : 'text-red-300'
          }`}>
            {type === 'success' ? 'Success' : 'Error'}
          </p>
          <p className={`text-sm mt-1 ${
            type === 'success' ? 'text-green-100' : 'text-red-100'
          }`}>
            {message}
          </p>
        </div>
        
        <button
          onClick={() => onClose(id)}
          className={`flex-shrink-0 p-1 rounded hover:bg-black/20 transition-colors ${
            type === 'success' ? 'text-green-300 hover:text-green-200' : 'text-red-300 hover:text-red-200'
          }`}
        >
          <X size={14} />
        </button>
      </div>
    </motion.div>
  );
}

interface NotificationContainerProps {
  notifications: { id: string; type: 'success' | 'error'; message: string }[];
  onClose: (id: string) => void;
}

export function NotificationContainer({ notifications, onClose }: NotificationContainerProps) {
  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      <AnimatePresence>
        {notifications.map((notification) => (
          <Notification
            key={notification.id}
            id={notification.id}
            type={notification.type}
            message={notification.message}
            onClose={onClose}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}
