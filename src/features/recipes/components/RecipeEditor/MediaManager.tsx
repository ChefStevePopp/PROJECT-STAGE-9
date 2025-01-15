import React, { useState, useRef } from "react";
import {
  Image,
  Video,
  Upload,
  X,
  Camera,
  Play,
  Star,
  Book,
  Plus,
  Trash2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import type { Recipe, RecipeMedia } from "../../types/recipe";
import toast from "react-hot-toast";

interface MediaManagerProps {
  recipe: Recipe;
  onChange: (updates: Partial<Recipe>) => void;
}

export const MediaManager: React.FC<MediaManagerProps> = ({
  recipe,
  onChange,
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedMedia, setSelectedMedia] = useState<RecipeMedia | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);

  const primaryMedia = recipe.media.find((m) => m.is_primary);
  const secondaryMedia = recipe.media.filter((m) => !m.is_primary);

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadProgress(0);

    try {
      const timestamp = Date.now();
      const filePath = `${recipe.organization_id}/recipes/${recipe.id}/${timestamp}_${file.name}`;

      const { data, error } = await supabase.storage
        .from("recipe-media")
        .upload(filePath, file, {
          onUploadProgress: (progress) => {
            setUploadProgress((progress.loaded / progress.total) * 100);
          },
        });

      if (error) throw error;

      const {
        data: { publicUrl },
      } = supabase.storage.from("recipe-media").getPublicUrl(filePath);

      const newMedia: RecipeMedia = {
        id: `media-${timestamp}`,
        type: file.type.startsWith("image/") ? "image" : "video",
        url: publicUrl,
        title: file.name,
        is_primary: recipe.media.length === 0,
      };

      onChange({
        media: [...recipe.media, newMedia],
      });

      toast.success("Media uploaded successfully");
    } catch (error) {
      console.error("Error uploading media:", error);
      toast.error("Failed to upload media");
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const startCapture = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      setIsCapturing(true);
    } catch (error) {
      console.error("Error accessing camera:", error);
      toast.error("Failed to access camera");
    }
  };

  const stopCapture = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
    setIsCapturing(false);
  };

  const takePhoto = async () => {
    if (videoRef.current) {
      const canvas = document.createElement("canvas");
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0);
        const blob = await new Promise<Blob>((resolve) => {
          canvas.toBlob((blob) => resolve(blob!), "image/jpeg", 0.8);
        });

        const timestamp = Date.now();
        const filePath = `${recipe.organization_id}/recipes/${recipe.id}/${timestamp}_photo.jpg`;

        const { data, error } = await supabase.storage
          .from("recipe-media")
          .upload(filePath, blob);

        if (error) throw error;

        const {
          data: { publicUrl },
        } = supabase.storage.from("recipe-media").getPublicUrl(filePath);

        const newMedia: RecipeMedia = {
          id: `media-${timestamp}`,
          type: "image",
          url: publicUrl,
          title: "Recipe Photo",
          is_primary: recipe.media.length === 0,
        };

        onChange({
          media: [...recipe.media, newMedia],
        });

        stopCapture();
        toast.success("Photo captured successfully");
      }
    }
  };

  const addVideoLink = () => {
    const url = prompt("Enter YouTube video URL:");
    if (!url) return;

    const videoId = url.match(
      /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/,
    )?.[1];

    if (!videoId) {
      toast.error("Invalid YouTube URL");
      return;
    }

    const timestamp = Date.now();
    const newMedia: RecipeMedia = {
      id: `media-${timestamp}`,
      type: "video",
      url: `https://www.youtube.com/embed/${videoId}`,
      title: "Recipe Video",
      is_primary: recipe.media.length === 0,
    };

    onChange({
      media: [...recipe.media, newMedia],
    });

    toast.success("Video link added successfully");
  };

  const deleteMedia = async (mediaId: string) => {
    try {
      const media = recipe.media.find((m) => m.id === mediaId);
      if (!media) return;

      if (media.url.includes("recipe-media")) {
        const filePath = media.url.split("/").pop();
        if (filePath) {
          const { error } = await supabase.storage
            .from("recipe-media")
            .remove([filePath]);

          if (error) throw error;
        }
      }

      onChange({
        media: recipe.media.filter((m) => m.id !== mediaId),
      });

      toast.success("Media deleted successfully");
    } catch (error) {
      console.error("Error deleting media:", error);
      toast.error("Failed to delete media");
    }
  };

  const setPrimaryMedia = (mediaId: string) => {
    onChange({
      media: recipe.media.map((m) => ({
        ...m,
        is_primary: m.id === mediaId,
      })),
    });
    toast.success("Primary media updated");
  };

  const updateMediaDetails = (
    mediaId: string,
    updates: Partial<RecipeMedia>,
  ) => {
    onChange({
      media: recipe.media.map((m) =>
        m.id === mediaId ? { ...m, ...updates } : m,
      ),
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
            <Image className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white mb-2">Recipe Images</h2>
            <p className="text-gray-400">
              Add a cover photo for your recipe library
            </p>
          </div>
        </div>
      </div>

      {/* Primary Image Section */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-white">Primary Image</h3>
          <div className="flex gap-4">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,video/*"
              onChange={handleFileUpload}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="btn-primary"
              disabled={isUploading}
            >
              <Upload className="w-5 h-5 mr-2" />
              Upload Media
            </button>
            <button
              onClick={startCapture}
              className="btn-ghost"
              disabled={isUploading}
            >
              <Camera className="w-5 h-5 mr-2" />
              Take Photo
            </button>
            <button
              onClick={addVideoLink}
              className="btn-ghost"
              disabled={isUploading}
            >
              <Video className="w-5 h-5 mr-2" />
              Add Video
            </button>
          </div>
        </div>

        <div className="relative rounded-lg overflow-hidden bg-gray-800">
          {primaryMedia ? (
            <>
              {primaryMedia.type === "image" ? (
                <img
                  src={primaryMedia.url}
                  alt={primaryMedia.title || "Primary recipe image"}
                  className="w-full h-96 object-cover"
                />
              ) : (
                <div className="relative w-full h-96 bg-gray-900">
                  <iframe
                    src={primaryMedia.url}
                    className="absolute inset-0 w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              )}
            </>
          ) : (
            <div className="w-full h-96 flex flex-col items-center justify-center bg-gray-800/50">
              <Image className="w-16 h-16 text-gray-600 mb-4" />
              <p className="text-gray-400">No primary image set</p>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="btn-primary mt-4"
              >
                <Plus className="w-5 h-5 mr-2" />
                Add Primary Image
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Upload Progress */}
      {isUploading && (
        <div className="card p-4">
          <div className="flex justify-between text-sm text-gray-400 mb-2">
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

      {/* Camera Capture */}
      {isCapturing && (
        <div className="card p-4">
          <div className="relative rounded-lg overflow-hidden">
            <video ref={videoRef} autoPlay playsInline className="w-full" />
            <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-4">
              <button onClick={takePhoto} className="btn-primary">
                <Camera className="w-5 h-5 mr-2" />
                Capture
              </button>
              <button onClick={stopCapture} className="btn-ghost">
                <X className="w-5 h-5 mr-2" />
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Secondary Images */}
      {secondaryMedia.length > 0 && (
        <div className="card p-6">
          <h3 className="text-lg font-medium text-white mb-4">Gallery</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {secondaryMedia.map((media) => (
              <div
                key={media.id}
                className="group relative aspect-square rounded-lg overflow-hidden bg-gray-800"
              >
                {media.type === "image" ? (
                  <img
                    src={media.url}
                    alt={media.title || "Recipe media"}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="relative w-full h-full bg-gray-900">
                    <iframe
                      src={media.url}
                      className="absolute inset-0 w-full h-full"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      <Play className="w-12 h-12 text-white" />
                    </div>
                  </div>
                )}

                {/* Hover Controls */}
                <div className="absolute inset-0 bg-black/75 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
                  <button
                    onClick={() => setPrimaryMedia(media.id)}
                    className="btn-primary btn-sm"
                  >
                    Set as Primary
                  </button>
                  <button
                    onClick={() => setSelectedMedia(media)}
                    className="btn-ghost btn-sm"
                  >
                    Edit Details
                  </button>
                  <button
                    onClick={() => deleteMedia(media.id)}
                    className="btn-ghost btn-sm text-red-400"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Media Preview Modal */}
      {selectedMedia && (
        <div className="fixed inset-0 bg-black/75 z-50 flex items-center justify-center p-4">
          <div className="bg-gray-900 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
            <div className="p-4 border-b border-gray-800 flex justify-between items-center">
              <h3 className="text-lg font-medium text-white">
                {selectedMedia.title || "Media Preview"}
              </h3>
              <button
                onClick={() => setSelectedMedia(null)}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-4">
              {selectedMedia.type === "image" ? (
                <img
                  src={selectedMedia.url}
                  alt={selectedMedia.title || "Recipe media"}
                  className="max-w-full max-h-[70vh] object-contain mx-auto"
                />
              ) : (
                <div className="relative pt-[56.25%]">
                  <iframe
                    src={selectedMedia.url}
                    className="absolute inset-0 w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              )}
            </div>
            <div className="p-4 border-t border-gray-800">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">
                    Title
                  </label>
                  <input
                    type="text"
                    value={selectedMedia.title || ""}
                    onChange={(e) =>
                      updateMediaDetails(selectedMedia.id, {
                        title: e.target.value,
                      })
                    }
                    className="input w-full"
                    placeholder="Enter media title"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">
                    Description
                  </label>
                  <textarea
                    value={selectedMedia.description || ""}
                    onChange={(e) =>
                      updateMediaDetails(selectedMedia.id, {
                        description: e.target.value,
                      })
                    }
                    className="input w-full h-24"
                    placeholder="Enter media description"
                  />
                </div>
                {selectedMedia.type === "video" && (
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">
                      Timestamp (seconds)
                    </label>
                    <input
                      type="number"
                      value={selectedMedia.timestamp || 0}
                      onChange={(e) =>
                        updateMediaDetails(selectedMedia.id, {
                          timestamp: parseInt(e.target.value),
                        })
                      }
                      className="input w-full"
                      min="0"
                      step="1"
                    />
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">
                    Associated Step
                  </label>
                  <select
                    value={selectedMedia.step_id || ""}
                    onChange={(e) =>
                      updateMediaDetails(selectedMedia.id, {
                        step_id: e.target.value,
                      })
                    }
                    className="input w-full"
                  >
                    <option value="">Not associated with a step</option>
                    {recipe.steps.map((step, index) => (
                      <option key={step.id} value={step.id}>
                        Step {index + 1}: {step.instruction.substring(0, 50)}...
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">
                    Tags
                  </label>
                  <input
                    type="text"
                    value={selectedMedia.tags?.join(", ") || ""}
                    onChange={(e) =>
                      updateMediaDetails(selectedMedia.id, {
                        tags: e.target.value
                          .split(",")
                          .map((tag) => tag.trim())
                          .filter(Boolean),
                      })
                    }
                    className="input w-full"
                    placeholder="Enter tags separated by commas"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
