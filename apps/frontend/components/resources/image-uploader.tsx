'use client';

import { useRef, useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Upload, X, Link as LinkIcon, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { api } from '@/lib/api';

interface ImageUploaderProps {
  value?: string;
  onChange: (url: string) => void;
  label?: string;
}

export function ImageUploader({ value, onChange, label = 'Image' }: ImageUploaderProps) {
  // Derive mode from value - use local state only for user toggles
  const getModeFromValue = (val?: string): 'upload' | 'url' => {
    if (!val) return 'upload';
    return val.startsWith('data:') || val.startsWith('blob:') ? 'upload' : 'url';
  };

  const [mode, setMode] = useState<'upload' | 'url'>(() => getModeFromValue(value));
  const [urlInput, setUrlInput] = useState<string>('');
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  // Track uploaded blob URLs that haven't been saved to a resource yet
  const uploadedBlobUrlRef = useRef<string | null>(null);

  // Derive display values from props
  const preview = value || null;
  const currentMode = value ? getModeFromValue(value) : mode;

  // Use value prop directly for controlled input - key resets input when value changes externally
  // Local urlInput state is only for intermediate typing (invalid URLs)
  const displayUrl = urlInput || value || '';
  const inputKey = value || 'empty';

  const processFile = async (file: File) => {
    if (!file) return;

    // Validate file size (5MB max)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      alert('File size must be less than 5MB');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      return;
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      alert('Invalid file type. Please upload an image (JPEG, PNG, GIF, or WebP)');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      return;
    }

    setIsUploading(true);

    try {
      // Upload to cloud storage
      const result = await api.storage.uploadImage(file, 'resources');

      // Track this blob URL for cleanup if removed before saving
      uploadedBlobUrlRef.current = result.url;

      // Update form with cloud URL (short, < 250 chars)
      onChange(result.url);

      // Clear file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      console.error('Upload failed:', error);
      alert(
        error instanceof Error
          ? `Failed to upload image: ${error.message}`
          : 'Failed to upload image. Please try again.'
      );
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await processFile(file);
    }
  };

  const handleUrlChange = async (url: string) => {
    // If switching from blob URL to external URL, delete the blob URL
    const currentUrl = value || uploadedBlobUrlRef.current;
    if (currentUrl && isBlobUrl(currentUrl) && url && isValidUrl(url) && !isBlobUrl(url)) {
      // User is replacing blob URL with external URL - delete the blob
      if (uploadedBlobUrlRef.current === currentUrl) {
        await deleteBlobUrl(currentUrl);
        uploadedBlobUrlRef.current = null;
      }
    }

    // Only call onChange for valid URLs or empty string
    // This allows typing invalid URLs without triggering onChange
    if (url && isValidUrl(url)) {
      // If it's a blob URL, track it
      if (isBlobUrl(url)) {
        uploadedBlobUrlRef.current = url;
      } else {
        // External URL - clear tracked blob URL
        uploadedBlobUrlRef.current = null;
      }
      onChange(url);
      setUrlInput(''); // Clear local state after valid URL is set
    } else if (!url) {
      // If clearing and we have a tracked blob URL, delete it
      if (uploadedBlobUrlRef.current) {
        await deleteBlobUrl(uploadedBlobUrlRef.current);
        uploadedBlobUrlRef.current = null;
      }
      onChange('');
      setUrlInput('');
    } else {
      // Store invalid URL in local state for display
      setUrlInput(url);
    }
  };

  // Clear local state when value changes externally (input key handles visual reset)
  // Use displayUrl which falls back to value, so local state is only for invalid URLs

  const isValidUrl = (string: string) => {
    try {
      new URL(string);
      return true;
    } catch {
      return false;
    }
  };

  const handleRemove = async () => {
    // If removing a blob URL, delete it from storage
    const currentUrl = value;
    if (currentUrl && isBlobUrl(currentUrl)) {
      try {
        await api.storage.deleteImage(currentUrl);
      } catch (error) {
        // Log error but continue with removal - cleanup is best effort
        console.error('Failed to delete blob image:', error);
      }
    }

    // Clear tracking
    uploadedBlobUrlRef.current = null;
    setUrlInput('');
    onChange('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      await processFile(file);
      setMode('upload');
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  // Check if src is a data URI or blob URI (not supported by Next.js Image)
  const isDataOrBlobUri = (src: string | null): boolean => {
    if (!src) return false;
    return src.startsWith('data:') || src.startsWith('blob:');
  };

  // Check if URL is a Vercel Blob URL
  const isBlobUrl = (url: string | null | undefined): boolean => {
    if (!url) return false;
    return url.includes('blob.vercel-storage.com');
  };

  // Delete blob URL from storage
  const deleteBlobUrl = useCallback(async (url: string) => {
    if (!url.includes('blob.vercel-storage.com')) return;

    try {
      await api.storage.deleteImage(url);
    } catch (error) {
      // Log error but don't block UI - cleanup is best effort
      console.error('Failed to delete blob image:', error);
    }
  }, []);

  // Render image - use regular img tag for data/blob URIs, Next.js Image for regular URLs
  const renderImage = (src: string, alt: string) => {
    if (isDataOrBlobUri(src)) {
      return (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt={alt} className="object-cover w-full h-full" />
      );
    }
    return <Image src={src} alt={alt} fill className="object-cover" sizes="100vw" />;
  };

  // Cleanup: Delete blob URL on unmount if it hasn't been saved
  useEffect(() => {
    return () => {
      // On unmount, if we have an unsaved blob URL, delete it
      if (uploadedBlobUrlRef.current) {
        deleteBlobUrl(uploadedBlobUrlRef.current).catch((error) => {
          console.error('Failed to cleanup blob URL on unmount:', error);
        });
      }
    };
  }, [deleteBlobUrl]);

  // Reset tracked blob URL when value changes externally (e.g., form reset, edit mode, form saved)
  useEffect(() => {
    if (!value) {
      // Value cleared externally
      uploadedBlobUrlRef.current = null;
    } else if (value === uploadedBlobUrlRef.current) {
      // Value matches our tracked URL - this means the form was saved successfully
      // Clear tracking since the image is now part of the saved resource
      uploadedBlobUrlRef.current = null;
    } else if (value && value !== uploadedBlobUrlRef.current) {
      // Value is different - this is an existing resource image or external URL
      // Don't track for cleanup
      uploadedBlobUrlRef.current = null;
    }
  }, [value]);

  return (
    <div className="space-y-2">
      {label && <Label>{label}</Label>}

      {/* Mode Toggle */}
      <div className="flex gap-2 border-b border-zinc-200 dark:border-zinc-800">
        <Button
          type="button"
          variant={currentMode === 'upload' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setMode('upload')}
          className="rounded-b-none"
          disabled={isUploading}
        >
          <Upload className="mr-2 h-4 w-4" />
          Upload
        </Button>
        <Button
          type="button"
          variant={currentMode === 'url' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setMode('url')}
          className="rounded-b-none"
          disabled={isUploading}
        >
          <LinkIcon className="mr-2 h-4 w-4" />
          URL
        </Button>
      </div>

      {currentMode === 'url' ? (
        <div className="space-y-2">
          <Input
            key={inputKey}
            type="url"
            placeholder="https://example.com/image.jpg"
            value={displayUrl}
            onChange={(e) => handleUrlChange(e.target.value)}
            disabled={isUploading}
          />
          {displayUrl && !isValidUrl(displayUrl) && (
            <p className="text-sm text-red-600 dark:text-red-400">Please enter a valid URL</p>
          )}
        </div>
      ) : (
        <div
          className={cn(
            'relative border-2 border-dashed rounded-lg p-4 transition-colors',
            'border-zinc-300 dark:border-zinc-700',
            'hover:border-zinc-400 dark:hover:border-zinc-600',
            isUploading && 'opacity-50 pointer-events-none'
          )}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
        >
          {isUploading ? (
            <div className="flex flex-col items-center justify-center py-8">
              <Loader2 className="h-8 w-8 text-blue-600 animate-spin mb-2" />
              <p className="text-sm text-zinc-600 dark:text-zinc-400">Uploading image...</p>
            </div>
          ) : preview ? (
            <div className="relative w-full h-48 rounded-md overflow-hidden bg-zinc-200 dark:bg-zinc-800">
              {renderImage(preview, 'Preview')}
              <Button
                type="button"
                variant="destructive"
                size="icon"
                className="absolute top-2 right-2"
                onClick={handleRemove}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-8">
              <Upload className="h-8 w-8 text-zinc-400 mb-2" />
              <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-2">
                Drag and drop an image, or click to upload
              </p>
              <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()}>
                Select Image
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
                disabled={isUploading}
              />
              <p className="text-xs text-zinc-500 dark:text-zinc-500 mt-2">
                Max size: 5MB. Formats: JPEG, PNG, GIF, WebP
              </p>
            </div>
          )}
        </div>
      )}

      {preview && currentMode === 'url' && (
        <div className="relative w-full h-48 rounded-md overflow-hidden bg-zinc-200 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-800">
          {renderImage(preview, 'Preview')}
          <Button
            type="button"
            variant="destructive"
            size="icon"
            className="absolute top-2 right-2"
            onClick={handleRemove}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
