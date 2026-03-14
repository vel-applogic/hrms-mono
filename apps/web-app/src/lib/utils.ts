export { cn } from '@repo/ui/lib/utils';

export const formatBytes = (bytes: number) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const isImage = (fileName: string) => {
  const ext = fileName.split('.').pop()?.toLowerCase();
  return ext === 'jpg' || ext === 'jpeg' || ext === 'png' || ext === 'gif' || ext === 'webp';
};

export const getFileType = (fileName: string): 'image' | 'video' | 'audio' | 'file' => {
  const ext = fileName.split('.').pop()?.toLowerCase();
  if (ext === 'jpg' || ext === 'jpeg' || ext === 'png' || ext === 'gif' || ext === 'webp' || ext === 'svg') {
    return 'image';
  } else if (ext === 'mp4' || ext === 'mov' || ext === 'avi' || ext === 'mkv' || ext === 'webm') {
    return 'video';
  } else if (ext === 'mp3' || ext === 'wav' || ext === 'ogg' || ext === 'm4a' || ext === 'aac') {
    return 'audio';
  }

  return 'file';
};
