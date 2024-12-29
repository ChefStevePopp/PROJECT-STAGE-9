import React, { useState, useRef } from 'react';
import { Utensils, Upload, Camera, X } from 'lucide-react';
import type { Recipe } from '../../../types/recipe';
import { supabase } from '@/lib/supabase';
import toast from 'react-hot-toast';

interface PlatingStandardsProps {
  qualityStandards: Recipe['qualityStandards'];
  onChange: (updates: Partial<Recipe['qualityStandards']>) => void;
}

export const PlatingStandards: React.FC<PlatingStandardsProps> = ({
  qualityStandards,
  onChange
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      // Create file path: quality/plating/timestamp_filename
      const timestamp = Date.now();
      const filePath = `quality/plating/${timestamp}_${file.name}`;

      // Upload file to Supabase storage
      const { data, error } = await supabase.storage
        .from('recipe-media')
        .upload(filePath, file);

      if (error) throw error;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('recipe-media')
        .getPublicUrl(filePath);

      // Update plating image URL
      onChange({
        platingInstructions: {
          ...qualityStandards?.platingInstructions,
          imageUrl: publicUrl
        }
      });

      toast.success('Plating image uploaded successfully');
    } catch (error) {
      console.error('Error uploading plating image:', error);
      toast.error('Failed to upload plating image');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <div className="card p-6">
      <h3 className="text-lg font-medium text-white mb-4 flex items-center gap-2">
        <Utensils className="w-5 h-5 text-rose-400" />
        Plating Standards
      </h3>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-1">
            Plating Instructions
          </label>
          <textarea
            value={qualityStandards?.platingInstructions?.description || ''}
            onChange={(e) => onChange({
              platingInstructions: {
                ...qualityStandards?.platingInstructions,
                description: e.target.value
              }
            })}
            className="input w-full h-32"
            placeholder="Describe plating instructions in detail..."
          />
        </div>

        {/* Plating Reference Image */}
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-2">
            Plating Reference Image
          </label>
          <div className="relative aspect-video bg-gray-800 rounded-lg overflow-hidden">
            {qualityStandards?.platingInstructions?.imageUrl ? (
              <>
                <img
                  src={qualityStandards.platingInstructions.imageUrl}
                  alt="Plating reference"
                  className="w-full h-full object-cover"
                />
                <button
                  onClick={() => onChange({
                    platingInstructions: {
                      ...qualityStandards.platingInstructions,
                      imageUrl: undefined
                    }
                  })}
                  className="absolute top-2 right-2 p-1 bg-black/50 rounded-full text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </>
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
                <div className="flex gap-4">
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="btn-ghost"
                    disabled={isUploading}
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Upload Image
                  </button>
                  <button
                    className="btn-ghost"
                    disabled={isUploading}
                  >
                    <Camera className="w-4 h-4 mr-2" />
                    Take Photo
                  </button>
                </div>
                <p className="text-sm text-gray-500 mt-2">
                  Upload a reference photo of proper plating
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};