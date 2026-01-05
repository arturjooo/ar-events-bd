"use client";

import { useState, useMemo, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { motion } from 'framer-motion';
import { QrCode, Lock, CheckCircle, XCircle, RotateCcw, Shield } from 'lucide-react';
import { Scanner, IDetectedBarcode } from '@yudiel/react-qr-scanner';
import { supabase } from '@/lib/supabaseClient';

interface Booking {
  id: string;
  event_name: string;
  user_name: string;
  whatsapp: string;
  ticket_id: string;
  status: 'pending' | 'approved';
  checked_in: boolean;
  created_at: string;
}

export default function GateCheck() {
  const [password, setPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [error, setError] = useState('');
  const [scanStatus, setScanStatus] = useState<'idle' | 'success' | 'error' | 'already_used' | 'payment_pending'>('idle');
  const [scanResult, setScanResult] = useState<Booking | null>(null);
  const [isScanning, setIsScanning] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [lastScanned, setLastScanned] = useState<string>('');
  const [manualId, setManualId] = useState<string>('');

  useEffect(() => {
    setMounted(true);
  }, []);

  // Robust ID extraction function
  const cleanScannedText = (text: string): string => {
    console.log('Raw scanned text:', text);
    
    let cleaned = text;
    
    // If it's a URL, extract everything after the last /
    if (text.includes('http')) {
      const parts = text.split('/');
      cleaned = parts[parts.length - 1];
    }
    
    // Remove any hidden characters, spaces, or newlines
    cleaned = cleaned.replace(/[^a-zA-Z0-9-]/g, '');
    
    // Convert to uppercase to match database records
    cleaned = cleaned.toUpperCase();
    
    console.log('Cleaned ID:', cleaned);
    return cleaned;
  };

  // Manual verification function
  const handleManualVerify = async () => {
    if (!manualId.trim()) return;
    
    const cleanedId = cleanScannedText(manualId);
    console.log('Manual verification - Searching for Ticket ID:', cleanedId);
    console.log('Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
    
    // Simplified query using ilike for flexibility
    const { data, error } = await supabase
      .from('bookings')
      .select('*')
      .ilike('ticket_id', cleanedId);

    console.error('Manual Supabase Query Error:', error);
    console.log('Manual Query Result:', data);

    // Check if data has at least one item
    if (error || !data || data.length === 0) {
      setScanStatus('error');
      setScanResult(null);
      return;
    }

    // Take the first item
    const booking = data[0];

    // Check payment status first
    if (booking.status === 'pending') {
      setScanStatus('payment_pending');
      setScanResult(booking);
      return;
    }

    // If status is approved, check if already checked in
    if (booking.checked_in) {
      setScanStatus('already_used');
      setScanResult(booking);
      return;
    }

    // Valid approved ticket - mark as checked in
    const { error: updateError } = await supabase
      .from('bookings')
      .update({ checked_in: true })
      .eq('id', booking.id)
      .select();

    if (updateError) {
      console.log('Manual Update error:', updateError);
      setScanStatus('error');
      setScanResult(null);
      return;
    }

    setScanStatus('success');
    setScanResult(booking);
    setManualId(''); // Clear manual input
  };

  // Dynamic import for Scanner to prevent hydration issues
  const Scanner = useMemo(() => {
    if (!mounted) return null;
    return dynamic(() => import('@yudiel/react-qr-scanner').then(mod => ({ default: mod.Scanner })), {
      ssr: false,
      loading: () => (
        <div className="w-full h-[400px] bg-gray-800 rounded-lg flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
            <p className="text-gray-400">Loading Scanner...</p>
          </div>
        </div>
      )
    });
  }, [mounted]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'dana111') {
      setIsAuthenticated(true);
      setError('');
    } else {
      setError('Invalid password. Please try again.');
      setPassword('');
    }
  };

  const handleScan = async (detectedCodes: IDetectedBarcode[]) => {
    if (!isScanning) return;

    try {
      const result = detectedCodes[0]?.rawValue;
      
      if (!result) return;
      
      // Store last scanned for debug display
      setLastScanned(result);
      
      // Use robust ID extraction
      const ticketId = cleanScannedText(result);
      
      // Pause scanning for 2 seconds
      setIsScanning(false);
      
      console.log('Searching for Ticket ID:', ticketId);
      console.log('Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
      
      // Simplified query using ilike for flexibility
      const { data, error } = await supabase
        .from('bookings')
        .select('*')
        .ilike('ticket_id', ticketId);

      console.error('Supabase Query Error:', error);
      console.log('Query Result:', data);

      // Check if data has at least one item
      if (error || !data || data.length === 0) {
        setScanStatus('error');
        setScanResult(null);
        
        // Wait 2 seconds before allowing next scan
        setTimeout(() => {
          setIsScanning(true);
        }, 2000);
        return;
      }

      // Take the first item
      const booking = data[0];

      // Check payment status first
      if (booking.status === 'pending') {
        setScanStatus('payment_pending');
        setScanResult(booking);
        
        // Wait 2 seconds before allowing next scan
        setTimeout(() => {
          setIsScanning(true);
        }, 2000);
        return;
      }

      // If status is approved, check if already checked in
      if (booking.checked_in) {
        setScanStatus('already_used');
        setScanResult(booking);
        
        // Wait 2 seconds before allowing next scan
        setTimeout(() => {
          setIsScanning(true);
        }, 2000);
        return;
      }

      // Valid approved ticket - mark as checked in
      const { error: updateError } = await supabase
        .from('bookings')
        .update({ checked_in: true })
        .eq('id', booking.id)
        .select();

      if (updateError) {
        console.log('Update error:', updateError);
        setScanStatus('error');
        setScanResult(null);
        setIsScanning(false);
        return;
      }

      setScanStatus('success');
      setScanResult(booking);
      
      // Wait 2 seconds before allowing next scan
      setTimeout(() => {
        setIsScanning(true);
      }, 2000);

    } catch (err) {
      console.log('Scan error:', err);
      setScanStatus('error');
      setScanResult(null);
      setIsScanning(false);
    }
  };

  const resetScanner = () => {
    setScanResult(null);
    setScanStatus('idle');
    setIsScanning(true);
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-gray-900 rounded-2xl p-8 border border-purple-500/30 max-w-md w-full"
        >
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="w-20 h-20 bg-gradient-to-br from-purple-600 to-purple-800 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-purple-500/50"
            >
              <Shield className="w-10 h-10 text-white" />
            </motion.div>
            <h1 className="text-2xl font-bold text-purple-400 mb-2">Gate Check Access</h1>
            <p className="text-gray-400">Enter password to access QR scanner</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-purple-400" size={20} />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                className="w-full pl-12 pr-4 py-4 bg-black border border-purple-500/30 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 transition-all"
                required
              />
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-red-600/20 border border-red-500/50 rounded-lg p-3 text-red-400 text-sm"
              >
                {error}
              </motion.div>
            )}

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              className="w-full py-4 bg-gradient-to-r from-purple-600 to-purple-800 rounded-xl font-semibold text-white shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50 transition-all"
            >
              Access Scanner
            </motion.button>
          </form>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="bg-gray-900 border-b border-purple-500/30 p-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <QrCode className="w-8 h-8 text-purple-400" />
            <h1 className="text-2xl font-bold text-purple-400">Gate Check Scanner</h1>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={resetScanner}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 rounded-lg hover:bg-purple-700 transition-colors font-medium"
          >
            <RotateCcw size={16} />
            Reset Scanner
          </motion.button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-6">
        {scanStatus === 'idle' && (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-xl font-semibold text-purple-400 mb-2">Scan QR Code</h2>
              <p className="text-gray-400">Position the QR code within the camera frame</p>
            </div>

            <div className="bg-gray-900 rounded-2xl p-4 border border-purple-500/30">
              {mounted && Scanner && (
                <Scanner
                  onScan={handleScan}
                  styles={{
                    container: {
                      width: '100%',
                      height: '400px',
                      borderRadius: '12px',
                      overflow: 'hidden',
                    },
                    video: {
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                    },
                  }}
                />
              )}
            </div>
            
            {/* Manual Entry Fallback */}
            <div className="bg-gray-900 rounded-2xl p-4 border border-purple-500/30">
              <h3 className="text-lg font-semibold text-purple-400 mb-3">Manual Entry</h3>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={manualId}
                  onChange={(e) => setManualId(e.target.value)}
                  placeholder="Enter ticket ID (e.g., LALON-TKT-123)"
                  className="flex-1 px-4 py-2 bg-black border border-purple-500/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 transition-all"
                />
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleManualVerify}
                  className="px-6 py-2 bg-purple-600 rounded-lg hover:bg-purple-700 transition-colors font-medium text-white"
                >
                  Verify Manually
                </motion.button>
              </div>
            </div>
          </div>
        )}

        {scanStatus === 'success' && scanResult && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gradient-to-br from-green-900/50 to-green-800/50 rounded-2xl p-8 border border-green-500/50 text-center"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="w-24 h-24 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-green-500/50"
            >
              <CheckCircle className="w-12 h-12 text-white" />
            </motion.div>
            <h2 className="text-3xl font-bold text-green-400 mb-4">VALID - WELCOME</h2>
            <div className="space-y-2 text-white">
              <p className="text-xl font-semibold">{scanResult.user_name}</p>
              <p className="text-gray-300">{scanResult.event_name}</p>
              <p className="text-sm text-gray-400">Ticket ID: {scanResult.ticket_id}</p>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={resetScanner}
              className="mt-6 px-6 py-3 bg-green-600 rounded-lg hover:bg-green-700 transition-colors font-medium"
            >
              Scan Next Ticket
            </motion.button>
          </motion.div>
        )}

        {scanStatus === 'already_used' && scanResult && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gradient-to-br from-orange-900/50 to-orange-800/50 rounded-2xl p-8 border border-orange-500/50 text-center"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="w-24 h-24 bg-orange-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-orange-500/50"
            >
              <XCircle className="w-12 h-12 text-white" />
            </motion.div>
            <h2 className="text-3xl font-bold text-orange-400 mb-4">ALREADY USED</h2>
            <div className="space-y-2 text-white">
              <p className="text-xl font-semibold">{scanResult.user_name}</p>
              <p className="text-gray-300">{scanResult.event_name}</p>
              <p className="text-sm text-gray-400">Ticket ID: {scanResult.ticket_id}</p>
              <p className="text-sm text-orange-300 mt-2">This ticket was already checked in</p>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={resetScanner}
              className="mt-6 px-6 py-3 bg-orange-600 rounded-lg hover:bg-orange-700 transition-colors font-medium"
            >
              Scan Next Ticket
            </motion.button>
          </motion.div>
        )}

        {scanStatus === 'payment_pending' && scanResult && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gradient-to-br from-yellow-900/50 to-yellow-800/50 rounded-2xl p-8 border border-yellow-500/50 text-center"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="w-24 h-24 bg-yellow-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-yellow-500/50"
            >
              <XCircle className="w-12 h-12 text-white" />
            </motion.div>
            <h2 className="text-3xl font-bold text-yellow-400 mb-4">PAYMENT PENDING</h2>
            <div className="space-y-2 text-white">
              <p className="text-xl font-semibold">{scanResult.user_name}</p>
              <p className="text-gray-300">{scanResult.event_name}</p>
              <p className="text-sm text-gray-400">Ticket ID: {scanResult.ticket_id}</p>
              <p className="text-sm text-yellow-300 mt-2">This ticket payment is still pending</p>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={resetScanner}
              className="mt-6 px-6 py-3 bg-yellow-600 rounded-lg hover:bg-yellow-700 transition-colors font-medium"
            >
              Scan Next Ticket
            </motion.button>
          </motion.div>
        )}

        {scanStatus === 'error' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gradient-to-br from-red-900/50 to-red-800/50 rounded-2xl p-8 border border-red-500/50 text-center"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="w-24 h-24 bg-red-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-red-500/50"
            >
              <XCircle className="w-12 h-12 text-white" />
            </motion.div>
            <h2 className="text-3xl font-bold text-red-400 mb-4">INVALID TICKET</h2>
            <p className="text-gray-300 mb-6">The QR code is not valid or the ticket was not found</p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={resetScanner}
              className="px-6 py-3 bg-red-600 rounded-lg hover:bg-red-700 transition-colors font-medium"
            >
              Try Again
            </motion.button>
          </motion.div>
        )}
      </div>
      
      {/* Debug Display */}
      {lastScanned && (
        <div className="fixed bottom-4 left-4 bg-gray-800/90 text-gray-300 text-xs p-3 rounded border border-gray-600 max-w-md">
          <div className="space-y-1">
            <div><strong>Scanned Raw Text:</strong> {lastScanned}</div>
            <div><strong>Cleaned ID:</strong> {cleanScannedText(lastScanned)}</div>
          </div>
        </div>
      )}
    </div>
  );
}
