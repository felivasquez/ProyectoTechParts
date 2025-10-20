// backend/services/storageService.js
import supabase from '../config/client.js'

export const uploadFile = async (bucket, path, fileBuffer, contentType) => {
  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(path, fileBuffer, {
      contentType,
      upsert: true
    });
  if (error) throw error;
  return data;
};
