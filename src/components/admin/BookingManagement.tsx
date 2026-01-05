"use client";

import { motion } from "framer-motion";
import { Check, X, MessageCircle, QrCode, Users, Calendar, MapPin, Trash2, Plus, Music, AlertCircle, TrendingUp, DollarSign, Ticket, BarChart3 } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";

interface Booking {
  id: string;
  event_id: number;
  event_name: string;
  user_name: string;
  whatsapp: string;
  trx_id: string;
  ticket_id: string;
  status: 'pending' | 'approved';
  checked_in: boolean;
  ticket_quantity?: number;
  total_price?: number;
  created_at: string;
}

interface BookingManagementProps {
  bookings: Booking[];
  loading: boolean;
  onDeleteBooking: (id: string) => void;
  onApproveAndSend: (booking: Booking) => void;
  searchQuery: string;
}

export default function BookingManagement({ bookings, loading, onDeleteBooking, onApproveAndSend, searchQuery }: BookingManagementProps) {
  const filteredBookings = bookings.filter(booking =>
    (booking.user_name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (booking.event_name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (booking.ticket_id || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (booking.whatsapp || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-4">
      {loading ? (
        Array.from({ length: 5 }).map((_, index) => (
          <div key={index} className="bg-gray-900/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/30 animate-pulse">
            <div className="h-6 bg-gray-700 rounded w-3/4 mb-4"></div>
            <div className="h-4 bg-gray-700 rounded w-1/2 mb-2"></div>
            <div className="h-4 bg-gray-700 rounded w-2/3 mb-4"></div>
            <div className="flex gap-2">
              <div className="h-8 bg-gray-700 rounded w-20"></div>
              <div className="h-8 bg-gray-700 rounded w-20"></div>
            </div>
          </div>
        ))
      ) : (
        filteredBookings.map((booking, index) => (
          <motion.div
            key={booking.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.6 + index * 0.05 }}
            className="bg-gray-900 rounded-lg p-6 border border-purple-500/30 hover:border-purple-500 transition-all"
          >
            <div className="flex flex-col lg:flex-row gap-6">
              <div className="flex-1 space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-xl font-bold text-purple-400 mb-1">{booking.event_name}</h3>
                    <p className="text-gray-400 text-sm">Ticket ID: {booking.ticket_id}</p>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                    booking.status === 'approved' 
                      ? 'bg-green-900/30 text-green-400 border border-green-500/30' 
                      : 'bg-yellow-900/30 text-yellow-400 border border-yellow-500/30'
                  }`}>
                    {booking.status === 'approved' ? 'Approved' : 'Pending'}
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <p className="text-gray-400 text-sm mb-1">Event Name</p>
                    <p className="text-white font-medium">{booking.event_name}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm mb-1">Attendee Name</p>
                    <p className="text-white font-medium">{booking.user_name}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm mb-1">WhatsApp</p>
                    <p className="text-white font-medium">{booking.whatsapp}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm mb-1">Transaction ID</p>
                    <p className="text-white font-mono text-sm">{booking.trx_id}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm mb-1">Booking Date</p>
                    <p className="text-white font-medium">{new Date(booking.created_at).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>

              <div className="flex flex-col items-center gap-4">
                <div className="p-4 bg-white rounded-lg">
                  {booking.ticket_id ? (
                    <QRCodeSVG 
                      value={`${window.location.origin}/verify/${booking.ticket_id}`} 
                      size={120}
                      level="H"
                      includeMargin={true}
                      bgColor="#FFFFFF"
                      fgColor="#000000"
                    />
                  ) : (
                    <div className="w-[120px] h-[120px] bg-gray-200 rounded-lg flex items-center justify-center">
                      <AlertCircle className="w-8 h-8 text-red-500" />
                    </div>
                  )}
                </div>
                
                {booking.status === 'pending' && (
                  <div className="flex gap-2">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => onApproveAndSend(booking)}
                      className="flex items-center gap-2 px-4 py-2 bg-green-600 rounded-lg hover:bg-green-700 transition-colors font-medium"
                    >
                      <MessageCircle size={16} />
                      Approve & Send to WhatsApp
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => onDeleteBooking(booking.id)}
                      className="flex items-center gap-2 px-4 py-2 bg-red-600 rounded-lg hover:bg-red-700 transition-colors font-medium"
                    >
                      <Trash2 size={16} />
                      Delete
                    </motion.button>
                  </div>
                )}
                
                {booking.status === 'approved' && (
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 text-green-400 font-medium">
                      <Check size={16} />
                      Already Approved
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => onDeleteBooking(booking.id)}
                      className="flex items-center gap-2 px-4 py-2 bg-red-600 rounded-lg hover:bg-red-700 transition-colors font-medium"
                    >
                      <Trash2 size={16} />
                      Delete
                    </motion.button>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        ))
      )}

      {filteredBookings.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12"
        >
          <p className="text-gray-400 text-lg">No bookings found</p>
        </motion.div>
      )}
    </div>
  );
}
