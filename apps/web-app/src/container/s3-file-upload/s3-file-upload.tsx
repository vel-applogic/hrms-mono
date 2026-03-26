'use client';

import { MediaGetSignedUrlResponseType, MediaTypeDtoEnum, MediaUploadResponseType, UpsertMediaType } from '@repo/dto';
import { FILE_MAX_SIZE_IN_BYTES, IMAGE_MAX_SIZE_IN_BYTES } from '@repo/shared';
import Spinner from '@repo/ui/component/spinner';
import { Progress } from '@repo/ui/component/ui/progress';
import { PhotoProvider, PhotoView } from '@repo/ui/thirdparty/photo-view-provider';
import axios from 'axios';
import { ClipboardPaste, File as LucideFile, FileAudio, FileImage, FileText, Trash2, Upload, Video } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Accept, FileRejection, useDropzone } from 'react-dropzone';
import { toast } from 'sonner';

import { cn, formatBytes, getFileType, isImage } from '@/lib/utils';

import { getSignedUrlForUploadAction, getSignedUrlForViewAction } from './action';

// Helper: Extract image files from DataTransfer items (for web page drops like WhatsApp)
const extractImageFilesFromDrop = (dataTransfer: DataTransfer): File[] => {
  const files: File[] = [];

  // First, check dataTransfer.items for file entries (this works for web page image drags)
  if (dataTransfer.items) {
    for (let i = 0; i < dataTransfer.items.length; i++) {
      const item = dataTransfer.items[i];
      if (item && item.kind === 'file' && item.type.startsWith('image/')) {
        const file = item.getAsFile();
        if (file) {
          files.push(file);
        }
      }
    }
  }

  return files;
};

// Helper: Extract image URLs from DataTransfer (fallback for direct URL drops)
const extractImageUrlsFromDrop = (dataTransfer: DataTransfer): string[] => {
  const urls: string[] = [];

  // Check text/uri-list (direct URL drops)
  const uriList = dataTransfer.getData('text/uri-list');
  if (uriList) {
    urls.push(...uriList.split('\n').filter((url) => url && !url.startsWith('#')));
  }

  // Check text/html (img tags from web pages)
  const html = dataTransfer.getData('text/html');
  if (html) {
    const imgRegex = /<img[^>]+src=["']([^"']+)["']/gi;
    let match;
    while ((match = imgRegex.exec(html)) !== null) {
      if (match[1]) urls.push(match[1]);
    }
  }

  // Filter to fetchable image URLs only (exclude blob: URLs as they can't be fetched cross-origin)
  return urls.filter((url) => !url.startsWith('blob:') && (/\.(jpg|jpeg|png|gif|webp)(\?|$)/i.test(url) || url.includes('/image')));
};

// Helper: Fetch URL and convert to File
const fetchImageAsFile = async (url: string, index: number): Promise<File | null> => {
  try {
    const response = await fetch(url);
    if (!response.ok) return null;
    const blob = await response.blob();
    // Only accept image blobs
    if (!blob.type.startsWith('image/')) return null;
    const extension = blob.type.split('/')[1] || 'jpg';
    const fileName = `image-${Date.now()}-${index}.${extension}`;
    return new File([blob], fileName, { type: blob.type });
  } catch (error) {
    console.error('Failed to fetch image:', error);
    return null;
  }
};

interface Props {
  isMultiple?: boolean;
  media?: UpsertMediaType[];
  onUploaded: (value: UpsertMediaType) => void;
  onRemove: (index: number) => void;
  onError: (error?: string) => void;
  onNoteChange?: (index: number, note: string) => void;
  showNotes?: boolean;
  /** Show file preview above the upload dropzone (default: uploader first) */
  previewFirst?: boolean;
}

export const ImageUpload = (props: Props) => {
  return (
    <MediaUpload
      isMultiple={props.isMultiple}
      media={props.media}
      onRemove={props.onRemove}
      onUploaded={props.onUploaded}
      onError={props.onError}
      previewFirst={props.previewFirst}
      accept={{ 'image/jpeg': ['.jpg', '.jpeg'], 'image/png': ['.png'], 'image/gif': ['.gif'], 'image/webp': ['.webp'] }}
      maxSizeInBytes={IMAGE_MAX_SIZE_IN_BYTES}
      type={MediaTypeDtoEnum.image}
    />
  );
};

export const FileUpload = (props: Props) => {
  return (
    <MediaUpload
      isMultiple={props.isMultiple}
      media={props.media}
      onRemove={props.onRemove}
      onUploaded={props.onUploaded}
      onError={props.onError}
      previewFirst={props.previewFirst}
      accept={{
        'application/pdf': ['.pdf'],
        'application/msword': ['.doc'],
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
        'application/vnd.ms-powerpoint': ['.ppt'],
        'application/vnd.openxmlformats-officedocument.presentationml.presentation': ['.pptx'],
        'text/csv': ['.csv'],
      }}
      maxSizeInBytes={FILE_MAX_SIZE_IN_BYTES}
      type={MediaTypeDtoEnum.doc}
    />
  );
};

// Unified upload component that accepts both images and files
export const UnifiedUpload = (props: Props) => {
  // Accept both images and files
  const accept: Accept = {
    'image/jpeg': ['.jpg', '.jpeg'],
    'image/png': ['.png'],
    'image/gif': ['.gif'],
    'image/webp': ['.webp'],
    'application/pdf': ['.pdf'],
    'application/msword': ['.doc'],
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
    'application/vnd.ms-powerpoint': ['.ppt'],
    'application/vnd.openxmlformats-officedocument.presentationml.presentation': ['.pptx'],
    'text/csv': ['.csv'],
  };
  const maxSize = Math.max(IMAGE_MAX_SIZE_IN_BYTES, FILE_MAX_SIZE_IN_BYTES);

  return <MediaUpload {...props} accept={accept} previewFirst={props.previewFirst} maxSizeInBytes={maxSize} type={isImage(props.media?.[0]?.key || '') ? MediaTypeDtoEnum.image : MediaTypeDtoEnum.doc} />;
};

interface MediaUploadProps {
  isMultiple?: boolean;
  media?: UpsertMediaType[];
  onUploaded: (value: UpsertMediaType) => void;
  onRemove: (index: number) => void;
  onError: (error?: string) => void;
  onNoteChange?: (index: number, note: string) => void;
  showNotes?: boolean;
  maxSizeInBytes?: number;
  accept: Accept;
  type: MediaTypeDtoEnum;
  previewFirst?: boolean;
}

const MediaUpload = (props: MediaUploadProps) => {
  const [filesToUpload, setFilesToUpload] = useState<File[]>([]);
  const [currentFile, setCurrentFile] = useState<File | null>(null);
  const [result, setResult] = useState<MediaUploadResponseType>();
  const [progress, setProgress] = useState(0);
  const [isFocused, setIsFocused] = useState(false);
  const dropzoneRef = useRef<HTMLDivElement>(null);

  // Process queue of files
  useEffect(() => {
    if (filesToUpload.length > 0 && !currentFile) {
      const nextFile = filesToUpload[0];
      if (nextFile) {
        setCurrentFile(nextFile);
        setFilesToUpload((prev) => prev.slice(1));
        void getSignedUrlForUploadAction({ key: nextFile.name }).then(setResult);
      }
    }
  }, [filesToUpload, currentFile]);

  // Upload current file when we get the signed URL
  useEffect(() => {
    if (result && currentFile) {
      axios
        .put(result.url, currentFile, {
          headers: {
            'Content-Type': currentFile.type,
          },
          onUploadProgress: (progressEvent) => {
            if (progressEvent.total) {
              const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
              setProgress(progress);
            }
          },
        })
        .then(() => {
          props.onUploaded({ key: result.key, name: currentFile.name, type: props.type });
          setCurrentFile(null);
          setResult(undefined);
          setProgress(0);
        })
        .catch((error) => {
          console.error('Upload failed:', error);
          setCurrentFile(null);
          setResult(undefined);
          setProgress(0);
        });
    }
  }, [result, currentFile, props]);

  const { isMultiple, onError } = props;

  const onDrop = useCallback(
    (acceptedFiles: File[], fileRejections: FileRejection[]) => {
      if (acceptedFiles.length > 0) {
        if (isMultiple) {
          // Queue all files for upload
          setFilesToUpload((prev) => [...prev, ...acceptedFiles]);
        } else {
          // Replace queue with single file
          setFilesToUpload([acceptedFiles[0]!]);
        }
        onError(undefined);
      }
      if (fileRejections.length > 0) {
        if (fileRejections[0]!.errors && fileRejections[0]!.errors.length > 0) {
          onError(fileRejections[0]!.errors[0]!.message);
        } else {
          onError('File is not allowed');
        }
      }
    },
    [isMultiple, onError],
  );

  // Custom handler for images dragged from web pages (e.g., WhatsApp Web)
  const handleWebImageDrop = useCallback(
    async (e: React.DragEvent) => {
      const nativeFiles = e.dataTransfer.files;

      // If native files are present, let react-dropzone handle it
      if (nativeFiles.length > 0) return;

      // First, try to extract image files directly from DataTransfer items
      // This works for some sites that provide image data directly
      const extractedFiles = extractImageFilesFromDrop(e.dataTransfer);

      if (extractedFiles.length > 0) {
        e.preventDefault();
        e.stopPropagation();

        // Add to upload queue
        if (isMultiple) {
          setFilesToUpload((prev) => [...prev, ...extractedFiles]);
        } else {
          setFilesToUpload([extractedFiles[0]!]);
        }
        onError(undefined);
        return;
      }

      // Fallback: try to extract and fetch image URLs
      const imageUrls = extractImageUrlsFromDrop(e.dataTransfer);
      if (imageUrls.length === 0) return;

      e.preventDefault();
      e.stopPropagation();

      // Fetch all images and convert to Files
      const fetchedFiles = await Promise.all(imageUrls.map((url, i) => fetchImageAsFile(url, i)));

      const validFiles = fetchedFiles.filter((f): f is File => f !== null);
      const failedCount = imageUrls.length - validFiles.length;

      if (validFiles.length > 0) {
        // Add to upload queue (same as onDrop callback)
        if (isMultiple) {
          setFilesToUpload((prev) => [...prev, ...validFiles]);
        } else {
          setFilesToUpload([validFiles[0]!]);
        }
        onError(undefined);

        // Show warning if some images failed
        if (failedCount > 0) {
          toast.warning(`${failedCount} of ${imageUrls.length} images could not be loaded`);
        }
      } else {
        onError('Could not load images from the web page');
      }
    },
    [isMultiple, onError],
  );

  // Handle paste events for images (works with WhatsApp Web copy-paste)
  const handlePaste = useCallback(
    (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;

      const imageFiles: File[] = [];
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        if (item && item.type.startsWith('image/')) {
          const file = item.getAsFile();
          if (file) {
            imageFiles.push(file);
          }
        }
      }

      if (imageFiles.length > 0) {
        e.preventDefault();
        if (isMultiple) {
          setFilesToUpload((prev) => [...prev, ...imageFiles]);
        } else {
          setFilesToUpload([imageFiles[0]!]);
        }
        onError(undefined);
      }
    },
    [isMultiple, onError],
  );

  // Listen for paste events when dropzone is focused
  useEffect(() => {
    const handleGlobalPaste = (e: ClipboardEvent) => {
      if (isFocused) {
        handlePaste(e);
      }
    };

    document.addEventListener('paste', handleGlobalPaste);
    return () => document.removeEventListener('paste', handleGlobalPaste);
  }, [isFocused, handlePaste]);

  // Handle paste from clipboard button click
  const handlePasteFromClipboard = useCallback(async () => {
    try {
      const clipboardItems = await navigator.clipboard.read();
      const imageFiles: File[] = [];

      for (const item of clipboardItems) {
        // Find image type in the clipboard item
        const imageType = item.types.find((type) => type.startsWith('image/'));
        if (imageType) {
          const blob = await item.getType(imageType);
          const extension = imageType.split('/')[1] || 'png';
          const file = new File([blob], `pasted-image-${Date.now()}.${extension}`, { type: imageType });
          imageFiles.push(file);
        }
      }

      if (imageFiles.length > 0) {
        if (isMultiple) {
          setFilesToUpload((prev) => [...prev, ...imageFiles]);
        } else {
          setFilesToUpload([imageFiles[0]!]);
        }
        onError(undefined);
      } else {
        toast.error('No image found in clipboard');
      }
    } catch (error) {
      // User denied permission or clipboard is empty
      console.error('Failed to read clipboard:', error);
      toast.error('Could not access clipboard. Please copy an image first.');
    }
  }, [isMultiple, onError]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: props.accept,
    maxSize: props.maxSizeInBytes,
    multiple: props.isMultiple ?? false,
  });

  const hasUploadedFiles = props.media != null && props.media.length > 0;
  const showDropzone = props.isMultiple || (!hasUploadedFiles && !currentFile);
  const previewFirst = props.previewFirst ?? false;

  const dropzoneSection = showDropzone && (
    <>
      <div
        ref={dropzoneRef}
        {...getRootProps({
          onDrop: (e) => {
            void handleWebImageDrop(e);
          },
          onFocus: () => setIsFocused(true),
          onBlur: () => setIsFocused(false),
        })}
        tabIndex={0}
        className={cn(
          'border-2 border-dashed rounded-lg flex flex-col items-center justify-center px-6 py-8 cursor-pointer transition-all focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary',
          'bg-card border-border hover:border-muted-foreground/40 hover:bg-muted/50',
          isDragActive && 'border-primary bg-primary/5',
          isFocused && 'border-primary bg-primary/5',
        )}
      >
        <input {...getInputProps()} />
        <Upload className='w-8 h-8 mb-3 text-muted-foreground' />
        <div className='text-center'>
          <p className='text-sm text-foreground'>
            <span className='font-medium'>Click to upload</span> or drag and drop
          </p>
          <p className='text-xs mt-1 text-muted-foreground'>Max. File Size: {props.maxSizeInBytes ? formatBytes(props.maxSizeInBytes) : '30MB'}</p>
        </div>
      </div>
      <button
        type='button'
        onClick={handlePasteFromClipboard}
        className='flex items-center justify-center gap-2 w-full py-2 px-4 text-sm rounded-lg transition-colors text-muted-foreground bg-muted/50 border border-border hover:bg-muted hover:text-foreground'
      >
        <ClipboardPaste className='w-4 h-4' />
        Paste from clipboard
      </button>
    </>
  );

  const previewSection = hasUploadedFiles && <FilePreview media={props.media!} onRemove={(index) => props.onRemove(index)} onNoteChange={props.onNoteChange} showNotes={props.showNotes} />;

  return (
    <div className='flex flex-col gap-2'>
      {previewFirst ? (
        <>
          {previewSection}
          {dropzoneSection}
        </>
      ) : (
        <>
          {dropzoneSection}
          {previewSection}
        </>
      )}
      {currentFile && (
        <FileProgress
          file={currentFile}
          result={result}
          progress={progress}
          onRemove={() => {
            setCurrentFile(null);
            setResult(undefined);
            setProgress(0);
          }}
        />
      )}
      {filesToUpload.length > 0 && (
        <div className='text-sm text-muted-foreground'>
          {filesToUpload.length} file{filesToUpload.length > 1 ? 's' : ''} waiting to upload...
        </div>
      )}
    </div>
  );
};

const FileProgress = (props: { file: File; result?: MediaUploadResponseType; progress: number; onRemove: () => void }) => {
  const fileExtension = props.file.name.split('.').pop()?.toLowerCase() || '';
  const fileName = props.file.name.split('.').slice(0, -1).join('.') || props.file.name;

  return (
    <div className='flex flex-row items-center gap-3 border rounded-lg p-3 bg-card border-border'>
      <div className='shrink-0'>
        <div className='w-10 h-10 rounded flex items-center justify-center bg-muted'>
          {props.progress >= 100 && props.result?.key != null && isImage(props.file.name) ? (
            <PreviewImage imageKey={props.result?.key} />
          ) : (
            <FileIcon fileType={getFileType(props.file.name)} className='w-5 h-5 text-muted-foreground' />
          )}
        </div>
      </div>
      <div className='flex flex-col justify-center gap-0.5 flex-1 min-w-0'>
        <div className='font-medium text-sm truncate text-foreground'>{fileName}</div>
        <div className='flex flex-row items-center gap-3 text-xs text-muted-foreground'>
          <span>{formatBytes(props.file.size)}</span>
          <span className='uppercase font-medium'>{fileExtension}</span>
          {props.progress < 100 && <span>Uploading {props.progress}%</span>}
        </div>
        {props.progress < 100 && (
          <div className='mt-1'>
            <Progress value={props.progress} className='h-1' />
          </div>
        )}
      </div>
      <div className='shrink-0'>
        <button type='button' onClick={props.onRemove} className='p-1 rounded transition-colors hover:bg-muted'>
          <Trash2 className='w-4 h-4 text-muted-foreground' />
        </button>
      </div>
    </div>
  );
};

const FilePreview = (props: { media: UpsertMediaType[]; onRemove: (index: number) => void; onNoteChange?: (index: number, note: string) => void; showNotes?: boolean }) => {
  return (
    <div className='flex flex-col gap-2'>
      {props.media.map((m, index) => {
        const fileExtension = m.name?.split('.').pop()?.toLowerCase() || m.key.split('.').pop()?.toLowerCase() || '';
        const fileName = m.name?.split('.').slice(0, -1).join('.') || m.name || m.key;

        return (
          <div key={m.key} className='rounded-md border px-3 py-2 shadow-sm border-border bg-card'>
            <div className='flex flex-row items-center gap-3'>
              <div className='shrink-0'>
                <div className='w-10 h-10 rounded flex items-center justify-center bg-muted'>
                  {isImage(m.key) ? <PreviewImage imageKey={m.key} /> : <FileIcon fileType={getFileType(m.key)} className='w-5 h-5 text-muted-foreground' />}
                </div>
              </div>
              <div className='flex flex-col justify-center gap-0.5 flex-1 min-w-0'>
                <div className='font-medium text-sm truncate text-foreground'>{fileName}</div>
                <div className='flex flex-row items-center gap-3 text-xs text-muted-foreground'>
                  <span className='uppercase font-medium'>{fileExtension}</span>
                </div>
              </div>
              <div className='shrink-0'>
                <button type='button' onClick={() => props.onRemove(index)} className='p-1 rounded transition-colors hover:bg-muted'>
                  <Trash2 className='w-4 h-4 text-muted-foreground' />
                </button>
              </div>
            </div>
            {props.showNotes && props.onNoteChange && (
              <div className='mt-2'>
                <textarea
                  value={m.additionalInformation || ''}
                  onChange={(e) => props.onNoteChange!(index, e.target.value)}
                  placeholder='Add additional information (optional)...'
                  className='w-full text-sm border border-border rounded-md p-2 resize-none focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary'
                  rows={2}
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

const PreviewImage = (props: { imageKey: string }) => {
  const [signedUrl, setSignedUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!props.imageKey) return;
    const timer = setTimeout(() => {
      void getSignedUrlForViewAction({ key: props.imageKey }).then((result: MediaGetSignedUrlResponseType) => {
        setSignedUrl(result.url);
      });
    }, 1000);
    return () => clearTimeout(timer);
  }, [props.imageKey]);

  if (!isImage(props.imageKey)) {
    return <FileIcon fileType={getFileType(props.imageKey)} className='w-8 h-8 text-muted-foreground' />;
  }

  if (!signedUrl) {
    return (
      <div>
        <Spinner />
      </div>
    );
  }

  return (
    <PhotoProvider>
      <PhotoView src={signedUrl}>
        <img src={signedUrl} alt={'preview'} className='w-8 h-8 object-cover rounded cursor-pointer' />
      </PhotoView>
    </PhotoProvider>
  );
};

const FileIcon = (props: { fileType: 'image' | 'video' | 'audio' | 'file'; className?: string }) => {
  const iconProps = { className: props.className };

  if (props.fileType === 'image') {
    return <FileImage {...iconProps} />;
  } else if (props.fileType === 'video') {
    return <Video {...iconProps} />;
  } else if (props.fileType === 'audio') {
    return <FileAudio {...iconProps} />;
  } else {
    // Use FileText for PDFs and documents, File for others
    const isPdf = props.className && props.className.includes('pdf');
    return isPdf ? <FileText {...iconProps} /> : <LucideFile {...iconProps} />;
  }
};
