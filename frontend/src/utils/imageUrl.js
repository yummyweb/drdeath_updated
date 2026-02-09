import { getBackendUrl } from '@/config/env';

/**
 * Helper function to get the full image URL
 * Handles both Base64 (old format) and file paths (new format)
 */
export const getImageUrl = (imagePath) => {
  if (!imagePath) return '';
  if (imagePath.startsWith('data:image/')) return imagePath;
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) return imagePath;
  const backendUrl = getBackendUrl();
  if (imagePath.startsWith('/uploads/')) return `${backendUrl}${imagePath}`;
  return `${backendUrl}/uploads${imagePath.startsWith('/') ? imagePath : '/' + imagePath}`;
};

