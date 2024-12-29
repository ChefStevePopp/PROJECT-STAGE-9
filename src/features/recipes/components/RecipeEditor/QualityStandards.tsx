import React, { useState } from 'react';
import { 
  CheckCircle2, 
  Camera, 
  Thermometer, 
  AlertTriangle,
  Plus,
  Trash2,
  Upload,
  Eye,
  Scale,
  Utensils,
  Wind,
  X
} from 'lucide-react';
import type { Recipe } from '../../types/recipe';
import { supabase } from '@/lib/supabase';
import toast from 'react-hot-toast';

interface QualityStandardsProps {
  recipe: Recipe;
  onChange: (updates: Partial<Recipe>) => void;
}

export const QualityStandards: React.FC<QualityStandardsProps> = ({ recipe, onChange }) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Initialize default quality standards if not present
  const qualityStandards = recipe.quality_standards || {
    appearance_description: '',
    appearance_image_urls: [],
    texture_points: [],
    taste_points: [],
    aroma_points: [],
    plating_instructions: '',
    plating_image_urls: [],
    temperature: {
      value: 0,
      unit: 'F' as 'F' | 'C',
      tolerance: 0
    }
  };

  const updateQualityStandards = (updates: Partial<typeof qualityStandards>) => {
    onChange({
      quality_standards: {
        ...qualityStandards,
        ...updates
      }
    });
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>, type: 'appearance' | 'plating') => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadProgress(0);

    try {
      const timestamp = Date.now();
      const filePath = `${recipe.organization_id}/recipes/${recipe.id}/${type}/${timestamp}_${file.name}`;

      const { data, error } = await supabase.storage
        .from('recipe-media')
        .upload(filePath, file, {
          onUploadProgress: (progress) => {
            setUploadProgress((progress.loaded / progress.total) * 100);
          }
        });

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from('recipe-media')
        .getPublicUrl(filePath);

      if (type === 'appearance') {
        const currentUrls = qualityStandards.appearance_image_urls || [];
        updateQualityStandards({
          appearance_image_urls: [...currentUrls, publicUrl]
        });
      } else {
        const currentUrls = qualityStandards.plating_image_urls || [];
        updateQualityStandards({
          plating_image_urls: [...currentUrls, publicUrl]
        });
      }

      toast.success('Image uploaded successfully');
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error('Failed to upload image');
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  // Updated to use inline addition
  const addTexturePoint = () => {
    updateQualityStandards({
      texture_points: [...(qualityStandards.texture_points || []), '']
    });
  };

  const removeTexturePoint = (index: number) => {
    const points = qualityStandards.texture_points?.filter((_, i) => i !== index);
    updateQualityStandards({ texture_points: points });
  };

  // Updated to use inline addition
  const addTastePoint = () => {
    updateQualityStandards({
      taste_points: [...(qualityStandards.taste_points || []), '']
    });
  };

  const removeTastePoint = (index: number) => {
    const points = qualityStandards.taste_points?.filter((_, i) => i !== index);
    updateQualityStandards({ taste_points: points });
  };

  // Updated to use inline addition
  const addAromaPoint = () => {
    updateQualityStandards({
      aroma_points: [...(qualityStandards.aroma_points || []), '']
    });
  };

  const removeAromaPoint = (index: number) => {
    const points = qualityStandards.aroma_points?.filter((_, i) => i !== index);
    updateQualityStandards({ aroma_points: points });
  };

  return (
    <div className="space-y-6">
      {/* Visual Standards */}
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
              value={qualityStandards.appearance_description || ''}
              onChange={(e) => updateQualityStandards({
                appearance_description: e.target.value
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
                type="file"
                accept="image/*"
                onChange={(e) => handleImageUpload(e, 'appearance')}
                className="hidden"
                id="appearance-image-upload"
              />
              <label
                htmlFor="appearance-image-upload"
                className="btn-ghost text-sm cursor-pointer"
              >
                <Upload className="w-4 h-4 mr-2" />
                Upload Image
              </label>
            </div>

            {isUploading && (
              <div className="mb-4">
                <div className="flex justify-between text-sm text-gray-400 mb-1">
                  <span>Uploading...</span>
                  <span>{Math.round(uploadProgress)}%</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-primary-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
            )}

            <div className="grid grid-cols-3 gap-4">
              {(qualityStandards.appearance_image_urls || []).map((url, index) => (
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
                      const urls = qualityStandards.appearance_image_urls?.filter((_, i) => i !== index);
                      updateQualityStandards({ appearance_image_urls: urls });
                    }}
                    className="absolute top-2 right-2 p-1 bg-black/50 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Texture Standards - Updated to match Training Module style */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-white flex items-center gap-2">
            <Scale className="w-5 h-5 text-amber-400" />
            Texture Standards
          </h3>
          <button
            onClick={addTexturePoint}
            className="btn-ghost text-sm"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Texture Point
          </button>
        </div>
        <div className="space-y-4">
          {(qualityStandards.texture_points || []).map((point, index) => (
            <div
              key={index}
              className="flex items-start gap-4 bg-gray-800/50 rounded-lg p-4"
            >
              <CheckCircle2 className="w-5 h-5 text-amber-400 flex-shrink-0" />
              <div className="flex-1">
                <textarea
                  value={point}
                  onChange={(e) => {
                    const points = [...(qualityStandards.texture_points || [])];
                    points[index] = e.target.value;
                    updateQualityStandards({ texture_points: points });
                  }}
                  className="input w-full"
                  placeholder="Describe texture quality point..."
                  autoFocus={!point}
                />
              </div>
              <button
                onClick={() => removeTexturePoint(index)}
                className="text-gray-400 hover:text-rose-400"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Taste Standards - Updated to match Training Module style */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-white flex items-center gap-2">
            <Utensils className="w-5 h-5 text-green-400" />
            Taste Standards
          </h3>
          <button
            onClick={addTastePoint}
            className="btn-ghost text-sm"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Taste Point
          </button>
        </div>
        <div className="space-y-4">
          {(qualityStandards.taste_points || []).map((point, index) => (
            <div
              key={index}
              className="flex items-start gap-4 bg-gray-800/50 rounded-lg p-4"
            >
              <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0" />
              <div className="flex-1">
                <textarea
                  value={point}
                  onChange={(e) => {
                    const points = [...(qualityStandards.taste_points || [])];
                    points[index] = e.target.value;
                    updateQualityStandards({ taste_points: points });
                  }}
                  className="input w-full"
                  placeholder="Describe taste quality point..."
                  autoFocus={!point}
                />
              </div>
              <button
                onClick={() => removeTastePoint(index)}
                className="text-gray-400 hover:text-rose-400"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Aroma Standards - Updated to match Training Module style */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-white flex items-center gap-2">
            <Wind className="w-5 h-5 text-purple-400" />
            Aroma Standards
          </h3>
          <button
            onClick={addAromaPoint}
            className="btn-ghost text-sm"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Aroma Point
          </button>
        </div>
        <div className="space-y-4">
          {(qualityStandards.aroma_points || []).map((point, index) => (
            <div
              key={index}
              className="flex items-start gap-4 bg-gray-800/50 rounded-lg p-4"
            >
              <CheckCircle2 className="w-5 h-5 text-purple-400 flex-shrink-0" />
              <div className="flex-1">
                <textarea
                  value={point}
                  onChange={(e) => {
                    const points = [...(qualityStandards.aroma_points || [])];
                    points[index] = e.target.value;
                    updateQualityStandards({ aroma_points: points });
                  }}
                  className="input w-full"
                  placeholder="Describe aroma quality point..."
                  autoFocus={!point}
                />
              </div>
              <button
                onClick={() => removeAromaPoint(index)}
                className="text-gray-400 hover:text-rose-400"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Temperature Standards */}
      <div className="card p-6">
        <h3 className="text-lg font-medium text-white mb-4 flex items-center gap-2">
          <Thermometer className="w-5 h-5 text-blue-400" />
          Temperature Standards
        </h3>
        <div className="grid grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">
              Target Temperature
            </label>
            <div className="flex gap-2">
              <input
                type="number"
                value={qualityStandards.temperature?.value || ''}
                onChange={(e) => updateQualityStandards({
                  temperature: {
                    ...qualityStandards.temperature,
                    value: parseFloat(e.target.value)
                  }
                })}
                className="input flex-1"
                step="0.1"
              />
              <select
                value={qualityStandards.temperature?.unit || 'F'}
                onChange={(e) => updateQualityStandards({
                  temperature: {
                    ...qualityStandards.temperature,
                    unit: e.target.value as 'F' | 'C'
                  }
                })}
                className="input w-20"
              >
                <option value="F">°F</option>
                <option value="C">°C</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Plating Standards */}
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
              value={qualityStandards.plating_instructions || ''}
              onChange={(e) => updateQualityStandards({
                plating_instructions: e.target.value
              })}
              className="input w-full h-32"
              placeholder="Describe plating instructions in detail..."
            />
          </div>

          {/* Plating Reference Images */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-gray-400">
                Plating Reference Images
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleImageUpload(e, 'plating')}
                className="hidden"
                id="plating-image-upload"
              />
              <label
                htmlFor="plating-image-upload"
                className="btn-ghost text-sm cursor-pointer"
              >
                <Upload className="w-4 h-4 mr-2" />
                Add Plating Image
              </label>
            </div>

            {/* Grid of plating images */}
            <div className="grid grid-cols-3 gap-4">
              {(qualityStandards.plating_image_urls || []).map((url, index) => (
                <div
                  key={index}
                  className="relative group aspect-video bg-gray-800 rounded-lg overflow-hidden"
                >
                  <img
                    src={url}
                    alt={`Plating reference ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                  <button
                    onClick={() => {
                      const urls = qualityStandards.plating_image_urls?.filter((_, i) => i !== index);
                      updateQualityStandards({ plating_image_urls: urls });
                    }}
                    className="absolute top-2 right-2 p-1 bg-black/50 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}

              {/* Placeholder when no images */}
              {(!qualityStandards.plating_image_urls || qualityStandards.plating_image_urls.length === 0) && (
                <div className="aspect-video bg-gray-800/50 rounded-lg flex items-center justify-center">
                  <div className="text-center text-gray-400">
                    <Camera className="w-8 h-8 mx-auto mb-2" />
                    <p className="text-sm">No plating reference images</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};