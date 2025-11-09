import { supabase } from "@/lib/supabase/client";

/**
 * Uploads an image file to Supabase Storage
 * @param bucket - Storage bucket name (e.g., 'settings', 'courts')
 * @param file - File to upload
 * @param folder - Optional folder path within bucket (e.g., 'logos', 'courts')
 * @returns Public URL of uploaded file, or null if failed
 */
export async function uploadImage(
  bucket: string,
  file: File,
  folder?: string
): Promise<string | null> {
  try {
    // Generate unique filename to prevent conflicts
    const fileExt = file.name.split(".").pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
    const filePath = folder ? `${folder}/${fileName}` : fileName;

    console.log(`📤 Uploading to: ${bucket}/${filePath}`);

    // Upload file to Supabase Storage
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(filePath, file, {
        cacheControl: "3600", // Cache for 1 hour
        upsert: false, // Don't overwrite existing files
      });

    if (error) {
      console.error("Upload error:", error);
      throw error;
    }

    console.log("✅ Upload successful:", data);

    // Get public URL
    const { data: publicUrlData } = supabase.storage
      .from(bucket)
      .getPublicUrl(filePath);

    console.log("🔗 Public URL:", publicUrlData.publicUrl);

    return publicUrlData.publicUrl;
  } catch (error) {
    console.error("Error uploading image:", error);
    return null;
  }
}

/**
 * Deletes an image file from Supabase Storage
 * @param bucket - Storage bucket name
 * @param filePath - Full path to file (extract from URL)
 * @returns True if deleted successfully
 */
export async function deleteImage(
  bucket: string,
  filePath: string
): Promise<boolean> {
  try {
    console.log(`🗑️ Deleting: ${bucket}/${filePath}`);

    const { error } = await supabase.storage.from(bucket).remove([filePath]);

    if (error) {
      console.error("Delete error:", error);
      throw error;
    }

    console.log("✅ Delete successful");
    return true;
  } catch (error) {
    console.error("Error deleting image:", error);
    return false;
  }
}

/**
 * Extracts file path from Supabase Storage URL
 * @param url - Full public URL
 * @param bucket - Bucket name
 * @returns File path within bucket
 * 
 * Example:
 * Input: "https://abc.supabase.co/storage/v1/object/public/settings/logos/12345.jpg"
 * Output: "logos/12345.jpg"
 */
export function extractFilePathFromUrl(url: string, bucket: string): string | null {
  try {
    // Pattern: /storage/v1/object/public/{bucket}/{path}
    const pattern = new RegExp(`/storage/v1/object/public/${bucket}/(.+)$`);
    const match = url.match(pattern);
    return match ? match[1] : null;
  } catch (error) {
    console.error("Error extracting file path:", error);
    return null;
  }
}

/**
 * Validates image file before upload
 * @param file - File to validate
 * @param maxSizeMB - Maximum file size in MB (default: 5)
 * @returns Object with isValid and error message
 */
export function validateImageFile(
  file: File,
  maxSizeMB: number = 5
): { isValid: boolean; error?: string } {
  // Check file type
  const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"];
  if (!validTypes.includes(file.type)) {
    return {
      isValid: false,
      error: "Invalid file type. Please upload JPG, PNG, GIF, or WebP.",
    };
  }

  // Check file size
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  if (file.size > maxSizeBytes) {
    return {
      isValid: false,
      error: `File size must be less than ${maxSizeMB}MB. Your file is ${(file.size / 1024 / 1024).toFixed(2)}MB.`,
    };
  }

  return { isValid: true };
}