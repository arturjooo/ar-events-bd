"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { X, Upload, Music } from "lucide-react";

interface Band {
  id: number;
  name: string;
  story: string;
  image_url: string;
  bg_image_url: string;
}

interface BandEditModalProps {
  band: Band | null;
  onSave: (band: Band) => void;
  onCancel: () => void;
}

export default function BandEditModal({ band, onSave, onCancel }: BandEditModalProps) {
  const [formData, setFormData] = useState<Band>(
    band || {
      id: 0,
      name: "",
      story: "",
      image_url: "",
      bg_image_url: ""
    }
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setFormData(prev => ({ ...prev, image_url: base64String }));
      };
      
      reader.readAsDataURL(file);
    }
  };

  const handleBgFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setFormData(prev => ({ ...prev, bg_image_url: base64String }));
      };
      
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-gray-900 rounded-lg p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-purple-500/30"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-purple-400">
            {band?.id ? "Edit Band" : "Add New Band"}
          </h2>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Band Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className="w-full px-4 py-2 bg-gray-800 border border-purple-500/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500"
              placeholder="Enter band name"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Band Story</label>
            <textarea
              name="story"
              value={formData.story}
              onChange={handleInputChange}
              rows={6}
              className="w-full px-4 py-2 bg-gray-800 border border-purple-500/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500"
              placeholder="Enter the band's story, background, achievements..."
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Band Image</label>
            <div className="border-2 border-dashed border-purple-500/30 rounded-lg p-6 text-center">
              {formData.image_url ? (
                <div className="space-y-4">
                  <img 
                    src={formData.image_url} 
                    alt="Band preview" 
                    className="w-full h-48 object-cover rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, image_url: "" }))}
                    className="px-4 py-2 bg-red-600 rounded-lg hover:bg-red-700 transition-colors text-white"
                  >
                    Remove Image
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <Music className="w-16 h-16 text-purple-400 mx-auto" />
                  <div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                      id="band-image-upload"
                    />
                    <label
                      htmlFor="band-image-upload"
                      className="px-6 py-3 bg-purple-600 rounded-lg hover:bg-purple-700 transition-colors text-white cursor-pointer inline-block"
                    >
                      Choose Band Image
                    </label>
                  </div>
                  <p className="text-gray-400 text-sm">JPG, PNG up to 10MB</p>
                </div>
              )}
            </div>
          </div>

          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 px-6 py-3 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-6 py-3 bg-purple-600 rounded-lg hover:bg-purple-700 transition-colors font-medium"
            >
              {band?.id ? "Update Band" : "Add Band"}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
