import React, { useState, useRef } from 'react';
import { Printer, Calendar, Info, AlertCircle, Camera, Upload, X } from 'lucide-react';
import { AllergenBadge } from '@/features/allergens/components';
import type { Recipe } from '../../../types/recipe';
import { supabase } from '@/lib/supabase';
import toast from 'react-hot-toast';

interface LabelRequirementsProps {
  recipe: Recipe;
  onChange: (updates: Partial<Recipe>) => void;
}

export const LabelRequirements: React.FC<LabelRequirementsProps> = ({
  recipe,
  onChange
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      // Create file path: org_id/recipes/recipe_id/labels/timestamp_filename
      const timestamp = Date.now();
      const filePath = `${recipe.organizationId}/recipes/${recipe.id}/labels/${timestamp}_${file.name}`;

      // Upload file to Supabase storage
      const { data, error } = await supabase.storage
        .from('recipe-media')
        .upload(filePath, file);

      if (error) throw error;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('recipe-media')
        .getPublicUrl(filePath);

      // Update recipe with label image URL
      onChange({
        storage: {
          ...recipe.storage,
          labelImageUrl: publicUrl
        }
      });

      toast.success('Label image uploaded successfully');
    } catch (error) {
      console.error('Error uploading label image:', error);
      toast.error('Failed to upload label image');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <div className="card p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-white flex items-center gap-2">
          <Printer className="w-5 h-5 text-purple-400" />
          Label Requirements
        </h3>
        <button className="btn-ghost text-sm">
          <Printer className="w-4 h-4 mr-2" />
          Preview Label
        </button>
      </div>
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gray-800/50 rounded-lg p-4">
            <h4 className="text-sm font-medium text-gray-400 mb-2">Required Information</h4>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2 text-gray-300">
                <Calendar className="w-4 h-4 text-primary-400" />
                Prep Date & Time
              </li>
              <li className="flex items-center gap-2 text-gray-300">
                <Calendar className="w-4 h-4 text-rose-400" />
                Use By Date & Time
              </li>
              <li className="flex items-center gap-2 text-gray-300">
                <Info className="w-4 h-4 text-amber-400" />
                Product Name & Batch
              </li>
              <li className="flex items-center gap-2 text-gray-300">
                <AlertCircle className="w-4 h-4 text-yellow-400" />
                Allergen Warnings
              </li>
            </ul>
          </div>
          <div className="bg-gray-800/50 rounded-lg p-4">
            <h4 className="text-sm font-medium text-gray-400 mb-2">Storage Instructions</h4>
            <div className="space-y-2 text-sm">
              {recipe.storage?.temperature && (
                <p className="text-gray-300">
                  Store between {recipe.storage.temperature.value - recipe.storage.temperature.tolerance}° and{' '}
                  {recipe.storage.temperature.value + recipe.storage.temperature.tolerance}°
                  {recipe.storage.temperature.unit}
                </p>
              )}
              {recipe.storage?.specialInstructions?.map((instruction, index) => (
                <p key={index} className="text-gray-300">
                  • {instruction}
                </p>
              ))}
            </div>
          </div>
        </div>

        {/* Label Image Upload */}
        <div className="mt-6">
          <label className="block text-sm font-medium text-gray-400 mb-2">
            Label Example Image
          </label>
          <div className="relative aspect-video bg-gray-800 rounded-lg overflow-hidden">
            {recipe.storage?.labelImageUrl ? (
              <div className="relative">
                <img
                  src={recipe.storage.labelImageUrl}
                  alt="Label example"
                  className="w-full h-full object-cover"
                />
                <button
                  onClick={() => onChange({
                    storage: {
                      ...recipe.storage,
                      labelImageUrl: undefined
                    }
                  })}
                  className="absolute top-2 right-2 p-1 bg-black/50 rounded-full text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
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
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Upload Image
                  </button>
                  <button
                    className="btn-ghost"
                  >
                    <Camera className="w-4 h-4 mr-2" />
                    Take Photo
                  </button>
                </div>
                <p className="text-sm text-gray-500 mt-2">
                  Upload an example of how this item should be labeled
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Allergen Warnings */}
        {recipe.allergenInfo?.contains.length > 0 && (
          <div className="bg-rose-500/10 rounded-lg p-4 mt-4">
            <div className="flex gap-3">
              <AlertCircle className="w-5 h-5 text-rose-400 flex-shrink-0" />
              <div>
                <p className="text-rose-400 font-medium">Required Allergen Warnings</p>
                <div className="mt-2 space-y-2">
                  <p className="text-sm text-gray-300">
                    <span className="font-medium">Contains:</span>{' '}
                    <div className="flex flex-wrap gap-2 mt-2">
                      {recipe.allergenInfo.contains.map(allergen => (
                        <AllergenBadge 
                          key={allergen} 
                          type={allergen}
                          size="sm"
                        />
                      ))}
                    </div>
                  </p>
                  {recipe.allergenInfo.mayContain.length > 0 && (
                    <p className="text-sm text-gray-300">
                      <span className="font-medium">May Contain:</span>{' '}
                      <div className="flex flex-wrap gap-2 mt-2">
                        {recipe.allergenInfo.mayContain.map(allergen => (
                          <AllergenBadge 
                            key={allergen} 
                            type={allergen}
                            size="sm"
                          />
                        ))}
                      </div>
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};