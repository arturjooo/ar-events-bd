"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Search, Check, X, MessageCircle, QrCode, Users, Calendar, MapPin, Trash2, Plus, Music, AlertCircle, TrendingUp, DollarSign, Ticket, BarChart3 } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { supabase } from '@/lib/supabaseClient';
import EventEditModal from './event-edit-modal';
import BandEditModal from './band-edit-modal';
import { NotificationContainer } from '@/components/notification';
import { useNotifications } from '@/hooks/useNotifications';

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

interface Event {
  id: number;
  name: string;
  price: number;
  venue: string;
  image_url: string;
  date_time: string;
  description: string;
  status: 'approved' | 'pending';
  is_band_concert: boolean;
  band_name: string | null;
  available_tickets?: number;
}

interface Band {
  id: number;
  name: string;
  story: string;
  image_url: string;
  bg_image_url: string;
}

export default function AdminPanel() {
  const router = useRouter();
  const { notifications, removeNotification, showSuccess, showError } = useNotifications();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [pendingEvents, setPendingEvents] = useState<Event[]>([]);
  const [allEvents, setAllEvents] = useState<Event[]>([]);
  const [bands, setBands] = useState<Band[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<'bookings' | 'events' | 'all-events' | 'bands' | 'dashboard'>('bookings');
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [editingBand, setEditingBand] = useState<Band | null>(null);
  const [showEventModal, setShowEventModal] = useState(false);
  const [showBandModal, setShowBandModal] = useState(false);
  const [deletingEventId, setDeletingEventId] = useState<number | null>(null);
  const [deletingBandId, setDeletingBandId] = useState<number | null>(null);

  useEffect(() => {
    // Check authentication
    const isAuthenticated = localStorage.getItem('adminAuth');
    if (!isAuthenticated) {
      router.push('/admin-panel/auth');
      return;
    }

    // Load all data from Supabase
    const fetchData = async () => {
      try {
        // Fetch bookings
        const { data: bookingsData, error: bookingsError } = await supabase
          .from('bookings')
          .select('*');
        
        if (bookingsError) {
          console.error('Error fetching bookings:', bookingsError);
          setBookings([]);
        } else if (bookingsData) {
          // Ensure bookings have required fields with defaults
          const processedBookings = bookingsData.map(booking => ({
            ...booking,
            ticket_quantity: booking.ticket_quantity || 1,
            total_price: booking.total_price || 0,
            checked_in: booking.checked_in || false
          }));
          setBookings(processedBookings);
        }

        // Fetch pending events
        const { data: pendingEventsData, error: pendingEventsError } = await supabase
          .from('events')
          .select('*')
          .eq('status', 'pending');
        
        if (pendingEventsError) {
          console.error('Error fetching pending events:', pendingEventsError);
          setPendingEvents([]);
        } else if (pendingEventsData) {
          // Ensure pending events have required fields with defaults
          const processedPendingEvents = pendingEventsData.map(event => ({
            ...event,
            total_tickets: event.total_tickets || 100,
            available_tickets: event.available_tickets || event.total_tickets || 100,
            image_url: event.image_url || "/api/placeholder/400/250"
          }));
          setPendingEvents(processedPendingEvents);
        }

        // Fetch all events
        const { data: allEventsData, error: allEventsError } = await supabase
          .from('events')
          .select('*');
        
        if (allEventsError) {
          console.error('Error fetching all events:', allEventsError);
          setAllEvents([]);
        } else if (allEventsData) {
          // Ensure all events have required fields with defaults
          const processedAllEvents = allEventsData.map(event => ({
            ...event,
            total_tickets: event.total_tickets || 100,
            available_tickets: event.available_tickets || event.total_tickets || 100,
            image_url: event.image_url || "/api/placeholder/400/250"
          }));
          setAllEvents(processedAllEvents);
        }

        // Fetch bands
        const { data: bandsData, error: bandsError } = await supabase
          .from('bands')
          .select('*');
        
        if (bandsError) {
          console.error('Error fetching bands:', bandsError);
          setBands([]);
        } else if (bandsData) {
          setBands(bandsData);
        }
      } catch (err) {
        console.error('Unexpected error fetching admin data:', err);
        // Set empty arrays on critical error
        setBookings([]);
        setPendingEvents([]);
        setAllEvents([]);
        setBands([]);
      }
    };

    fetchData();
  }, [router]);

  const handleApproveEvent = async (eventId: number) => {
    const eventToApprove = pendingEvents.find(e => e.id === eventId);
    if (!eventToApprove) return;

    try {
      // Update event status to approved
      const { error: updateError } = await supabase
        .from('events')
        .update({ status: 'approved' })
        .eq('id', eventId);

      if (updateError) {
        console.error('Error approving event:', updateError);
        alert('Error approving event. Please try again.');
        return;
      }

      // Refresh pending events
      const { data: pendingEventsData } = await supabase
        .from('events')
        .select('*')
        .eq('status', 'pending');
      
      if (pendingEventsData) {
        setPendingEvents(pendingEventsData);
      }

      console.log('Event approved successfully');
    } catch (error) {
      console.error('Unexpected error:', error);
      alert('Error approving event. Please try again.');
    }
  };

  const handleDeleteBooking = async (bookingId: string) => {
    if (!confirm('Are you sure you want to delete this booking?')) return;
    
    try {
      const { error } = await supabase
        .from('bookings')
        .delete()
        .eq('id', bookingId);

      if (error) {
        console.error('Error deleting booking:', error);
        alert('Error deleting booking. Please try again.');
      } else {
        // Instantly update local state
        setBookings(prev => prev.filter(booking => booking.id !== bookingId));
        showSuccess('Booking deleted successfully!');
      }
    } catch (error) {
      console.error('Unexpected error:', error);
      alert('Error deleting booking. Please try again.');
    }
  };

  const handleDeleteEvent = async (eventId: number) => {
    if (!confirm('Are you sure you want to delete this event? This action cannot be undone.')) return;
    
    setDeletingEventId(eventId);
    
    try {
      const { error } = await supabase
        .from('events')
        .delete()
        .eq('id', eventId);

      if (error) {
        console.error('Error deleting event:', error);
        showError('Error deleting event. Please try again.');
      } else {
        // Instantly update local state
        setAllEvents(prev => prev.filter(event => event.id !== eventId));
        setPendingEvents(prev => prev.filter(event => event.id !== eventId));
        showSuccess('Event deleted successfully!');
      }
    } catch (error) {
      console.error('Unexpected error:', error);
      showError('Error deleting event. Please try again.');
    } finally {
      setDeletingEventId(null);
    }
  };

  const handleApproveAndSend = async (booking: Booking) => {
    // Validate WhatsApp number exists
    if (!booking.whatsapp) {
      alert('WhatsApp number not found for this booking.');
      return;
    }

    // Validate ticket ID exists
    if (!booking.ticket_id) {
      alert('Ticket ID not found for this booking.');
      return;
    }

    const message = encodeURIComponent(
      `🎫 Your ticket has been approved!\n\n` +
      `Event: ${booking.event_name}\n` +
      `Ticket ID: ${booking.ticket_id}\n` +
      `Name: ${booking.user_name}\n` +
      `Status: ✅ Approved & Confirmed\n\n` +
      `View your ticket: ${window.location.origin}/ticket/${booking.ticket_id}\n\n` +
      `Thank you for choosing AR Events BD!`
    );
    
    const whatsappUrl = `https://wa.me/${booking.whatsapp.replace(/^0/, '880')}?text=${message}`;
    window.open(whatsappUrl, '_blank');

    try {
      // Update booking status to approved
      const { error: bookingError } = await supabase
        .from('bookings')
        .update({ status: 'approved' })
        .eq('id', booking.id);

      if (bookingError) {
        console.error('Error approving booking:', bookingError);
        alert('Error approving booking. Please try again.');
        return;
      }

      // Update event inventory - decrement available_tickets
      const ticketQuantity = booking.ticket_quantity || 1;
      const currentEvent = allEvents.find(e => e.id === booking.event_id);
      if (currentEvent) {
        const newAvailableTickets = Math.max(0, (currentEvent.available_tickets || 0) - ticketQuantity);
        const { error: inventoryError } = await supabase
          .from('events')
          .update({ available_tickets: newAvailableTickets })
          .eq('id', booking.event_id);

        if (inventoryError) {
          console.error('Error updating inventory:', inventoryError);
          // Don't fail the approval, just log the error
        }
      }

      // Update local state instantly
      setBookings(prev => prev.map(b => 
        b.id === booking.id ? { ...b, status: 'approved' } : b
      ));
      
      setAllEvents(prev => prev.map(e => 
        e.id === booking.event_id 
          ? { ...e, available_tickets: Math.max(0, (e.available_tickets || 0) - ticketQuantity) }
          : e
      ));
      
      showSuccess('Booking approved and inventory updated!');
    } catch (error) {
      console.error('Unexpected error:', error);
      alert('Error approving booking. Please try again.');
    }
  };

  const handleEditEvent = (event: Event) => {
    setEditingEvent(event);
    setShowEventModal(true);
  };

  const handleSaveEvent = async (updatedEvent: Event) => {
    try {
      const { error } = await supabase
        .from('events')
        .update({
          name: updatedEvent.name,
          price: updatedEvent.price,
          venue: updatedEvent.venue,
          image_url: updatedEvent.image_url,
          date_time: updatedEvent.date_time,
          description: updatedEvent.description,
          is_band_concert: updatedEvent.is_band_concert,
          band_name: updatedEvent.band_name
        })
        .eq('id', updatedEvent.id);

      if (error) {
        console.error('Error updating event:', error);
        showError('Error updating event. Please try again.');
      } else {
        // Refresh all events
        const { data: allEventsData } = await supabase
          .from('events')
          .select('*');
        if (allEventsData) {
          setAllEvents(allEventsData);
          setPendingEvents(allEventsData.filter(e => e.status === 'pending'));
        }
        setShowEventModal(false);
        setEditingEvent(null);
        showSuccess('Event updated successfully!');
      }
    } catch (error) {
      console.error('Unexpected error:', error);
      showError('Error updating event. Please try again.');
    }
  };

  const handleEditBand = (band: Band) => {
    setEditingBand(band);
    setShowBandModal(true);
  };

  const handleAddBand = () => {
    setEditingBand({
      id: 0,
      name: "",
      story: "",
      image_url: "",
      bg_image_url: ""
    });
    setShowBandModal(true);
  };

  const handleSaveBand = async (updatedBand: Band) => {
    try {
      if (updatedBand.id) {
        // Update existing band
        const { error } = await supabase
          .from('bands')
          .update({
            name: updatedBand.name,
            story: updatedBand.story,
            image_url: updatedBand.image_url,
            bg_image_url: updatedBand.bg_image_url
          })
          .eq('id', updatedBand.id);

        if (error) {
          console.error('Error updating band:', error);
          showError('Error updating band. Please try again.');
        } else {
          // Refresh bands
          const { data: bandsData } = await supabase
            .from('bands')
            .select('*');
          if (bandsData) {
            setBands(bandsData);
          }
          setShowBandModal(false);
          setEditingBand(null);
          showSuccess('Band updated successfully!');
        }
      } else {
        // Add new band
        const { error } = await supabase
          .from('bands')
          .insert([{
            name: updatedBand.name,
            story: updatedBand.story,
            image_url: updatedBand.image_url,
            bg_image_url: updatedBand.bg_image_url
          }]);

        if (error) {
          console.error('Error adding band:', error);
          showError('Error adding band. Please try again.');
        } else {
          // Refresh bands
          const { data: bandsData } = await supabase
            .from('bands')
            .select('*');
          if (bandsData) {
            setBands(bandsData);
          }
          setShowBandModal(false);
          setEditingBand(null);
          showSuccess('Band added successfully!');
        }
      }
    } catch (error) {
      console.error('Unexpected error:', error);
      showError('Error saving band. Please try again.');
    }
  };

  const handleDeleteBand = async (bandId: number) => {
    if (!confirm('Are you sure you want to delete this band? This action cannot be undone.')) return;
    
    setDeletingBandId(bandId);
    
    try {
      const { error } = await supabase
        .from('bands')
        .delete()
        .eq('id', bandId);

      if (error) {
        console.error('Error deleting band:', error);
        showError('Error deleting band. Please try again.');
      } else {
        // Refresh bands
        const { data: bandsData } = await supabase
          .from('bands')
          .select('*');
        if (bandsData) {
          setBands(bandsData);
        }
        showSuccess('Band deleted successfully!');
      }
    } catch (error) {
      console.error('Unexpected error:', error);
      showError('Error deleting band. Please try again.');
    } finally {
      setDeletingBandId(null);
    }
  };

  const filteredBookings = bookings.filter(booking =>
    (booking.user_name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (booking.event_name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (booking.ticket_id || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (booking.whatsapp || '').includes(searchQuery)
  );

  const filteredPendingEvents = pendingEvents.filter(event =>
    event.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    event.venue.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-black text-white">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
        className="fixed inset-0 bg-gradient-to-br from-purple-900/20 via-black to-purple-900/20 z-0"
      />

      <div className="relative z-10">
        <motion.header
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="py-8 px-6 border-b border-purple-500/30"
        >
          <div className="max-w-7xl mx-auto">
            <h1 className="text-4xl font-bold text-center mb-6" style={{ color: "#A855F7" }}>
              Admin Panel
            </h1>
            
            {/* Tab Navigation */}
            <div className="flex justify-center mb-6">
              <div className="bg-gray-900 rounded-lg p-1 border border-purple-500/30">
                <button
                  onClick={() => setActiveTab('dashboard')}
                  className={`px-6 py-2 rounded-md transition-colors font-medium ${
                    activeTab === 'dashboard'
                      ? 'bg-purple-600 text-white'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  📊 Dashboard
                </button>
                <button
                  onClick={() => setActiveTab('bookings')}
                  className={`px-6 py-2 rounded-md transition-colors font-medium ${
                    activeTab === 'bookings'
                      ? 'bg-purple-600 text-white'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  Manage Bookings
                </button>
                <button
                  onClick={() => setActiveTab('events')}
                  className={`px-6 py-2 rounded-md transition-colors font-medium ${
                    activeTab === 'events'
                      ? 'bg-purple-600 text-white'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  Event Requests
                </button>
                <button
                  onClick={() => setActiveTab('all-events')}
                  className={`px-6 py-2 rounded-md transition-colors font-medium ${
                    activeTab === 'all-events'
                      ? 'bg-purple-600 text-white'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  All Events
                </button>
                <button
                  onClick={() => setActiveTab('bands')}
                  className={`px-6 py-2 rounded-md transition-colors font-medium ${
                    activeTab === 'bands'
                      ? 'bg-purple-600 text-white'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  Manage Bands
                </button>
              </div>
            </div>
            
            <div className="max-w-2xl mx-auto">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-purple-400" size={20} />
                <input
                  type="text"
                  placeholder={`Search ${activeTab === 'bookings' ? 'bookings' : activeTab === 'events' ? 'event requests' : activeTab === 'all-events' ? 'all events' : activeTab === 'dashboard' ? 'dashboard data' : 'bands'}...`}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-gray-900 border border-purple-500/30 rounded-full text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 transition-all"
                />
              </div>
            </div>
          </div>
        </motion.header>

        <main className="max-w-7xl mx-auto px-6 py-12">
          {activeTab === 'dashboard' ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              {/* Statistics Cards */}
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
                        ৳{bookings
                          .filter(b => b.status === 'approved')
                          .reduce((sum, b) => sum + (b.total_price || 0), 0)
                          .toLocaleString()}
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
                        {bookings
                          .filter(b => b.status === 'approved')
                          .reduce((sum, b) => sum + (b.ticket_quantity || 1), 0)}
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
                        ৳{(bookings
                          .filter(b => b.status === 'approved')
                          .reduce((sum, b) => sum + (b.total_price || 0), 0) * 0.1)
                          .toLocaleString()}
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
            </motion.div>
          ) : activeTab === 'bookings' ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className="bg-gray-900 rounded-lg p-6 border border-purple-500/30"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <Users className="text-purple-400" size={24} />
                    <h3 className="text-lg font-semibold">Total Bookings</h3>
                  </div>
                  <p className="text-3xl font-bold text-purple-400">{bookings.length}</p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                  className="bg-gray-900 rounded-lg p-6 border border-purple-500/30"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <Check className="text-green-400" size={24} />
                    <h3 className="text-lg font-semibold">Paid</h3>
                  </div>
                  <p className="text-3xl font-bold text-green-400">{bookings.filter(b => b.status === 'approved').length}</p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.4 }}
                  className="bg-gray-900 rounded-lg p-6 border border-purple-500/30"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <Calendar className="text-yellow-400" size={24} />
                    <h3 className="text-lg font-semibold">Pending</h3>
                  </div>
                  <p className="text-3xl font-bold text-yellow-400">{bookings.filter(b => b.status === 'pending').length}</p>
                </motion.div>
              </div>

              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.5 }}
                className="space-y-4"
              >
                {filteredBookings.map((booking, index) => (
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
                              onClick={() => handleApproveAndSend(booking)}
                              className="flex items-center gap-2 px-4 py-2 bg-green-600 rounded-lg hover:bg-green-700 transition-colors font-medium"
                            >
                              <MessageCircle size={16} />
                              Approve & Send to WhatsApp
                            </motion.button>
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => handleDeleteBooking(booking.id)}
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
                              onClick={() => handleDeleteBooking(booking.id)}
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
                ))}

                {filteredBookings.length === 0 && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center py-12"
                  >
                    <p className="text-gray-400 text-lg">No bookings found</p>
                  </motion.div>
                )}
              </motion.div>
            </>
          ) : activeTab === 'events' ? (
            /* Event Requests Tab */
            <>
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.5 }}
                className="space-y-4"
              >
                {filteredPendingEvents.map((event, index) => (
                  <motion.div
                    key={event.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4, delay: 0.6 + index * 0.05 }}
                    className="bg-gray-900 rounded-lg p-6 border border-purple-500/30 hover:border-purple-500 transition-all"
                  >
                    <div className="flex flex-col lg:flex-row gap-6">
                      <div className="flex-1 space-y-3">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="text-xl font-bold text-purple-400 mb-1">{event.name}</h3>
                            <p className="text-gray-400 text-sm">Event ID: {event.id}</p>
                          </div>
                          <div className="px-3 py-1 rounded-full text-sm font-medium bg-yellow-900/30 text-yellow-400 border border-yellow-500/30">
                            Pending Approval
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <p className="text-gray-400 text-sm mb-1">Venue</p>
                            <p className="text-white font-medium">{event.venue}</p>
                          </div>
                          <div>
                            <p className="text-gray-400 text-sm mb-1">Price</p>
                            <p className="text-white font-medium">৳{event.price}</p>
                          </div>
                          <div>
                            <p className="text-gray-400 text-sm mb-1">Time</p>
                            <p className="text-white font-medium">{event.date_time}</p>
                          </div>
                          <div>
                            <p className="text-gray-400 text-sm mb-1">Banner</p>
                            <p className="text-white font-medium">Image Upload</p>
                          </div>
                        </div>
                        
                        <div>
                          <p className="text-gray-400 text-sm mb-1">Event Details</p>
                          <p className="text-white font-medium">{event.description}</p>
                        </div>
                      </div>

                      <div className="flex flex-col items-center gap-4">
                        <div className="p-4 bg-gradient-to-br from-purple-600 to-purple-800 rounded-lg">
                          {event.image_url && event.image_url !== "/api/placeholder/400/250" ? (
                            <img 
                              src={event.image_url} 
                              alt={event.name} 
                              className="w-32 h-32 object-cover rounded-lg"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.style.display = 'none';
                                target.parentElement!.innerHTML = '<div class="w-32 h-32 bg-white/20 rounded-lg flex items-center justify-center"><svg class="w-12 h-12 text-white/50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg></div>';
                              }}
                            />
                          ) : (
                            <div className="w-32 h-32 bg-white/20 rounded-lg flex items-center justify-center">
                              <Calendar className="w-12 h-12 text-white/50" />
                            </div>
                          )}
                        </div>
                        
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleApproveEvent(event.id)}
                          className="flex items-center gap-2 px-4 py-2 bg-green-600 rounded-lg hover:bg-green-700 transition-colors font-medium"
                        >
                          <Check size={16} />
                          Approve Event
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleDeleteEvent(event.id)}
                          className="flex items-center gap-2 px-4 py-2 bg-red-600 rounded-lg hover:bg-red-700 transition-colors font-medium"
                        >
                          <Trash2 size={16} />
                          Delete
                        </motion.button>
                      </div>
                    </div>
                  </motion.div>
                ))}

                {filteredPendingEvents.length === 0 && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center py-12"
                  >
                    <p className="text-gray-400 text-lg">No pending event requests</p>
                  </motion.div>
                )}
              </motion.div>
            </>
          ) : activeTab === 'all-events' ? (
            /* All Events Tab */
            <>
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.5 }}
                className="space-y-4"
              >
                {allEvents.map((event, index) => (
                  <motion.div
                    key={event.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4, delay: 0.6 + index * 0.05 }}
                    className="bg-gray-900 rounded-lg p-6 border border-purple-500/30 hover:border-purple-500 transition-all"
                  >
                    <div className="flex flex-col lg:flex-row gap-6">
                      <div className="flex-1 space-y-3">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="text-xl font-bold text-purple-400 mb-1">{event.name}</h3>
                            <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                              event.status === 'approved' 
                                ? 'bg-green-900/30 text-green-400 border border-green-500/30' 
                                : 'bg-yellow-900/30 text-yellow-400 border border-yellow-500/30'
                            }`}>
                              {event.status === 'approved' ? 'Approved' : 'Pending'}
                            </div>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div>
                            <p className="text-gray-400 text-sm mb-1">Venue</p>
                            <p className="text-white font-medium">{event.venue}</p>
                          </div>
                          <div>
                            <p className="text-gray-400 text-sm mb-1">Price</p>
                            <p className="text-white font-medium">৳{event.price}</p>
                          </div>
                          <div>
                            <p className="text-gray-400 text-sm mb-1">Date & Time</p>
                            <p className="text-white font-medium">{event.date_time}</p>
                          </div>
                          <div>
                            <p className="text-gray-400 text-sm mb-1">Type</p>
                            <p className="text-white font-medium">{event.is_band_concert ? 'Band Concert' : 'General Event'}</p>
                          </div>
                        </div>
                        
                        <div>
                          <p className="text-gray-400 text-sm mb-1">Description</p>
                          <p className="text-white font-medium">{event.description}</p>
                        </div>
                      </div>

                      <div className="flex flex-col items-center gap-4">
                        <div className="p-4 bg-gradient-to-br from-purple-600 to-purple-800 rounded-lg">
                          {event.image_url && event.image_url !== "/api/placeholder/400/250" ? (
                            <img 
                              src={event.image_url} 
                              alt={event.name} 
                              className="w-32 h-32 object-cover rounded-lg"
                            />
                          ) : (
                            <div className="w-32 h-32 bg-white/20 rounded-lg flex items-center justify-center">
                              <Calendar className="w-12 h-12 text-white/50" />
                            </div>
                          )}
                        </div>
                        
                        <div className="flex flex-col gap-2">
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleEditEvent(event)}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                          >
                            <Check size={16} />
                            Edit
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleDeleteEvent(event.id)}
                            disabled={deletingEventId === event.id}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors font-medium ${
                              deletingEventId === event.id 
                                ? 'bg-gray-600 cursor-not-allowed' 
                                : 'bg-red-600 hover:bg-red-700'
                            }`}
                          >
                            {deletingEventId === event.id ? (
                              <>
                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                Deleting...
                              </>
                            ) : (
                              <>
                                <Trash2 size={16} />
                                Delete
                              </>
                            )}
                          </motion.button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}

                {allEvents.length === 0 && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center py-12"
                  >
                    <p className="text-gray-400 text-lg">No events found</p>
                  </motion.div>
                )}
              </motion.div>
            </>
          ) : activeTab === 'bands' ? (
            /* Bands Management Tab */
            <>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-bold text-purple-400">Manage Top 10 BD Bands</h2>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleAddBand}
                  className="flex items-center gap-2 px-4 py-2 bg-purple-600 rounded-lg hover:bg-purple-700 transition-colors font-medium"
                >
                  <Plus size={16} />
                  Add New Band
                </motion.button>
              </div>

              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.5 }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              >
                {bands.map((band, index) => (
                  <motion.div
                    key={band.id}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.4, delay: 0.6 + index * 0.1 }}
                    whileHover={{ scale: 1.02 }}
                    className="bg-gray-900 rounded-lg p-6 border border-purple-500/30 hover:border-purple-500 transition-all"
                  >
                    <div className="space-y-4">
                      <div className="flex justify-center">
                        {/* Background Image */}
                        <div className="relative w-24 h-24">
                          {band.bg_image_url ? (
                            <img 
                              src={band.bg_image_url} 
                              alt={`${band.name} background`} 
                              className="w-full h-full object-cover rounded-full opacity-20 blur-[2px]"
                            />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-br from-purple-600 to-purple-800 rounded-full opacity-20"></div>
                          )}
                          
                          {/* Main Image */}
                          {band.image_url ? (
                            <img 
                              src={band.image_url} 
                              alt={band.name} 
                              className="absolute inset-0 w-full h-full object-cover rounded-full border-3 border-purple-500 shadow-lg shadow-purple-500/50"
                            />
                          ) : (
                            <div className="absolute inset-0 w-full h-full bg-gradient-to-br from-purple-600 to-purple-800 rounded-full border-3 border-purple-500 shadow-lg shadow-purple-500/50 flex items-center justify-center">
                              <Music className="w-8 h-8 text-white/80" />
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="text-center">
                        <h3 className="text-xl font-bold text-purple-400 mb-2">{band.name}</h3>
                        <p className="text-gray-400 text-sm line-clamp-3 mb-4">
                          {band.story.substring(0, 150)}...
                        </p>
                      </div>

                      <div className="flex gap-2">
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleEditBand(band)}
                          className="flex-1 px-3 py-2 bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm"
                        >
                          Edit
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleDeleteBand(band.id)}
                          disabled={deletingBandId === band.id}
                          className={`flex-1 px-3 py-2 rounded-lg transition-colors font-medium text-sm ${
                            deletingBandId === band.id 
                              ? 'bg-gray-600 cursor-not-allowed' 
                              : 'bg-red-600 hover:bg-red-700'
                          }`}
                        >
                          {deletingBandId === band.id ? (
                            <>
                              <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin mx-auto"></div>
                            </>
                          ) : (
                            'Delete'
                          )}
                        </motion.button>
                      </div>
                    </div>
                  </motion.div>
                ))}

                {bands.length === 0 && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="col-span-full text-center py-12"
                  >
                    <Music className="w-16 h-16 text-purple-400 mx-auto mb-4" />
                    <p className="text-gray-400 text-lg mb-4">No bands found</p>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleAddBand}
                      className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 rounded-lg hover:bg-purple-700 transition-colors font-medium"
                    >
                      <Plus size={16} />
                      Add Your First Band
                    </motion.button>
                  </motion.div>
                )}
              </motion.div>
            </>
          ) : null}
        </main>
      </div>

      {/* Event Edit Modal */}
      {showEventModal && (
        <EventEditModal
          event={editingEvent}
          onSave={handleSaveEvent}
          onCancel={() => {
            setShowEventModal(false);
            setEditingEvent(null);
          }}
        />
      )}

      {/* Band Edit Modal */}
      {showBandModal && (
        <BandEditModal
          band={editingBand}
          onSave={handleSaveBand}
          onCancel={() => {
            setShowBandModal(false);
            setEditingBand(null);
          }}
        />
      )}

      {/* Notification Container */}
      <NotificationContainer 
        notifications={notifications} 
        onClose={removeNotification} 
      />
    </div>
  );
}
