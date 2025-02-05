import React from "react";
import { Image, Play, Video } from "lucide-react";
import type { Recipe } from "../../../types/recipe";

interface MediaProps {
  recipe: Recipe;
}

export const Media: React.FC<MediaProps> = ({ recipe }) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
          <Image className="w-5 h-5 text-blue-400" />
        </div>
        <div>
          <h2 className="text-lg font-medium text-white">Media Gallery</h2>
          <p className="text-sm text-gray-400">Photos and videos</p>
        </div>
      </div>

      {recipe.media?.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {recipe.media.map((media) => (
            <div
              key={media.id}
              className="bg-gray-800/50 rounded-lg overflow-hidden"
            >
              {media.type === "image" ? (
                <div className="aspect-video relative">
                  <img
                    src={media.url}
                    alt={media.title || "Recipe image"}
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                </div>
              ) : media.type === "video" ? (
                <div className="aspect-video relative">
                  <video
                    src={media.url}
                    controls
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="aspect-video relative">
                  <iframe
                    src={media.url}
                    title={media.title || "External video"}
                    className="absolute inset-0 w-full h-full"
                    allowFullScreen
                  />
                </div>
              )}
              <div className="p-3 border-t border-gray-700">
                <div className="flex items-center gap-2 text-sm">
                  {media.type === "image" && (
                    <Image className="w-4 h-4 text-blue-400" />
                  )}
                  {media.type === "video" && (
                    <Video className="w-4 h-4 text-purple-400" />
                  )}
                  {media.type === "external-video" && (
                    <Play className="w-4 h-4 text-red-400" />
                  )}
                  <span className="text-gray-400">
                    {media.title || "Untitled"}
                  </span>
                </div>
                {media.description && (
                  <p className="text-xs text-gray-500 mt-1">
                    {media.description}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-gray-400">
          No media has been added to this recipe.
        </div>
      )}
    </div>
  );
};
