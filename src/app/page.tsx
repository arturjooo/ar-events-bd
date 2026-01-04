"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, MapPin, Calendar, Clock, Users, Music, ChevronRight, Star, Check, X, QrCode, MessageCircle, AlertCircle, Upload, Tag, Info, FileImage, Sparkles, X as CloseIcon } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { supabase } from '@/lib/supabaseClient';

interface Event {
  id: number;
  name: string;
  venue: string;
  price: number;
  date_time: string;
  description: string;
  status: 'pending' | 'approved';
  image_url: string;
  is_band_concert: boolean;
  band_name?: string;
  total_tickets?: number;
  available_tickets?: number;
}

interface Band {
  id: number;
  name: string;
  story: string;
  image_url: string;
  bg_image_url: string;
}

interface Booking {
  id: string;
  eventId: number;
  eventName: string;
  userName: string;
  whatsappNumber: string;
  transactionId: string;
  ticketId: string;
  status: 'pending' | 'approved';
  checkedIn: boolean;
  createdAt: string;
}

interface Ticket {
  id: string;
  eventId: number;
  eventName: string;
  userName: string;
  whatsappNumber: string;
  transactionId: string;
  ticketId: string;
  status: 'pending' | 'approved';
  checkedIn: boolean;
  createdAt: string;
}

export default function Home() {
  const [searchQuery, setSearchQuery] = useState("");
  const [events, setEvents] = useState<Event[]>([]);
  const [pendingEvents, setPendingEvents] = useState<Event[]>([]);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [bookingForm, setBookingForm] = useState({ userName: "", whatsappNumber: "", transactionId: "", quantity: 1 });
  const [generatedTicket, setGeneratedTicket] = useState<Ticket | null>(null);
  const [showTicketModal, setShowTicketModal] = useState(false);
  const [showBandModal, setShowBandModal] = useState(false);
  const [selectedBand, setSelectedBand] = useState<Band | null>(null);
  const [showEventPostModal, setShowEventPostModal] = useState(false);
  const [bands, setBands] = useState<Band[]>([]);
  const [loading, setLoading] = useState(true);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, boolean>>({});

  const generateTicketId = (eventName: string) => {
    // Get event initials (first 3 letters, uppercase)
    const initials = eventName
      .replace(/[^a-zA-Z\s]/g, '') // Remove special characters
      .split(' ')
      .filter(word => word.length > 0)
      .map(word => word[0].toUpperCase())
      .join('')
      .substring(0, 3);
    
    // Generate random number
    const randomNum = Math.floor(Math.random() * 900000) + 100000; // 6-digit number
    
    return `${initials}-TKT-${randomNum}`;
  };

  useEffect(() => {
    // Load approved events from Supabase
    const fetchEvents = async () => {
      try {
        setLoading(true);
        const { data: eventsData, error } = await supabase
          .from('events')
          .select('*')
          .eq('status', 'approved');
          
        if (error) {
          console.error('Error fetching events:', error);
          // Fallback to default events
          const defaultEvents = [
            {
              id: 1,
              name: "Summer Music Festival 2024",
              price: 2500,
              venue: "Bangabandhu International Conference Center",
              image_url: "/api/placeholder/400/250",
              date_time: "2024-06-15 18:00",
              description: "Biggest music festival of year featuring international artists",
              status: 'approved' as const,
              is_band_concert: false,
              band_name: undefined,
              total_tickets: 500,
              available_tickets: 500
            },
            {
              id: 2,
              name: "Lalon Shah Memorial Concert",
              price: 800,
              venue: "Kushtia Lalon Academy",
              image_url: "/api/placeholder/400/250",
              date_time: "2024-05-20 16:00",
              description: "Tribute concert to the legendary Lalon Shah",
              status: 'approved' as const,
              is_band_concert: true,
              band_name: "Lalon Ensemble",
              total_tickets: 200,
              available_tickets: 150
            },
            {
              id: 3,
              name: "Jazz Night in Dhaka",
              price: 1200,
              venue: "International Convention City Bashundhara",
              image_url: "/api/placeholder/400/250",
              date_time: "2024-07-10 19:00",
              description: "An evening of smooth jazz with renowned artists",
              status: 'approved' as const,
              is_band_concert: false,
              band_name: undefined,
              total_tickets: 300,
              available_tickets: 275
            }
          ];
          setEvents(defaultEvents as Event[]);
        } else if (eventsData) {
          // Ensure all events have the required fields with defaults
          const processedEvents = eventsData.map(event => ({
            ...event,
            total_tickets: event.total_tickets || 100,
            available_tickets: event.available_tickets || event.total_tickets || 100,
            image_url: event.image_url || "/api/placeholder/400/250"
          }));
          setEvents(processedEvents);
        }
      } catch (err) {
        console.error('Unexpected error fetching events:', err);
        // Set empty array on critical error
        setEvents([]);
      } finally {
        setLoading(false);
      }
    };

    // Load pending events from Supabase
    const fetchPendingEvents = async () => {
      try {
        const { data: pendingEventsData, error } = await supabase
          .from('events')
          .select('*')
          .eq('status', 'pending');
          
        if (error) {
          console.error('Error fetching pending events:', error);
          setPendingEvents([]);
        } else if (pendingEventsData) {
          // Ensure all pending events have the required fields with defaults
          const processedPendingEvents = pendingEventsData.map(event => ({
            ...event,
            total_tickets: event.total_tickets || 100,
            available_tickets: event.available_tickets || event.total_tickets || 100,
            image_url: event.image_url || "/api/placeholder/400/250"
          }));
          setPendingEvents(processedPendingEvents);
        }
      } catch (err) {
        console.error('Unexpected error fetching pending events:', err);
        setPendingEvents([]);
      }
    };

    // Load bands from Supabase
    const fetchBands = async () => {
      try {
        const { data: bandsData, error } = await supabase
          .from('bands')
          .select('*');
          
        if (error) {
          console.error('Error fetching bands:', error);
          setBands([]);
        } else if (bandsData) {
          setBands(bandsData);
        }
      } catch (err) {
        console.error('Unexpected error fetching bands:', err);
        setBands([]);
      }
    };

    // Execute all fetches
    Promise.all([fetchEvents(), fetchPendingEvents(), fetchBands()]);
  }, []);

  const [formData, setFormData] = useState({
    eventName: "",
    venue: "",
    price: "",
    time: "",
    details: "",
    bannerImage: "" as string,
    eventType: 'general' as 'general' | 'band',
    bandName: "",
    totalTickets: ""
  });

  const [bookings, setBookings] = useState<Booking[]>([]);

  const handleBooking = (event: Event) => {
    setSelectedEvent(event);
    setShowBookingModal(true);
  };

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEvent) return;

    // Validation
    if (!bookingForm.userName.trim() || !bookingForm.whatsappNumber.trim() || !bookingForm.transactionId.trim()) {
      alert('Please fill in all fields: Name, WhatsApp Number, and Transaction ID.');
      return;
    }

    setBookingLoading(true);

    const ticketId = generateTicketId(selectedEvent.name);
    const newBooking = {
      event_id: selectedEvent.id,
      event_name: selectedEvent.name,
      user_name: bookingForm.userName,
      whatsapp: bookingForm.whatsappNumber,
      trx_id: bookingForm.transactionId,
      ticket_id: ticketId,
      status: 'pending',
      is_checked_in: false,
      ticket_quantity: bookingForm.quantity,
      total_price: selectedEvent.price * bookingForm.quantity
    };

    try {
      const { data, error } = await supabase
        .from('bookings')
        .insert([newBooking])
        .select();
      
      if (error) {
        console.error('Error creating booking:', error);
        alert(`Error creating booking: ${error.message}`);
      } else {
        console.log('Booking created successfully:', data);
        setShowBookingModal(false);
        setBookingForm({ userName: "", whatsappNumber: "", transactionId: "", quantity: 1 });
        
        // Show success message instead of QR code
        setGeneratedTicket({
          id: data[0].id,
          eventId: selectedEvent.id,
          eventName: selectedEvent.name,
          userName: bookingForm.userName,
          whatsappNumber: bookingForm.whatsappNumber,
          transactionId: bookingForm.transactionId,
          ticketId: ticketId,
          status: 'pending',
          checkedIn: false,
          createdAt: new Date().toISOString()
        });
      }
    } catch (error) {
      console.error('Unexpected error:', error);
      alert('Error creating booking. Please try again.');
    } finally {
      setBookingLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      
      reader.onloadend = () => {
        // Convert to Base64 string
        const base64String = reader.result as string;
        setFormData(prev => ({ ...prev, bannerImage: base64String }));
      };
      
      reader.readAsDataURL(file);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Convert to base64 for preview
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setFormData(prev => ({ ...prev, bannerImage: base64String }));
      };
      
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Reset previous errors
    setFormErrors({});
    
    // Validation with error tracking
    const errors: Record<string, boolean> = {};
    
    if (!formData.eventName.trim()) errors.eventName = true;
    if (!formData.venue.trim()) errors.venue = true;
    if (!formData.price.trim()) errors.price = true;
    if (!formData.totalTickets.trim()) errors.totalTickets = true;
    if (!formData.time.trim()) errors.time = true;
    if (!formData.details.trim()) errors.details = true;
    if (formData.eventType === 'band' && !formData.bandName.trim()) errors.bandName = true;
    
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setSubmitLoading(true);

    const newEvent = {
      name: formData.eventName,
      venue: formData.venue,
      price: parseFloat(formData.price),
      date_time: formData.time,
      description: formData.details,
      status: 'pending',
      image_url: formData.bannerImage || "/api/placeholder/400/250",
      is_band_concert: formData.eventType === 'band',
      band_name: formData.eventType === 'band' ? formData.bandName : null,
      available_tickets: parseInt(formData.totalTickets)
    };
    
    try {
      const { data, error } = await supabase
        .from('events')
        .insert([newEvent])
        .select();
      
      if (error) {
        console.error('Error creating event:', error);
        alert(`Error creating event: ${error.message}`);
      } else {
        console.log('Event created successfully:', data);
        // Close the modal
        setShowEventPostModal(false);
        // Refresh pending events
        const { data: pendingEventsData } = await supabase
          .from('events')
          .select('*')
          .eq('status', 'pending');
        if (pendingEventsData) {
          setPendingEvents(pendingEventsData);
        }
      }
    } catch (error) {
      console.error('Unexpected error:', error);
      alert('Error creating event. Please try again.');
    } finally {
      setSubmitLoading(false);
    }
    
    setFormData({
      eventName: "",
      venue: "",
      price: "",
      time: "",
      details: "",
      bannerImage: "",
      eventType: 'general',
      bandName: "",
      totalTickets: ""
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className="text-center"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-20 h-20 border-4 border-purple-500 border-t-transparent rounded-full mx-auto mb-4"
            style={{ filter: "drop-shadow(0 0 20px rgba(168, 85, 247, 0.8))" }}
          />
          <motion.p
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="text-purple-400 text-lg font-medium"
          >
            Loading AR Events BD...
          </motion.p>
        </motion.div>
      </div>
    );
  }

  const filteredEvents = events.filter(event =>
    event.status === 'approved' && (
      event.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.venue.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.description.toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  return (
    <div className="min-h-screen bg-black text-white">
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 bg-gradient-to-br from-purple-900/20 via-black to-purple-900/20 z-0"
        />
      </AnimatePresence>

      <div className="relative z-10">
        <motion.header
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="py-8 px-6"
        >
          <div className="max-w-7xl mx-auto text-center">
            <motion.h1
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="text-4xl md:text-6xl font-black text-center mb-6"
              style={{ 
                background: "linear-gradient(135deg, #A855F7, #9333EA, #7C3AED)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
                filter: "drop-shadow(0 0 30px rgba(168, 85, 247, 0.8)) drop-shadow(0 0 60px rgba(168, 85, 247, 0.4))"
              }}
            >
              AR Events BD
            </motion.h1>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.2 }}
              className="max-w-xl mx-auto mb-8"
            >
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-purple-400" size={18} />
                <input
                  type="text"
                  placeholder="Search events by name or venue..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-gray-900 border border-purple-500/30 rounded-full text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 transition-all text-sm"
                />
              </div>
            </motion.div>
          </div>
        </motion.header>

        <main className="max-w-7xl mx-auto px-6 py-12">
          <motion.section
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="mb-16"
          >
            <h2 className="text-4xl font-bold mb-8 text-purple-400">Recent Events</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredEvents.map((event, index) => (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  whileHover={{ y: -5 }}
                  className="bg-gray-900 rounded-lg overflow-hidden border border-purple-500/30 hover:border-purple-500 transition-all cursor-pointer h-full flex flex-col"
                  onClick={() => handleBooking(event)}
                >
                  <div className="relative h-48 overflow-hidden">
                    {event.image_url && event.image_url !== "/api/placeholder/400/250" ? (
                      <img 
                        src={event.image_url} 
                        alt={event.name} 
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          // Fallback to gradient if image fails to load
                          target.style.display = 'none';
                          target.parentElement!.style.background = 'linear-gradient(135deg, #A855F7, #9333EA, #7C3AED)';
                        }}
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-purple-600 to-purple-800 flex items-center justify-center">
                        <Calendar className="w-12 h-12 text-white/50" />
                      </div>
                    )}
                    <div className="absolute top-4 right-4 bg-purple-600 text-white px-3 py-1 rounded-full text-sm font-bold">
                      ৳{event.price}
                    </div>
                  </div>
                  <div className="p-6 flex-grow flex flex-col">
                    <h3 className="text-xl font-bold text-purple-400 mb-2">{event.name}</h3>
                    <div className="flex items-center gap-2 mb-2">
                      <MapPin className="text-purple-300" size={16} />
                      <p className="text-gray-300 text-sm">{event.venue}</p>
                    </div>
                    <div className="mb-3">
                      <p className="text-purple-400 text-sm font-semibold">
                        Tickets Left: {event.available_tickets || 0}
                      </p>
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedEvent(event);
                        setShowDetailModal(true);
                      }}
                      className={`w-full py-2 rounded-lg transition-colors font-semibold mt-auto ${
                        (event.available_tickets || 0) > 0
                          ? 'bg-purple-600 hover:bg-purple-700'
                          : 'bg-red-600 cursor-not-allowed'
                      }`}
                      disabled={(event.available_tickets || 0) === 0}
                    >
                      {(event.available_tickets || 0) > 0 ? 'View Details' : 'Sold Out'}
                    </motion.button>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Empty State for Search Results */}
            {filteredEvents.length === 0 && searchQuery && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
                className="text-center py-16"
              >
                <div className="w-24 h-24 bg-gradient-to-br from-purple-600 to-purple-800 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Search className="w-12 h-12 text-white/50" />
                </div>
                <h3 className="text-2xl font-bold text-purple-400 mb-3">No events found matching your search.</h3>
                <p className="text-gray-400 text-lg">Try adjusting your search terms or browse all events.</p>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSearchQuery("")}
                  className="mt-6 px-6 py-3 bg-purple-600 rounded-lg hover:bg-purple-700 transition-colors font-semibold"
                >
                  Clear Search
                </motion.button>
              </motion.div>
            )}

            {/* Empty State for No Events */}
            {events.length === 0 && !loading && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
                className="text-center py-16"
              >
                <div className="w-24 h-24 bg-gradient-to-br from-purple-600 to-purple-800 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Calendar className="w-12 h-12 text-white/50" />
                </div>
                <h3 className="text-2xl font-bold text-purple-400 mb-3">Stay tuned! New events coming soon.</h3>
                <p className="text-gray-400 text-lg">We're working on bringing you amazing events.</p>
              </motion.div>
            )}
          </motion.section>

          {/* CTA Section - Event Organizers */}
          <motion.section
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.2 }}
            className="mb-16"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 1.4 }}
              whileHover={{ y: -5 }}
              className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-purple-900/50 via-purple-800/50 to-pink-900/50 backdrop-blur-lg border border-purple-500/30 shadow-2xl"
            >
              {/* Background Effects */}
              <div className="absolute inset-0 bg-gradient-to-br from-purple-600/10 to-pink-600/10"></div>
              <div className="absolute inset-0 bg-[url('/api/placeholder/1920/400')] bg-cover bg-center opacity-10"></div>
              
              {/* Content */}
              <div className="relative px-12 py-16 text-center">
                <div className="max-w-4xl mx-auto">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 1.5 }}
                    className="mb-6"
                  >
                    <h2 className="text-5xl font-bold text-white mb-4">
                      Organizing an Event?
                    </h2>
                    <p className="text-xl text-purple-200 leading-relaxed">
                      Reach thousands of music lovers by posting your event here.
                      <br />
                      Join our platform and make your event unforgettable.
                    </p>
                  </motion.div>
                  
                  <motion.button
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, delay: 1.6 }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowEventPostModal(true)}
                    className="relative px-8 py-4 bg-gradient-to-r from-purple-600 via-purple-500 to-pink-600 rounded-xl font-semibold text-white text-lg shadow-lg hover:shadow-purple-500/50 transition-all duration-300 overflow-hidden group"
                  >
                    {/* Glow Effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-600 via-purple-500 to-pink-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <div className="absolute inset-0 bg-white/20 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                    
                    {/* Purple Glow */}
                    <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl blur opacity-30 group-hover:opacity-75 transition duration-300"></div>
                    
                    <span className="relative flex items-center justify-center gap-3">
                      <Sparkles className="w-5 h-5" />
                      Post Your Event Now
                    </span>
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.section>

          {/* Band Story Modal */}
          <AnimatePresence>
            {selectedBand && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                onClick={() => setSelectedBand(null)}
              >
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.9, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="bg-gray-900 rounded-lg p-6 md:p-8 max-w-2xl w-full border border-purple-500/30 purple-glow"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="flex flex-col md:flex-row items-start gap-4 md:gap-6">
                    <div className="w-24 h-24 md:w-32 md:h-32 flex-shrink-0 mx-auto md:mx-0">
                      {selectedBand.image_url ? (
                        <img 
                          src={selectedBand.image_url} 
                          alt={selectedBand.name} 
                          className="w-full h-full object-cover rounded-full border-4 border-purple-500 shadow-lg shadow-purple-500/50"
                          onError={(e) => {
                            const target = e.currentTarget;
                            target.style.display = 'none';
                            const nextElement = target.nextElementSibling as HTMLElement;
                            if (nextElement) {
                              nextElement.style.display = 'flex';
                            }
                          }}
                        />
                      ) : null}
                      <div className="w-full h-full bg-gradient-to-br from-purple-600 to-purple-800 rounded-full border-4 border-purple-500 shadow-lg shadow-purple-500/50 flex items-center justify-center" style={{display: selectedBand.image_url ? 'none' : 'flex'}}>
                        <Music className="w-12 h-12 md:w-16 md:h-16 text-white/80" />
                      </div>
                    </div>
                    <div className="flex-1 text-center md:text-left">
                      <h3 className="text-2xl md:text-3xl font-bold text-purple-400 mb-4">{selectedBand.name}</h3>
                      <p className="text-gray-300 leading-relaxed text-base md:text-lg">{selectedBand.story}</p>
                    </div>
                  </div>
                  
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setSelectedBand(null)}
                    className="mt-6 px-6 py-3 bg-purple-600 rounded-lg hover:bg-purple-700 transition-colors font-semibold"
                  >
                    Close
                  </motion.button>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Event Detail Modal */}
          <AnimatePresence>
            {selectedEvent && showDetailModal && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                onClick={() => setShowDetailModal(false)}
              >
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.8, opacity: 0 }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                  className="bg-gray-900 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden border border-purple-500/30"
                  onClick={(e) => e.stopPropagation()}
                >
                  {/* Banner Image */}
                  <div className="relative h-64 md:h-80 overflow-hidden">
                    {selectedEvent.image_url ? (
                      <img 
                        src={selectedEvent.image_url} 
                        alt={selectedEvent.name} 
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                          target.parentElement!.style.background = 'linear-gradient(135deg, #A855F7, #9333EA, #7C3AED)';
                        }}
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-purple-600 to-purple-800 flex items-center justify-center">
                        <Calendar className="w-20 h-20 text-white/30" />
                      </div>
                    )}
                    
                    {/* Overlay with Price */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                    <div className="absolute bottom-6 left-6 right-6">
                      <h2 className="text-3xl md:text-4xl font-bold text-white mb-2">{selectedEvent.name}</h2>
                      <div className="flex items-center gap-4">
                        <div className="bg-purple-600 text-white px-4 py-2 rounded-full text-lg font-bold">
                          ৳{selectedEvent.price}
                        </div>
                        <div className="bg-green-600 text-white px-4 py-2 rounded-full text-sm font-semibold">
                          {selectedEvent.available_tickets || 0} Tickets Left
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-6 md:p-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                      <div className="space-y-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-purple-600/20 rounded-lg flex items-center justify-center">
                            <MapPin className="w-5 h-5 text-purple-400" />
                          </div>
                          <div>
                            <p className="text-gray-400 text-sm">Venue</p>
                            <p className="text-white font-semibold">{selectedEvent.venue}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-purple-600/20 rounded-lg flex items-center justify-center">
                            <Calendar className="w-5 h-5 text-purple-400" />
                          </div>
                          <div>
                            <p className="text-gray-400 text-sm">Date & Time</p>
                            <p className="text-white font-semibold">
                              {new Date(selectedEvent.date_time).toLocaleDateString('en-US', {
                                weekday: 'long',
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                              })}
                            </p>
                            <p className="text-gray-300 text-sm">
                              {new Date(selectedEvent.date_time).toLocaleTimeString('en-US', {
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-4">
                        {selectedEvent.is_band_concert && selectedEvent.band_name && (
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-purple-600/20 rounded-lg flex items-center justify-center">
                              <Music className="w-5 h-5 text-purple-400" />
                            </div>
                            <div>
                              <p className="text-gray-400 text-sm">Featured Artist</p>
                              <p className="text-white font-semibold">{selectedEvent.band_name}</p>
                            </div>
                          </div>
                        )}
                        
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-purple-600/20 rounded-lg flex items-center justify-center">
                            <Users className="w-5 h-5 text-purple-400" />
                          </div>
                          <div>
                            <p className="text-gray-400 text-sm">Availability</p>
                            <p className="text-white font-semibold">
                              {(selectedEvent.available_tickets || 0) > 0 ? (
                                <span className="text-green-400">{selectedEvent.available_tickets} tickets available</span>
                              ) : (
                                <span className="text-red-400">Sold Out</span>
                              )}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Description */}
                    <div className="mb-8">
                      <h3 className="text-xl font-bold text-purple-400 mb-3">About This Event</h3>
                      <div className="bg-black/30 rounded-lg p-4 border border-purple-500/20">
                        <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">
                          {selectedEvent.description}
                        </p>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-4">
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => {
                          setShowDetailModal(false);
                          setSelectedEvent(selectedEvent);
                          setShowBookingModal(true);
                        }}
                        className={`flex-1 py-3 rounded-lg font-semibold transition-colors ${
                          (selectedEvent.available_tickets || 0) > 0
                            ? 'bg-purple-600 hover:bg-purple-700 text-white'
                            : 'bg-gray-700 cursor-not-allowed text-gray-400'
                        }`}
                        disabled={(selectedEvent.available_tickets || 0) === 0}
                      >
                        {(selectedEvent.available_tickets || 0) > 0 ? 'Book Ticket' : 'Sold Out'}
                      </motion.button>
                      
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setShowDetailModal(false)}
                        className="px-6 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg font-semibold text-white transition-colors"
                      >
                        Close
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          <motion.section
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.4 }}
            className="mb-16"
          >
            <h2 className="text-4xl font-bold mb-8 text-purple-400">Top 10 BD Bands</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
              {bands.map((band, index) => (
                <motion.div
                  key={band.id}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: 0.5 + index * 0.05 }}
                  whileHover={{ scale: 1.05, transition: { duration: 0.2 } }}
                  className="relative bg-gray-900 rounded-xl overflow-hidden border border-purple-500/30 hover:border-purple-500 transition-all text-center h-64"
                >
                  {/* Background Image (Shadow/Blurry) */}
                  <div className="absolute inset-0">
                    {band.bg_image_url ? (
                      <img 
                        src={band.bg_image_url} 
                        alt={`${band.name} background`} 
                        className="w-full h-full object-cover opacity-20 blur-[2px]"
                        onError={(e) => {
                          const target = e.currentTarget;
                          target.style.display = 'none';
                          const nextElement = target.nextElementSibling as HTMLElement;
                          if (nextElement) {
                            nextElement.style.display = 'block';
                          }
                        }}
                      />
                    ) : null}
                    <div className="w-full h-full bg-gradient-to-br from-purple-900/15 to-purple-700/15" style={{display: band.bg_image_url ? 'none' : 'block'}}></div>
                  </div>
                  
                  {/* Main Image (Clear) */}
                  <div className="absolute inset-x-0 top-8 flex justify-center">
                    {band.image_url ? (
                      <img 
                        src={band.image_url} 
                        alt={band.name} 
                        className="w-20 h-20 object-cover rounded-full border-4 border-purple-500 shadow-lg shadow-purple-500/50"
                        onError={(e) => {
                          const target = e.currentTarget;
                          target.style.display = 'none';
                          const nextElement = target.nextElementSibling as HTMLElement;
                          if (nextElement) {
                            nextElement.style.display = 'flex';
                          }
                        }}
                      />
                    ) : null}
                    <div className="w-20 h-20 bg-gradient-to-br from-purple-600 to-purple-800 rounded-full border-4 border-purple-500 shadow-lg shadow-purple-500/50 flex items-center justify-center" style={{display: band.image_url ? 'none' : 'flex'}}>
                      <Music className="w-10 h-10 text-white/80" />
                    </div>
                  </div>
                  
                  {/* Content */}
                  <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-gray-900 via-gray-900/90 to-transparent">
                    <h3 className="text-sm font-bold text-purple-400 mb-2">{band.name}</h3>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setSelectedBand(band)}
                      className="px-3 py-1.5 bg-purple-600 rounded-lg hover:bg-purple-700 transition-colors font-semibold text-xs w-full"
                    >
                      Read Story
                    </motion.button>
                  </div>
                </motion.div>
              ))}

              {/* Empty State */}
              {bands.length === 0 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="col-span-full text-center py-12"
                >
                  <Music className="w-16 h-16 text-purple-400 mx-auto mb-4" />
                  <p className="text-gray-400 text-lg">No bands available yet</p>
                </motion.div>
              )}
            </div>
          </motion.section>
        </main>

        {/* Booking Modal */}
        <AnimatePresence>
          {showBookingModal && selectedEvent && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
              onClick={() => setShowBookingModal(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-gray-900 rounded-lg p-8 max-w-md w-full border border-purple-500/30 purple-glow"
                onClick={(e) => e.stopPropagation()}
              >
                <h3 className="text-2xl font-bold mb-4 text-purple-400">Book Your Ticket</h3>
                <div className="mb-6 p-4 bg-black/50 rounded-lg">
                  <h4 className="font-semibold text-white mb-2">{selectedEvent.name}</h4>
                  <p className="text-gray-400 text-sm">{selectedEvent.venue}</p>
                  <p className="text-purple-400 font-bold">৳{selectedEvent.price}</p>
                </div>
                
                <div className="mb-6 p-4 bg-yellow-900/20 border border-yellow-500/30 rounded-lg">
                  <p className="text-yellow-300 text-sm font-medium mb-2">Payment Instructions:</p>
                  <p className="text-white text-sm">Please send the total amount + bKash/Nagad cash-out charges (approx 2%) to <span className="font-bold text-yellow-300">01XXXXXXXXX</span>.</p>
                  <p className="text-gray-400 text-xs mt-1">Ensure your payment is successful before entering the TrxID. Our team will verify and send your QR ticket to WhatsApp within 30 minutes.</p>
                </div>

                <form onSubmit={handleBookingSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2 text-purple-300">Your Name</label>
                    <input
                      type="text"
                      required
                      value={bookingForm.userName}
                      onChange={(e) => setBookingForm(prev => ({ ...prev, userName: e.target.value }))}
                      className="w-full px-4 py-2 bg-black border border-purple-500/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500"
                      placeholder="Enter your full name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2 text-purple-300">WhatsApp Number</label>
                    <input
                      type="tel"
                      required
                      value={bookingForm.whatsappNumber}
                      onChange={(e) => setBookingForm(prev => ({ ...prev, whatsappNumber: e.target.value }))}
                      className="w-full px-4 py-2 bg-black border border-purple-500/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500"
                      placeholder="01XXXXXXXXX"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2 text-purple-300">Quantity</label>
                    <select
                      value={bookingForm.quantity}
                      onChange={(e) => setBookingForm(prev => ({ ...prev, quantity: parseInt(e.target.value) }))}
                      className="w-full px-4 py-2 bg-black border border-purple-500/30 rounded-lg text-white focus:outline-none focus:border-purple-500"
                    >
                      {Array.from({ length: Math.min(10, selectedEvent?.available_tickets || 1) }, (_, i) => i + 1).map(num => (
                        <option key={num} value={num}>{num} ticket{num > 1 ? 's' : ''}</option>
                      ))}
                    </select>
                  </div>
                  <div className="bg-purple-900/20 border border-purple-500/30 rounded-lg p-4">
                    <div className="flex justify-between items-center">
                      <span className="text-purple-300 font-medium">Total Price:</span>
                      <span className="text-2xl font-bold text-purple-400">
                        ৳{((selectedEvent?.price || 0) * (bookingForm.quantity || 1)).toLocaleString()}
                      </span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2 text-purple-300">Transaction ID (TrxID)</label>
                    <input
                      type="text"
                      required
                      value={bookingForm.transactionId}
                      onChange={(e) => setBookingForm(prev => ({ ...prev, transactionId: e.target.value }))}
                      className="w-full px-4 py-2 bg-black border border-purple-500/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500"
                      placeholder="Enter transaction ID"
                    />
                  </div>
                  <div className="flex gap-3">
                    <motion.button
                      type="submit"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      disabled={bookingLoading}
                      className={`flex-1 py-3 rounded-lg transition-colors font-semibold ${
                        bookingLoading 
                          ? 'bg-gray-600 cursor-not-allowed' 
                          : 'bg-purple-600 hover:bg-purple-700'
                      }`}
                    >
                      {bookingLoading ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mx-auto"></div>
                          Processing...
                        </>
                      ) : (
                        'Generate Ticket'
                      )}
                    </motion.button>
                    <motion.button
                      type="button"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setShowBookingModal(false)}
                      className="flex-1 py-3 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors font-semibold"
                    >
                      Cancel
                    </motion.button>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Success Message Modal */}
        <AnimatePresence>
          {generatedTicket && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
              onClick={() => setGeneratedTicket(null)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-gray-900 rounded-lg p-8 max-w-md w-full border border-purple-500/30 purple-glow"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="text-center">
                  <div className="mb-6">
                    <Check className="w-16 h-16 text-green-400 mx-auto mb-4" />
                    <h3 className="text-2xl font-bold text-green-400 mb-2">Application Submitted!</h3>
                  </div>
                  
                  <div className="mb-6 p-4 bg-black/50 rounded-lg">
                    <p className="text-white text-sm leading-relaxed">
                      We are verifying your payment. Once confirmed, your ticket will be activated and sent to your WhatsApp.
                    </p>
                  </div>

                  <div className="text-left space-y-2 mb-6">
                    <p className="text-sm"><span className="text-gray-400">Event:</span> <span className="text-white font-medium">{generatedTicket.eventName}</span></p>
                    <p className="text-sm"><span className="text-gray-400">Name:</span> <span className="text-white font-medium">{generatedTicket.userName}</span></p>
                    <p className="text-sm"><span className="text-gray-400">WhatsApp:</span> <span className="text-white font-medium">{generatedTicket.whatsappNumber}</span></p>
                    <p className="text-sm"><span className="text-gray-400">Status:</span> <span className="text-yellow-400 font-medium">Payment Verification Pending</span></p>
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setGeneratedTicket(null)}
                    className="w-full py-3 bg-purple-600 rounded-lg hover:bg-purple-700 transition-colors font-semibold"
                  >
                    Got it
                  </motion.button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Event Post Modal */}
        <AnimatePresence>
          {showEventPostModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/90 backdrop-blur-xl z-50 flex items-center justify-center p-4"
              onClick={() => setShowEventPostModal(false)}
            >
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-black/80 backdrop-blur-2xl rounded-2xl border border-purple-500/30 shadow-2xl"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Close Button */}
                <motion.button
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setShowEventPostModal(false)}
                  className="absolute top-6 right-6 z-10 w-10 h-10 bg-purple-600/20 hover:bg-purple-600/30 rounded-full flex items-center justify-center transition-colors"
                >
                  <CloseIcon className="w-5 h-5 text-purple-300" />
                </motion.button>

                {/* Modal Content */}
                <div className="p-8">
                  {/* Header */}
                  <div className="text-center mb-8">
                    <h2 className="text-4xl font-bold text-purple-400 mb-4">Post Your Event</h2>
                    <p className="text-gray-300">Share your amazing event with thousands of music lovers</p>
                  </div>

                  {/* Pro Tip Box */}
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                    className="mb-8 relative overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-pink-600/20 backdrop-blur-sm"></div>
                    <div className="relative bg-gradient-to-r from-purple-900/30 to-pink-900/30 border border-purple-500/30 rounded-xl p-6 backdrop-blur-md">
                      <div className="flex items-start gap-4">
                        <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                          <Info className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-purple-300 mb-2">Pro Tip</h3>
                          <p className="text-gray-300 text-sm leading-relaxed">
                            We charge a <span className="text-purple-400 font-semibold">10% commission</span> on every ticket sold through AR Events BD. 
                            This helps us maintain the platform and provide premium services to both organizers and attendees.
                          </p>
                        </div>
                      </div>
                    </div>
                  </motion.div>

                  {/* Form */}
                  <motion.form
                    onSubmit={handleSubmit}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    whileHover={{ y: -2 }}
                    className="relative"
                  >
                    {/* Glassmorphism Background */}
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-900/10 to-pink-900/10 backdrop-blur-xl rounded-2xl border border-purple-500/20"></div>
                    
                    <div className="relative bg-black/40 backdrop-blur-lg rounded-2xl p-8 border border-purple-500/30 shadow-2xl">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                        {/* Event Type */}
                        <div className="relative">
                          <label className="block text-sm font-medium mb-3 text-purple-300 flex items-center gap-2">
                            <Music className="w-4 h-4" />
                            Event Type
                          </label>
                          <select
                            name="eventType"
                            value={formData.eventType}
                            onChange={handleInputChange}
                            required
                            className={`w-full px-4 py-3 bg-gray-900/50 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition-all backdrop-blur-sm ${
                              formErrors.eventType ? 'border-red-500/50 shadow-red-500/20' : 'border-purple-500/30'
                            }`}
                          >
                            <option value="general">General Event</option>
                            <option value="band">Band Concert</option>
                          </select>
                        </div>

                        {/* Event Name */}
                        <div className="relative">
                          <label className="block text-sm font-medium mb-3 text-purple-300 flex items-center gap-2">
                            <Sparkles className="w-4 h-4" />
                            Event Name
                          </label>
                          <input
                            type="text"
                            name="eventName"
                            value={formData.eventName}
                            onChange={handleInputChange}
                            required
                            className={`w-full px-4 py-3 bg-gray-900/50 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition-all backdrop-blur-sm ${
                              formErrors.eventName ? 'border-red-500/50 shadow-red-500/20' : 'border-purple-500/30'
                            }`}
                            placeholder="Enter your event name"
                          />
                        </div>

                        {/* Venue */}
                        <div className="relative">
                          <label className="block text-sm font-medium mb-3 text-purple-300 flex items-center gap-2">
                            <MapPin className="w-4 h-4" />
                            Venue
                          </label>
                          <input
                            type="text"
                            name="venue"
                            value={formData.venue}
                            onChange={handleInputChange}
                            required
                            className={`w-full px-4 py-3 bg-gray-900/50 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition-all backdrop-blur-sm ${
                              formErrors.venue ? 'border-red-500/50 shadow-red-500/20' : 'border-purple-500/30'
                            }`}
                            placeholder="Event location"
                          />
                        </div>

                        {/* Price */}
                        <div className="relative">
                          <label className="block text-sm font-medium mb-3 text-purple-300 flex items-center gap-2">
                            <Tag className="w-4 h-4" />
                            Price (৳)
                          </label>
                          <input
                            type="number"
                            name="price"
                            value={formData.price}
                            onChange={handleInputChange}
                            required
                            className={`w-full px-4 py-3 bg-gray-900/50 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition-all backdrop-blur-sm ${
                              formErrors.price ? 'border-red-500/50 shadow-red-500/20' : 'border-purple-500/30'
                            }`}
                            placeholder="Ticket price"
                          />
                        </div>

                        {/* Total Tickets */}
                        <div className="relative">
                          <label className="block text-sm font-medium mb-3 text-purple-300 flex items-center gap-2">
                            <Users className="w-4 h-4" />
                            Total Tickets Available
                          </label>
                          <input
                            type="number"
                            name="totalTickets"
                            value={formData.totalTickets}
                            onChange={handleInputChange}
                            required
                            min="1"
                            className={`w-full px-4 py-3 bg-gray-900/50 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition-all backdrop-blur-sm ${
                              formErrors.totalTickets ? 'border-red-500/50 shadow-red-500/20' : 'border-purple-500/30'
                            }`}
                            placeholder="Number of tickets"
                          />
                        </div>

                        {/* Date & Time */}
                        <div className="relative">
                          <label className="block text-sm font-medium mb-3 text-purple-300 flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            Date & Time
                          </label>
                          <input
                            type="datetime-local"
                            name="time"
                            value={formData.time}
                            onChange={handleInputChange}
                            required
                            className={`w-full px-4 py-3 bg-gray-900/50 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition-all backdrop-blur-sm ${
                              formErrors.time ? 'border-red-500/50 shadow-red-500/20' : 'border-purple-500/30'
                            }`}
                          />
                        </div>

                        {/* Band Name (Conditional) */}
                        {formData.eventType === 'band' && (
                          <div className="relative">
                            <label className="block text-sm font-medium mb-3 text-purple-300 flex items-center gap-2">
                              <Music className="w-4 h-4" />
                              Band Name
                            </label>
                            <input
                              type="text"
                              name="bandName"
                              value={formData.bandName}
                              onChange={handleInputChange}
                              required
                              className={`w-full px-4 py-3 bg-gray-900/50 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition-all backdrop-blur-sm ${
                                formErrors.bandName ? 'border-red-500/50 shadow-red-500/20' : 'border-purple-500/30'
                              }`}
                              placeholder="Band name"
                            />
                          </div>
                        )}
                      </div>

                      {/* Description */}
                      <div className="mb-8">
                        <label className="block text-sm font-medium mb-3 text-purple-300 flex items-center gap-2">
                          <FileImage className="w-4 h-4" />
                          Event Description
                        </label>
                        <textarea
                          name="details"
                          value={formData.details}
                          onChange={handleInputChange}
                          required
                          rows={4}
                          className={`w-full px-4 py-3 bg-gray-900/50 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition-all backdrop-blur-sm resize-none ${
                            formErrors.details ? 'border-red-500/50 shadow-red-500/20' : 'border-purple-500/30'
                          }`}
                          placeholder="Describe your event in detail..."
                        />
                      </div>

                      {/* Banner Image Upload */}
                      <div className="mb-8">
                        <label className="block text-sm font-medium mb-3 text-purple-300 flex items-center gap-2">
                          <Upload className="w-4 h-4" />
                          Banner Image
                        </label>
                        <div
                          className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer hover:border-purple-500/50 ${
                            formErrors.bannerImage ? 'border-red-500/50 bg-red-500/5' : 'border-purple-500/30 bg-purple-500/5'
                          }`}
                          onClick={() => document.getElementById('modal-banner-upload')?.click()}
                        >
                          <input
                            id="modal-banner-upload"
                            type="file"
                            accept="image/*"
                            onChange={handleImageUpload}
                            className="hidden"
                          />
                          
                          {formData.bannerImage ? (
                            <div className="space-y-4">
                              <img 
                                src={formData.bannerImage} 
                                alt="Banner preview" 
                                className="w-full h-48 object-cover rounded-lg"
                              />
                              <p className="text-sm text-purple-400">Click to change image</p>
                            </div>
                          ) : (
                            <div className="space-y-4">
                              <div className="w-16 h-16 bg-purple-600/20 rounded-full flex items-center justify-center mx-auto">
                                <Upload className="w-8 h-8 text-purple-400" />
                              </div>
                              <div>
                                <p className="text-purple-300 font-medium">Click or Drag Banner Image here</p>
                                <p className="text-gray-400 text-sm mt-1">Recommended: 1200x400px, Max 5MB</p>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Submit Button */}
                      <motion.button
                        type="submit"
                        disabled={submitLoading}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="w-full py-4 px-8 bg-gradient-to-r from-purple-600 via-purple-500 to-pink-600 rounded-xl font-semibold text-white text-lg shadow-lg hover:shadow-purple-500/25 transition-all duration-300 relative overflow-hidden group"
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-purple-600 via-purple-500 to-pink-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        <div className="absolute inset-0 bg-white/20 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                        <span className="relative flex items-center justify-center gap-3">
                          {submitLoading ? (
                            <>
                              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                              Posting Event...
                            </>
                          ) : (
                            <>
                              <Sparkles className="w-5 h-5" />
                              Post Event
                            </>
                          )}
                        </span>
                      </motion.button>
                    </div>
                  </motion.form>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.footer
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 2 }}
          className="py-16 px-6 border-t border-purple-500/30 bg-gradient-to-r from-black via-gray-900 to-black"
        >
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-center gap-8">
              <motion.div
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.3 }}
                className="text-center md:text-left"
              >
                <motion.h3
                  animate={{ 
                    textShadow: [
                      "0 0 10px #A855F7",
                      "0 0 20px #A855F7",
                      "0 0 30px #A855F7",
                      "0 0 20px #A855F7",
                      "0 0 10px #A855F7"
                    ]
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="text-4xl font-bold glow-text cursor-pointer"
                  style={{ color: "#A855F7" }}
                >
                  AR NIX
                </motion.h3>
                <p className="text-gray-400 mt-2">Premium Event Ticketing Platform</p>
              </motion.div>
              
              <motion.div className="text-center">
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 1, delay: 2.5 }}
                  className="flex items-center gap-2 text-gray-400"
                >
                  <div className="w-8 h-0.5 bg-purple-500"></div>
                  <span className="text-sm">EST 2024</span>
                  <div className="w-8 h-0.5 bg-purple-500"></div>
                </motion.div>
              </motion.div>
              
              <motion.div
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.3 }}
                className="text-center md:text-right"
              >
                <motion.p
                  animate={{ 
                    textShadow: [
                      "0 0 5px #A855F7",
                      "0 0 10px #A855F7",
                      "0 0 15px #A855F7",
                      "0 0 10px #A855F7",
                      "0 0 5px #A855F7"
                    ]
                  }}
                  transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
                  className="text-xl font-semibold glow-text cursor-pointer"
                  style={{ color: "#A855F7" }}
                >
                  Developed by AR Turjo
                </motion.p>
                <p className="text-gray-400 mt-2">Full Stack Developer</p>
              </motion.div>
            </div>
            
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 3 }}
              className="mt-12 pt-8 border-t border-purple-500/20 text-center"
            >
              <p className="text-gray-500 text-sm">
                © 2024 AR Events BD. All rights reserved. | Powered by AR NIX
              </p>
            </motion.div>
          </div>
        </motion.footer>
      </div>
    </div>
  );
}
