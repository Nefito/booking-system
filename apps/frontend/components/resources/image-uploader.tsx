'use client';

import { useRef, useState } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Upload, X, Link as LinkIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

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
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Derive display values from props
  const preview = value || null;
  const currentMode = value ? getModeFromValue(value) : mode;

  // Use value prop directly for controlled input - key resets input when value changes externally
  // Local urlInput state is only for intermediate typing (invalid URLs)
  const displayUrl = urlInput || value || '';
  const inputKey = value || 'empty';

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Create a preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        onChange(result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUrlChange = (url: string) => {
    // Only call onChange for valid URLs or empty string
    // This allows typing invalid URLs without triggering onChange
    if (url && isValidUrl(url)) {
      onChange(url);
      setUrlInput(''); // Clear local state after valid URL is set
    } else if (!url) {
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

  const handleRemove = () => {
    setUrlInput('');
    onChange('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        onChange(result);
        setMode('upload');
      };
      reader.readAsDataURL(file);
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
            'hover:border-zinc-400 dark:hover:border-zinc-600'
          )}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
        >
          {preview ? (
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
              />
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
