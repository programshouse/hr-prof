import axiosClient from '@/services/http/axiosClient';

/**
 * Generate avatar URL with fallback to UI Avatars service
 * @param {string} fullName - Full name of the person
 * @param {string} imagePath - Optional image path from API
 * @returns {string} Avatar URL
 */
export function buildAvatarUrl(fullName, imagePath) {
  if (!imagePath) {
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(
      fullName || 'Employee'
    )}&background-gray&color=fff&size=128`;
  }

  // If imagePath is already a full URL, return it as-is
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }

  const base = (axiosClient.defaults.baseURL || '')
    .replace(/\/api\/?$/, '')
    .replace(/\/hr\/?$/, '');

  return `${base}/${String(imagePath).replace(/^\/+/, '')}`;
}
