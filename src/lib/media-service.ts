import { supabase } from "./supabase";
import { v4 as uuidv4 } from "uuid";
import toast from "react-hot-toast";

export const ALLOWED_FILE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "video/mp4",
  "video/quicktime",
];

export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export const mediaService = {
  async uploadQualityStandardImage(
    file: File,
    recipeId: string,
    type: "visual" | "plating",
  ): Promise<string> {
    try {
      if (!ALLOWED_FILE_TYPES.includes(file.type)) {
        throw new Error("Only images are allowed for quality standards.");
      }

      if (file.size > MAX_FILE_SIZE) {
        throw new Error("File size too large. Maximum size is 10MB.");
      }

      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user?.user_metadata?.organizationId) {
        throw new Error("No organization ID found");
      }

      const fileExt = file.name.split(".").pop()?.toLowerCase();
      const fileName = `${uuidv4()}.${fileExt}`;
      const filePath = `${user.user_metadata.organizationId}/${recipeId}/${type}/${fileName}`;

      const { error: uploadError, data } = await supabase.storage
        .from("quality-standards")
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: false,
        });

      if (uploadError) throw uploadError;

      const {
        data: { publicUrl },
      } = supabase.storage.from("quality-standards").getPublicUrl(data.path);

      return publicUrl;
    } catch (error) {
      console.error("Error uploading quality standard image:", error);
      throw error;
    }
  },

  async deleteQualityStandardImage(url: string): Promise<void> {
    try {
      const path = url.split("/quality-standards/").pop();
      if (!path) throw new Error("Invalid quality standard image URL");

      const { error } = await supabase.storage
        .from("quality-standards")
        .remove([decodeURIComponent(path)]);

      if (error) throw error;
    } catch (error) {
      console.error("Error deleting quality standard image:", error);
      throw error;
    }
  },
};
