import React, { useState, useRef } from 'react';
import { Eye, Upload, Camera, X } from 'lucide-react';
import type { Recipe } from '../../../types/recipe';
import { supabase } from '@/lib/supabase';
import toast from 'react-hot-toast';

interface AppearanceStandardsProps {
  qualityStandards: Recipe['qualityStandards'];
  onChange: (updates: Partial<Recipe['qualityStandards']>) => void;
}

export const AppearanceStandards: React.FC<AppearanceStandardsProps> = ({
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
      // Create file path: org_id/recipes/recipe_id/quality/timestamp_filename
      const timestamp = Date.now();
      const filePath = `quality/${timestamp}_${file.name}`;

      // Upload file to Supabase storage
      const { data, error } = await supabase.storage
        .from('recipe-media')
        .upload(filePath, file);

      if (error) throw error;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('recipe-media')
        .getPublicUrl(filePath);

      // Update appearance image URLs
      onChange({
        appearance: {
          ...qualityStandards?.appearance,
          imageUrls: [...(qualityStandards?.appearance?.imageUrls || []), publicUrl]
        }
      });

      toast.success('Image uploaded successfully');
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error('Failed to upload image');
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
        <Eye className="w-5 h-5 text-primary-400" />
        Visual Standards
      </h3>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-1">
            Appearance Description
          </label>
          <textarea
            value={qualityStandards?.appearance?.description || ''}
            onChange={(e) => onChange({
              appearance: {
                ...qualityStandards?.appearance,
                description: e.target.value
              }
            })}
            className="input w-full h-24"
            placeholder="Describe the expected visual appearance..."
          />
        </div>

        {/* Reference Images */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium text-gray-400">
              Reference Images
            </label>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />
            <div className="flex gap-2">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="btn-ghost text-sm"
                disabled={isUploading}
              >
                <Upload className="w-4 h-4 mr-2" />
                Upload Image
              </button>
              <button
                className="btn-ghost text-sm"
                disabled={isUploading}
              >
                <Camera className="w-4 h-4 mr-2" />
                Take Photo
              </button>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            {qualityStandards?.appearance?.imageUrls?.map((url, index) => (
              <div
                key={index}
                className="relative group aspect-video bg-gray-800 rounded-lg overflow-hidden"
              >
                <img
                  src={url}
                  alt={`Quality standard ${index + 1}`}
                  className="w-full h-full object-cover"
                />
                <button
                  onClick={() => {
                    const newUrls = qualityStandards.appearance?.imageUrls?.filter((_, i) => i !== index);
                    onChange({
                      appearance: {
                        ...qualityStandards.appearance,
                        imageUrls: newUrls
                      }
                    });
                  }}
                  className="absolute top-2 right-2 p-1 bg-black/50 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};