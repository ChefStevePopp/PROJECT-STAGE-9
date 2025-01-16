import React, { useState, useRef } from "react";
import {
  UserCircle,
  ChevronRight,
  ChevronLeft,
  Upload,
  Image,
} from "lucide-react";
import { supabase } from "@/lib/supabase";

interface AvatarCustomizerProps {
  value?: string;
  onChange: (url: string) => void;
  size?: "small" | "medium" | "large";
}

const STYLES = [
  { name: "Adventurer", style: "adventurer" },
  { name: "Adventurer Neutral", style: "adventurer-neutral" },
  { name: "Big Ears", style: "big-ears" },
  { name: "Big Ears Neutral", style: "big-ears-neutral" },
  { name: "Big Smile", style: "big-smile" },
  { name: "Bottts", style: "bottts" },
  { name: "Croodles", style: "croodles" },
  { name: "Fun Emoji", style: "fun-emoji" },
  { name: "Icons", style: "icons" },
  { name: "Lorelei", style: "lorelei" },
  { name: "Micah", style: "micah" },
  { name: "Miniavs", style: "miniavs" },
  { name: "Personas", style: "personas" },
  { name: "Pixel Art", style: "pixel-art" },
];

const generateSeed = () => Math.random().toString(36).substring(7);

export const AvatarCustomizer: React.FC<AvatarCustomizerProps> = ({
  value,
  onChange,
  size = "medium",
}) => {
  const [currentStyle, setCurrentStyle] = useState(0);
  const [seed, setSeed] = useState(generateSeed());
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const sizeClasses = {
    small: "w-8 h-8",
    medium: "w-12 h-12",
    large: "w-24 h-24",
  };

  const generateAvatar = (style: string, newSeed?: string) => {
    const avatarSeed = newSeed || seed;
    const url = `https://api.dicebear.com/7.x/${style}/svg?seed=${avatarSeed}`;
    onChange(url);
  };

  const nextStyle = () => {
    const nextIndex = (currentStyle + 1) % STYLES.length;
    setCurrentStyle(nextIndex);
    generateAvatar(STYLES[nextIndex].style);
  };

  const prevStyle = () => {
    const prevIndex = currentStyle === 0 ? STYLES.length - 1 : currentStyle - 1;
    setCurrentStyle(prevIndex);
    generateAvatar(STYLES[prevIndex].style);
  };

  const regenerateCurrentStyle = () => {
    const newSeed = generateSeed();
    setSeed(newSeed);
    generateAvatar(STYLES[currentStyle].style, newSeed);
  };

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);

      // Upload file to Supabase storage
      const fileExt = file.name.split(".").pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const { data, error } = await supabase.storage
        .from("avatars")
        .upload(fileName, file);

      if (error) throw error;

      // Get public URL
      const {
        data: { publicUrl },
      } = supabase.storage.from("avatars").getPublicUrl(data.path);

      onChange(publicUrl);
    } catch (error) {
      console.error("Error uploading avatar:", error);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={prevStyle}
          className="p-2 text-gray-400 hover:text-purple-400 hover:bg-gray-800/50 rounded-lg transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <button
          type="button"
          className={`${sizeClasses[size]} rounded-lg bg-gray-800 flex items-center justify-center overflow-hidden hover:ring-2 hover:ring-purple-500/50 transition-all relative group`}
          onClick={regenerateCurrentStyle}
        >
          {value ? (
            <img
              src={value}
              alt="Avatar"
              className="w-full h-full object-cover"
            />
          ) : (
            <UserCircle className="w-6 h-6 text-gray-400" />
          )}
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <Upload className="w-4 h-4 text-white" />
          </div>
        </button>

        <button
          type="button"
          onClick={nextStyle}
          className="p-2 text-gray-400 hover:text-purple-400 hover:bg-gray-800/50 rounded-lg transition-colors"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      <div className="text-sm text-gray-400">
        Style: {STYLES[currentStyle].name}
      </div>

      <div className="flex gap-2">
        <button
          type="button"
          onClick={regenerateCurrentStyle}
          className="text-sm text-purple-400 hover:text-purple-300 transition-colors"
        >
          Generate New
        </button>
        <span className="text-gray-600">|</span>
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="text-sm text-purple-400 hover:text-purple-300 transition-colors flex items-center gap-1"
          disabled={isUploading}
        >
          <Image className="w-3 h-3" />
          {isUploading ? "Uploading..." : "Upload Image"}
        </button>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileUpload}
        className="hidden"
      />
    </div>
  );
};
