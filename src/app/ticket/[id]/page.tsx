"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useParams } from "next/navigation";
import { Check, X, QrCode, Calendar, MapPin, User, Clock, AlertCircle } from "lucide-react";
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

export default function TicketPage() {
  const params = useParams();
  const ticketId = params.id as string;
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
          <h1 className="text-3xl font-bold text-red-400 mb-4">Invalid Ticket Link</h1>
          <p className="text-gray-300 mb-2">The ticket ID is missing from the URL.</p>
          <p className="text-gray-400 text-sm mb-6">Please check your ticket link and try again.</p>
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
      }
      setLoading(false);
    };

    fetchBooking();
  }, [ticketId]);

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
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <div className="w-24 h-24 bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-6 border border-red-500/30">
            <X className="w-12 h-12 text-red-400" />
          </div>
          <h1 className="text-4xl font-bold text-red-400 mb-4">Invalid Ticket</h1>
          <p className="text-gray-400 text-lg">This ticket ID is not found in our system</p>
          <p className="text-purple-400 font-mono mt-2">{ticketId}</p>
        </motion.div>
      </div>
    );
  }

  // If status is pending, show pending message
  if (booking.status === 'pending') {
    return (
      <div className="min-h-screen bg-black text-white">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
          className="fixed inset-0 bg-gradient-to-br from-purple-900/20 via-black to-purple-900/20 z-0"
        />

        <div className="relative z-10 min-h-screen flex items-center justify-center p-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-2xl w-full"
          >
            <div className="bg-gray-900 rounded-lg p-8 border border-purple-500/30 purple-glow">
              {/* Pending Status Header */}
              <div className="text-center mb-8">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className="w-24 h-24 bg-yellow-900/20 rounded-full flex items-center justify-center mx-auto mb-6 border border-yellow-500/30"
                >
                  <AlertCircle className="w-12 h-12 text-yellow-400" />
                </motion.div>
                
                <h1 className="text-4xl font-bold text-yellow-400 mb-2">Payment Verification Pending</h1>
                <p className="text-gray-400 text-lg">Your payment is being verified</p>
                <p className="text-gray-400">Please check back later</p>
              </div>

              {/* Ticket Details */}
              <div className="space-y-4 mb-8">
                <div className="bg-black/50 rounded-lg p-4">
                  <p className="text-gray-400 text-sm mb-1">Ticket ID</p>
                  <p className="text-xl font-bold text-purple-400 font-mono">{booking.ticket_id}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-black/50 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <User className="text-purple-400" size={16} />
                      <p className="text-gray-400 text-sm">Attendee Name</p>
                    </div>
                    <p className="text-white font-medium">{booking.user_name}</p>
                  </div>

                  <div className="bg-black/50 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Calendar className="text-purple-400" size={16} />
                      <p className="text-gray-400 text-sm">Event</p>
                    </div>
                    <p className="text-white font-medium">{booking.event_name}</p>
                  </div>

                  <div className="bg-black/50 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <QrCode className="text-purple-400" size={16} />
                      <p className="text-gray-400 text-sm">Transaction ID</p>
                    </div>
                    <p className="text-white font-medium">{booking.trx_id}</p>
                  </div>

                  <div className="bg-black/50 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Clock className="text-purple-400" size={16} />
                      <p className="text-gray-400 text-sm">Booking Date</p>
                    </div>
                    <p className="text-white font-medium">{new Date(booking.created_at).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>

              {/* Status Badge */}
              <div className="text-center">
                <div className="inline-flex items-center gap-2 px-6 py-3 rounded-full font-medium bg-yellow-900/30 text-yellow-400 border border-yellow-500/30">
                  <AlertCircle size={20} />
                  <span>Payment Verification in Progress</span>
                </div>
              </div>

              {/* Footer Note */}
              <div className="mt-8 pt-6 border-t border-gray-700 text-center">
                <p className="text-gray-500 text-sm">
                  You will receive your activated ticket on WhatsApp once payment is verified
                </p>
                <p className="text-gray-500 text-sm mt-2">
                  Presented by AR Events BD - Premium Event Ticketing Platform
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  // If status is approved, show full ticket with QR code (similar to verify page)
  return (
    <div className="min-h-screen bg-black text-white">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
        className="fixed inset-0 bg-gradient-to-br from-purple-900/20 via-black to-purple-900/20 z-0"
      />

      <div className="relative z-10 min-h-screen flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-2xl w-full"
        >
          <div className="bg-gray-900 rounded-lg p-8 border border-purple-500/30 purple-glow">
            {/* Status Header */}
            <div className="text-center mb-8">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 bg-green-900/20 border border-green-500/30"
              >
                <Check className="w-12 h-12 text-green-400" />
              </motion.div>
              
              <h1 className="text-4xl font-bold text-green-400 mb-2">Valid</h1>
              <p className="text-gray-400 text-lg">Approved & Confirmed</p>
            </div>

            {/* QR Code */}
            <div className="flex justify-center mb-8">
              <div className="p-6 bg-white rounded-lg">
                <QRCodeSVG 
                  value={booking.ticket_id} 
                  size={200}
                  level="H"
                  includeMargin={true}
                  bgColor="#FFFFFF"
                  fgColor="#000000"
                />
              </div>
            </div>

            {/* Ticket Details */}
            <div className="space-y-4 mb-8">
              <div className="bg-black/50 rounded-lg p-4">
                <p className="text-gray-400 text-sm mb-1">Ticket ID</p>
                <p className="text-xl font-bold text-purple-400 font-mono">{booking.ticket_id}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-black/50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <User className="text-purple-400" size={16} />
                    <p className="text-gray-400 text-sm">Attendee Name</p>
                  </div>
                  <p className="text-white font-medium">{booking.user_name}</p>
                </div>

                <div className="bg-black/50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar className="text-purple-400" size={16} />
                    <p className="text-gray-400 text-sm">Event</p>
                  </div>
                  <p className="text-white font-medium">{booking.event_name}</p>
                </div>

                <div className="bg-black/50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <QrCode className="text-purple-400" size={16} />
                    <p className="text-gray-400 text-sm">Transaction ID</p>
                  </div>
                  <p className="text-white font-medium">{booking.trx_id}</p>
                </div>

                <div className="bg-black/50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="text-purple-400" size={16} />
                    <p className="text-gray-400 text-sm">Booking Date</p>
                  </div>
                  <p className="text-white font-medium">{new Date(booking.created_at).toLocaleDateString()}</p>
                </div>
              </div>
            </div>

            {/* Status Badge */}
            <div className="text-center">
              <div className="inline-flex items-center gap-2 px-6 py-3 rounded-full font-medium bg-green-900/30 text-green-400 border border-green-500/30">
                <Check size={20} />
                <span>Ticket is Valid for Entry</span>
              </div>
            </div>

            {/* Footer Note */}
            <div className="mt-8 pt-6 border-t border-gray-700 text-center">
              <p className="text-gray-500 text-sm">
                Presented by AR Events BD - Premium Event Ticketing Platform
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
