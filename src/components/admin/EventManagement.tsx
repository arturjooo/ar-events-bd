"use client";

import { motion } from "framer-motion";
import { Check, X, Calendar, MapPin, Plus, Music, AlertCircle, Trash2 } from "lucide-react";

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

interface EventManagementProps {
  events: Event[];
  loading: boolean;
  onApproveEvent: (id: number) => void;
  onDeleteEvent: (id: number) => void;
  searchQuery: string;
}

export default function EventManagement({ events, loading, onApproveEvent, onDeleteEvent, searchQuery }: EventManagementProps) {
  const filteredEvents = events.filter(event =>
    event.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    event.venue.toLowerCase().includes(searchQuery.toLowerCase())
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
        filteredEvents.map((event, index) => (
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
                
                <div className="flex gap-2">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => onApproveEvent(event.id)}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 rounded-lg hover:bg-green-700 transition-colors font-medium"
                  >
                    <Check size={16} />
                    Approve Event
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => onDeleteEvent(event.id)}
                    className="flex items-center gap-2 px-4 py-2 bg-red-600 rounded-lg hover:bg-red-700 transition-colors font-medium"
                  >
                    <Trash2 size={16} />
                    Delete
                  </motion.button>
                </div>
              </div>
            </div>
          </motion.div>
        ))
      )}

      {filteredEvents.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12"
        >
          <p className="text-gray-400 text-lg">No events found</p>
        </motion.div>
      )}
    </div>
  );
}
