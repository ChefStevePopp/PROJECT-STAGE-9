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

export const ALLOWED_LABEL_FILE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/pdf",
];

export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
export const MAX_LABEL_FILE_SIZE = 5 * 1024 * 1024; // 5MB for labels

export const mediaService = {
  async uploadStepMedia(
    file: File,
    recipeId: string,
    stepId: string,
  ): Promise<string> {
    try {
      if (!ALLOWED_FILE_TYPES.includes(file.type)) {
        throw new Error(
          "Invalid file type. Only images and videos are allowed.",
        );
      }

      if (file.size > MAX_FILE_SIZE) {
        throw new Error("File size too large. Maximum size is 10MB.");
      }

      // Get organization ID from user metadata
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user?.user_metadata?.organizationId) {
        throw new Error("No organization ID found");
      }

      const fileExt = file.name.split(".").pop();
      const filePath = `${user.user_metadata.organizationId}/recipes/${recipeId}/steps/${stepId}/${uuidv4()}.${fileExt}`;

      const { error: uploadError, data } = await supabase.storage
        .from("recipe-media")
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: false,
        });

      if (uploadError) throw uploadError;

      const {
        data: { publicUrl },
      } = supabase.storage.from("recipe-media").getPublicUrl(data.path);

      return publicUrl;
    } catch (error) {
      console.error("Error uploading media:", error);
      throw error;
    }
  },

  async uploadLabelTemplate(
    file: File,
    organizationId: string,
  ): Promise<string> {
    try {
      if (!ALLOWED_LABEL_FILE_TYPES.includes(file.type)) {
        throw new Error(
          "Only JPG, PNG, WebP or PDF files are allowed for label templates.",
        );
      }

      if (file.size > MAX_LABEL_FILE_SIZE) {
        throw new Error("File size too large. Maximum size is 5MB.");
      }

      // Get current user to verify organization access
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (
        !user?.user_metadata?.organizationId ||
        user.user_metadata.organizationId !== organizationId
      ) {
        throw new Error("Unauthorized to upload to this organization");
      }

      const fileExt = file.name.split(".").pop();
      const fileName = `${uuidv4()}.${fileExt}`;
      const filePath = `${organizationId}/${fileName}`;

      const { error: uploadError, data } = await supabase.storage
        .from("label-templates")
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: false,
        });

      if (uploadError) throw uploadError;

      return data.path;
    } catch (error) {
      console.error("Error uploading label template:", error);
      throw error;
    }
  },

  async deleteStepMedia(url: string): Promise<void> {
    try {
      // Extract the path from the URL
      const path = decodeURIComponent(url.split("/recipe-media/").pop() || "");
      if (!path) throw new Error("Invalid media URL");

      const { error } = await supabase.storage
        .from("recipe-media")
        .remove([path]);

      if (error) throw error;
      toast.success("Media deleted successfully");
    } catch (error) {
      console.error("Error deleting media:", error);
      throw error;
    }
  },

  async updateStepMedia(
    oldUrl: string | undefined,
    newFile: File,
    recipeId: string,
    stepId: string,
  ): Promise<string> {
    try {
      // Delete old media if it exists
      if (oldUrl) {
        await this.deleteStepMedia(oldUrl);
      }

      // Upload new media
      return await this.uploadStepMedia(newFile, recipeId, stepId);
    } catch (error) {
      console.error("Error updating media:", error);
      throw error;
    }
  },

  async uploadStorageImage(file: File): Promise<string> {
    try {
      if (!file.type.startsWith("image/")) {
        throw new Error("Only image files are allowed for storage locations.");
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

      const fileExt = file.name.split(".").pop();
      const filePath = `${user.user_metadata.organizationId}/storage-locations/${uuidv4()}.${fileExt}`;

      const { error: uploadError, data } = await supabase.storage
        .from("storage-images")
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: false,
        });

      if (uploadError) throw uploadError;

      const {
        data: { publicUrl },
      } = supabase.storage.from("storage-images").getPublicUrl(data.path);

      return publicUrl;
    } catch (error) {
      console.error("Error uploading storage image:", error);
      throw error;
    }
  },

  async deleteStorageImage(url: string): Promise<void> {
    try {
      const path = decodeURIComponent(
        url.split("/storage-images/").pop() || "",
      );
      if (!path) throw new Error("Invalid storage image URL");

      const { error } = await supabase.storage
        .from("storage-images")
        .remove([path]);

      if (error) throw error;
    } catch (error) {
      console.error("Error deleting storage image:", error);
      throw error;
    }
  },
};
