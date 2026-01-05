"use client";

import { motion } from "framer-motion";
import { Check, X, Music, AlertCircle, Plus, Trash2 } from "lucide-react";

interface Band {
  id: number;
  name: string;
  story: string;
  image_url: string;
  bg_image_url: string;
}

interface BandManagementProps {
  bands: Band[];
  loading: boolean;
  onEditBand: (band: Band) => void;
  onDeleteBand: (id: number) => void;
  searchQuery: string;
}

export default function BandManagement({ bands, loading, onEditBand, onDeleteBand, searchQuery }: BandManagementProps) {
  const filteredBands = bands.filter(band =>
    band.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-purple-400">Manage Top 10 BD Bands</h2>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => onEditBand({ id: 0, name: '', story: '', image_url: '', bg_image_url: '' })}
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 rounded-lg hover:bg-purple-700 transition-colors font-medium"
        >
          <Plus size={16} />
          Add New Band
        </motion.button>
      </div>

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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBands.map((band, index) => (
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
                    onClick={() => onEditBand(band)}
                    className="flex-1 px-3 py-2 bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm"
                  >
                    Edit
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => onDeleteBand(band.id)}
                    className="flex-1 px-3 py-2 bg-red-600 rounded-lg hover:bg-red-700 transition-colors font-medium text-sm"
                  >
                    Delete
                  </motion.button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {!loading && filteredBands.length === 0 && (
        <div className="text-center py-12">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <Music className="w-16 h-16 text-purple-400 mx-auto mb-4" />
            <p className="text-gray-400 text-lg mb-4">No bands found</p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onEditBand({ id: 0, name: '', story: '', image_url: '', bg_image_url: '' })}
              className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 rounded-lg hover:bg-purple-700 transition-colors font-medium"
            >
              <Plus size={16} />
              Add Your First Band
            </motion.button>
          </motion.div>
        </div>
      )}
    </div>
  );
}
