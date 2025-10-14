/**
 * Utility functions for handling media access and URLs
 */

export interface MediaInfo {
  id: string;
  original_filename: string;
  file_type: string;
  mime_type: string;
  file_size: number;
  access_url?: string;
  alt_text?: string;
}

/**
 * Get media URL for displaying in the UI
 */
export function getMediaUrl(mediaId: string | null | undefined): string | null {
  if (!mediaId) return null;
  return `/api/media/${mediaId}`;
}

/**
 * Get direct media access URL (for downloads)
 */
export function getMediaDownloadUrl(
  mediaId: string | null | undefined
): string | null {
  if (!mediaId) return null;
  return `/api/media/${mediaId}?download=true`;
}

/**
 * Fetch media info from API
 */
export async function fetchMediaInfo(
  mediaId: string | null | undefined
): Promise<MediaInfo | null> {
  if (!mediaId) return null;

  try {
    const response = await fetch(getMediaInfoUrl(mediaId)!);
    if (!response.ok) {
      console.error('Failed to fetch media info:', response.statusText);
      return null;
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching media info:', error);
    return null;
  }
}

/**
 * Get media info URL (returns JSON metadata)
 */
export function getMediaInfoUrl(
  mediaId: string | null | undefined
): string | null {
  if (!mediaId) return null;
  return `/api/media/${mediaId}?info=true`;
}

/**
 * Get thumbnail URL for course or video (direct file URL for Next.js Image component)
 */
export function getThumbnailUrl(
  thumbnailMediaId: string | null | undefined
): string | null {
  if (!thumbnailMediaId) return null;
  return getMediaUrl(thumbnailMediaId);
}

/**
 * Get video URL for playback
 */
export function getVideoUrl(
  videoMediaId: string | null | undefined
): string | null {
  if (!videoMediaId) return null;
  return getMediaUrl(videoMediaId);
}

/**
 * Format file size for display
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Get file icon based on mime type
 */
export function getFileIcon(mimeType: string): string {
  if (mimeType.startsWith('image/')) return '🖼️';
  if (mimeType.startsWith('video/')) return '🎥';
  if (mimeType.startsWith('audio/')) return '🎵';
  if (mimeType.includes('pdf')) return '📄';
  if (mimeType.includes('document') || mimeType.includes('docx')) return '📝';
  if (mimeType.includes('spreadsheet') || mimeType.includes('xlsx'))
    return '📊';
  if (mimeType.includes('presentation') || mimeType.includes('pptx'))
    return '📽️';
  return '📎';
}

/**
 * Check if media type supports thumbnail preview
 */
export function supportsThumbnail(mimeType: string): boolean {
  return mimeType.startsWith('image/') || mimeType.startsWith('video/');
}

/**
 * Check if media type supports inline preview
 */
export function supportsInlinePreview(mimeType: string): boolean {
  return (
    mimeType.startsWith('image/') ||
    mimeType.startsWith('video/') ||
    mimeType.startsWith('audio/') ||
    mimeType.includes('pdf')
  );
}
