"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Shield, Lock } from "lucide-react";

export default function AdminAuth() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password === "admin123") {
      // Store admin session in localStorage
      localStorage.setItem('adminAuth', 'true');
      router.push('/admin-panel');
    } else {
      setError("Invalid password. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="bg-gray-900 rounded-lg p-8 border border-purple-500/30 purple-glow max-w-md w-full mx-4"
      >
        <div className="flex flex-col items-center mb-6">
          <Shield className="w-16 h-16 text-purple-400 mb-4" />
          <h1 className="text-2xl font-bold text-purple-400">Admin Access</h1>
          <p className="text-gray-400 text-sm">Enter password to access admin panel</p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-purple-400" size={20} />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-black border border-purple-500/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 transition-all"
              placeholder="Enter admin password"
              required
            />
          </div>
          
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-red-400 text-sm text-center"
            >
              {error}
            </motion.div>
          )}
          
          <motion.button
            type="submit"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full py-3 bg-purple-600 rounded-lg hover:bg-purple-700 transition-colors font-semibold flex items-center justify-center gap-2"
          >
            <Shield size={20} />
            Access Admin Panel
          </motion.button>
        </form>
      </motion.div>
    </div>
  );
}
