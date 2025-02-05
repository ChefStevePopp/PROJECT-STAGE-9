import React from "react";
import { CheckCircle2 } from "lucide-react";
import type { Recipe } from "../../../types/recipe";

interface QualityProps {
  recipe: Recipe;
}

export const Quality: React.FC<QualityProps> = ({ recipe }) => {
  const quality = recipe.quality_standards || {};

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
          <CheckCircle2 className="w-5 h-5 text-green-400" />
        </div>
        <div>
          <h2 className="text-lg font-medium text-white">Quality Standards</h2>
          <p className="text-sm text-gray-400">
            Quality control specifications
          </p>
        </div>
      </div>

      {/* Appearance */}
      {quality.appearance_description && (
        <div className="bg-gray-800/50 rounded-lg p-4">
          <h3 className="text-sm font-medium text-gray-300 mb-2">Appearance</h3>
          <p className="text-gray-400">{quality.appearance_description}</p>
          {quality.appearance_image_urls?.length > 0 && (
            <div className="grid grid-cols-3 gap-4 mt-4">
              {quality.appearance_image_urls.map((url, index) => (
                <img
                  key={index}
                  src={url}
                  alt={`Appearance reference ${index + 1}`}
                  className="rounded-lg w-full aspect-video object-cover"
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Texture Points */}
      {quality.texture_points?.length > 0 && (
        <div className="bg-gray-800/50 rounded-lg p-4">
          <h3 className="text-sm font-medium text-gray-300 mb-4">
            Texture Standards
          </h3>
          <div className="space-y-2">
            {quality.texture_points.map((point, index) => (
              <div key={index} className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-400 mt-1" />
                <span className="text-gray-300">{point}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Taste Points */}
      {quality.taste_points?.length > 0 && (
        <div className="bg-gray-800/50 rounded-lg p-4">
          <h3 className="text-sm font-medium text-gray-300 mb-4">
            Taste Standards
          </h3>
          <div className="space-y-2">
            {quality.taste_points.map((point, index) => (
              <div key={index} className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-400 mt-1" />
                <span className="text-gray-300">{point}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Plating Standards */}
      {quality.plating_instructions && (
        <div className="bg-gray-800/50 rounded-lg p-4">
          <h3 className="text-sm font-medium text-gray-300 mb-2">
            Plating Standards
          </h3>
          <p className="text-gray-400">{quality.plating_instructions}</p>
          {quality.plating_image_urls?.length > 0 && (
            <div className="grid grid-cols-3 gap-4 mt-4">
              {quality.plating_image_urls.map((url, index) => (
                <img
                  key={index}
                  src={url}
                  alt={`Plating reference ${index + 1}`}
                  className="rounded-lg w-full aspect-video object-cover"
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
