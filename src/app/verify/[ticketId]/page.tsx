"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useParams } from "next/navigation";
import { Check, X, QrCode, Calendar, MapPin, User, Clock, Shield, AlertCircle } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { supabase } from '@/lib/supabaseClient';

interface Booking {
  id: string;
  event_id: number;
  event_name: string;
  user_name: string;
  whatsapp: string;
  trx_id: string;
  ticket_id: string;
  status: 'pending' | 'approved';
  is_checked_in: boolean;
  created_at: string;
}

export default function VerifyTicket() {
  const params = useParams();
  const ticketId = params.ticketId as string;
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  // Check if ticket ID is missing
  if (!ticketId || ticketId === 'undefined') {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="bg-gray-900 rounded-lg p-8 border border-red-500/30 max-w-md w-full mx-4 text-center"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="w-24 h-24 bg-red-600 rounded-full flex items-center justify-center mx-auto mb-6"
          >
            <AlertCircle size={48} className="text-white" />
          </motion.div>
          <h1 className="text-3xl font-bold text-red-400 mb-4">Invalid Verification Link</h1>
          <p className="text-gray-300 mb-2">The ticket ID is missing from the URL.</p>
          <p className="text-gray-400 text-sm mb-6">Please check your verification link and try again.</p>
          <motion.a
            href="/"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="inline-block px-6 py-3 bg-purple-600 rounded-lg hover:bg-purple-700 transition-colors font-semibold"
          >
            Go to Homepage
          </motion.a>
        </motion.div>
      </div>
    );
  }

  useEffect(() => {
    const fetchBooking = async () => {
      const { data, error } = await supabase
        .from('bookings')
        .select('*')
        .eq('ticket_id', ticketId)
        .single();
      
      if (data) {
        setBooking(data);
      } else if (error) {
        console.error('Error fetching booking:', error);
        setError(true);
      } else {
        setError(true);
      }
      setLoading(false);
    };

    fetchBooking();
  }, [ticketId]);

  const handleCheckIn = async () => {
    if (!booking) return;
    
    try {
      // Update booking status to checked-in
      const { error } = await supabase
        .from('bookings')
        .update({ is_checked_in: true })
        .eq('id', booking.id);

      if (error) {
        console.error('Error checking in:', error);
        alert('Error checking in. Please try again.');
      } else {
        setBooking({ ...booking, is_checked_in: true });
      }
    } catch (error) {
      console.error('Unexpected error:', error);
      alert('Error checking in. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="bg-gray-900 rounded-lg p-8 border border-red-500/30 max-w-md w-full mx-4 text-center"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="w-24 h-24 bg-red-600 rounded-full flex items-center justify-center mx-auto mb-6"
          >
            <X size={48} className="text-white" />
          </motion.div>
          <h1 className="text-3xl font-bold text-red-400 mb-4">Invalid Ticket</h1>
          <p className="text-gray-300 mb-2">This ticket is not found in our system.</p>
          <p className="text-gray-400 text-sm">Please check your ticket ID and try again.</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="fixed inset-0 bg-gradient-to-br from-green-900/20 via-black to-green-900/20 z-0"
        />
      </AnimatePresence>
      
      <div className="relative z-10 flex items-center justify-center min-h-screen p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="bg-gray-900 rounded-lg p-8 border border-green-500/30 max-w-2xl w-full"
        >
          <div className="text-center mb-6">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.3, delay: 0.2 }}
              className={`w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 ${
                booking.is_checked_in 
                  ? 'bg-red-600' 
                  : booking.status === 'approved' 
                    ? 'bg-green-600' 
                    : 'bg-red-600'
              }`}
            >
              {booking.is_checked_in ? (
                <X size={48} className="text-white" />
              ) : booking.status === 'approved' ? (
                <Check size={48} className="text-white" />
              ) : (
                <X size={48} className="text-white" />
              )}
            </motion.div>
            
            <h1 className="text-3xl font-bold mb-4">
              {booking.is_checked_in ? (
                <span className="text-red-400">TICKET ALREADY USED</span>
              ) : booking.status === 'approved' ? (
                <span className="text-green-400">Payment Verified</span>
              ) : (
                <span className="text-red-400">Access Denied</span>
              )}
            </h1>
            
            {booking.status === 'approved' && !booking.is_checked_in && (
              <p className="text-gray-400 mb-4">Ready for entry confirmation</p>
            )}
            {booking.is_checked_in && (
              <p className="text-red-400 mb-4 font-semibold">This ticket has already been used for entry</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="space-y-4">
              <div>
                <p className="text-gray-400 text-sm mb-1">Event Name</p>
                <p className="text-white font-semibold text-lg">{booking.event_name}</p>
              </div>
              <div>
                <p className="text-gray-400 text-sm mb-1">Ticket ID</p>
                <p className="text-white font-mono">{booking.ticket_id}</p>
              </div>
              <div>
                <p className="text-gray-400 text-sm mb-1">Booking Date</p>
                <p className="text-white font-medium">{new Date(booking.created_at).toLocaleDateString()}</p>
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <p className="text-gray-400 text-sm mb-1">Attendee Name</p>
                <p className="text-white font-semibold text-lg">{booking.user_name}</p>
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
                <p className="text-gray-400 text-sm mb-1">Payment Status</p>
                <p className={`font-semibold ${
                  booking.status === 'approved' ? 'text-green-400' : 'text-yellow-400'
                }`}>
                  {booking.status === 'approved' ? '✅ Approved' : '⏳ Pending'}
                </p>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-700 pt-6">
            <div className="p-4 bg-white rounded-lg mb-4">
              <QRCodeSVG 
                value={`${window.location.origin}/verify/${booking.ticket_id}`} 
                size={200}
                level="H"
                includeMargin={true}
                bgColor="#FFFFFF"
                fgColor="#000000"
              />
            </div>
            
            {/* Check-In Button - Admin Only */}
            {booking.status === 'approved' && !booking.is_checked_in && (
              <div className="space-y-4">
                <div className="bg-yellow-900/20 border border-yellow-500/30 rounded-lg p-4">
                  <p className="text-yellow-400 text-sm font-medium text-center">
                    ⚠️ Admin Only: Confirm Entry for This Ticket
                  </p>
                </div>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleCheckIn}
                  className="w-full py-3 bg-green-600 rounded-lg hover:bg-green-700 transition-colors font-semibold text-white flex items-center justify-center gap-2"
                >
                  <Check size={20} />
                  Confirm Entry / Check-In
                </motion.button>
              </div>
            )}
            
            {/* Already Used Warning */}
            {booking.is_checked_in && (
              <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-6">
                <div className="flex items-center justify-center gap-3 mb-2">
                  <X size={24} className="text-red-400" />
                  <h3 className="text-red-400 font-bold text-lg">TICKET ALREADY USED</h3>
                  <X size={24} className="text-red-400" />
                </div>
                <p className="text-red-300 text-center">
                  This ticket was already used for entry on {new Date(booking.created_at).toLocaleDateString()}
                </p>
                <p className="text-red-400 text-sm text-center mt-2">
                  Duplicate entry attempts are logged and monitored
                </p>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
