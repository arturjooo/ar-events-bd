"use client";

import { motion } from "framer-motion";
import { Users, Calendar, TrendingUp, DollarSign, Ticket, BarChart3 } from "lucide-react";

interface DashboardStatsProps {
  bookings: any[];
  loading: boolean;
}

export default function DashboardStats({ bookings, loading }: DashboardStatsProps) {
  const totalBookings = bookings.length;
  const pendingBookings = bookings.filter(b => b.status === 'pending').length;
  const approvedBookings = bookings.filter(b => b.status === 'approved').length;
  const totalRevenue = bookings
    .filter(b => b.status === 'approved')
    .reduce((sum, b) => sum + (b.total_price || 0), 0);
  const totalTicketsSold = bookings
    .filter(b => b.status === 'approved')
    .reduce((sum, b) => sum + (b.ticket_quantity || 1), 0);
  const totalCommission = totalRevenue * 0.1;

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-gray-900/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/30 animate-pulse">
            <div className="h-8 bg-gray-700 rounded w-1/3 mb-3"></div>
            <div className="h-12 bg-gray-700 rounded w-1/2"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="bg-gray-900 rounded-lg p-6 border border-green-500/30"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm mb-1">Total Revenue</p>
              <p className="text-3xl font-bold text-green-400">
                ৳{totalRevenue.toLocaleString()}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-600/20 rounded-lg flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-green-400" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-gray-900 rounded-lg p-6 border border-purple-500/30"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm mb-1">Total Tickets Sold</p>
              <p className="text-3xl font-bold text-purple-400">
                {totalTicketsSold}
              </p>
            </div>
            <div className="w-12 h-12 bg-purple-600/20 rounded-lg flex items-center justify-center">
              <Ticket className="w-6 h-6 text-purple-400" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="bg-gray-900 rounded-lg p-6 border border-yellow-500/30"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm mb-1">Total Commission (10%)</p>
              <p className="text-3xl font-bold text-yellow-400">
                ৳{totalCommission.toLocaleString()}
              </p>
            </div>
            <div className="w-12 h-12 bg-yellow-600/20 rounded-lg flex items-center justify-center">
              <BarChart3 className="w-6 h-6 text-yellow-400" />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Latest Bookings */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="bg-gray-900 rounded-lg p-6 border border-purple-500/30"
      >
        <div className="flex items-center gap-3 mb-6">
          <TrendingUp className="w-5 h-5 text-purple-400" />
          <h3 className="text-xl font-bold text-purple-400">Latest 5 Bookings</h3>
        </div>
        
        <div className="space-y-4">
          {bookings
            .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
            .slice(0, 5)
            .map((booking) => (
              <motion.div
                key={booking.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
                className="bg-black/30 rounded-lg p-4 border border-purple-500/20"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-4 mb-2">
                      <p className="text-white font-semibold">{booking.user_name}</p>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        booking.status === 'approved' 
                          ? 'bg-green-600/20 text-green-400 border border-green-500/30'
                          : 'bg-yellow-600/20 text-yellow-400 border border-yellow-500/30'
                      }`}>
                        {booking.status === 'approved' ? 'Approved' : 'Pending'}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-400">
                      <span>{booking.event_name}</span>
                      <span>•</span>
                      <span>{booking.ticket_quantity || 1} ticket(s)</span>
                      <span>•</span>
                      <span>৳{booking.total_price || 'N/A'}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500">
                      {new Date(booking.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
        
          {bookings.length === 0 && (
            <div className="text-center py-8">
              <Users className="w-12 h-12 text-gray-600 mx-auto mb-3" />
              <p className="text-gray-400">No bookings yet</p>
            </div>
          )}
        </div>
      </motion.div>
    </>
  );
}
