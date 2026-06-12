import React, { useState, useRef, DragEvent, ChangeEvent } from 'react';
import { X, Image as ImageIcon, Loader2, UploadCloud } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';

interface GlimpseUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUploadSuccess: () => void;
}

export const GlimpseUploadModal: React.FC<GlimpseUploadModalProps> = ({
  isOpen,
  onClose,
  onUploadSuccess,
}) => {
  const { currentUser } = useAuth();
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [caption, setCaption] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleDrag = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const processFile = (selectedFile: File) => {
    if (!selectedFile.type.startsWith('image/')) {
      setError('Please select an image file (PNG, JPG, etc.)');
      return;
    }
    setError(null);
    setFile(selectedFile);
    const objectUrl = URL.createObjectURL(selectedFile);
    setPreviewUrl(objectUrl);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const compressImage = (imageFile: File): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const maxSize = 1200;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > maxSize) {
              height = Math.round((height * maxSize) / width);
              width = maxSize;
            }
          } else {
            if (height > maxSize) {
              width = Math.round((width * maxSize) / height);
              height = maxSize;
            }
          }

          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            reject(new Error('Failed to get canvas context'));
            return;
          }

          ctx.drawImage(img, 0, 0, width, height);
          canvas.toBlob(
            (blob) => {
              if (blob) {
                resolve(blob);
              } else {
                reject(new Error('Canvas toBlob failed'));
              }
            },
            'image/jpeg',
            0.8
          );
        };
        img.onerror = () => reject(new Error('Failed to load image'));
        img.src = e.target?.result as string;
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsDataURL(imageFile);
    });
  };

  const handleUpload = async () => {
    if (!currentUser) {
      setError('You must be signed in to post glimpses.');
      return;
    }
    if (!file) {
      setError('Please select an image first.');
      return;
    }
    if (!supabase) {
      setError('Supabase is not initialized.');
      return;
    }

    setIsUploading(true);
    setError(null);

    try {
      // 1. Compress Image
      const compressedBlob = await compressImage(file);

      // 2. Upload to Storage
      const fileExt = 'jpg';
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `${currentUser.id}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('glimpses')
        .upload(filePath, compressedBlob, {
          contentType: 'image/jpeg',
          cacheControl: '3600',
          upsert: false,
        });

      if (uploadError) {
        throw uploadError;
      }

      // 3. Insert metadata into public.glimpses table
      const { error: dbError } = await supabase
        .from('glimpses')
        .insert({
          user_id: currentUser.id,
          image_path: filePath,
          caption: caption.trim() || null,
          university: currentUser.university || 'Global',
        });

      if (dbError) {
        throw dbError;
      }

      // Success
      setFile(null);
      setPreviewUrl(null);
      setCaption('');
      onUploadSuccess();
      onClose();
    } catch (err: any) {
      console.error('Error uploading glimpse:', err);
      setError(err.message || 'An unexpected error occurred during upload.');
    } finally {
      setIsUploading(false);
    }
  };

  const clearSelection = () => {
    setFile(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
    setError(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm transition-opacity duration-300">
      <div 
        className="relative w-full max-w-lg overflow-hidden bg-black border border-gray-800 rounded-3xl shadow-[0_0_50px_rgba(255,0,127,0.15)] flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-900">
          <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-neon animate-pulse" />
            Share a Glimpse
          </h2>
          <button 
            onClick={onClose}
            className="p-1 text-gray-500 rounded-full hover:text-white hover:bg-gray-900 transition-colors"
            aria-label="Close modal"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 p-6 overflow-y-auto space-y-6">
          {error && (
            <div className="p-4 border border-red-500/20 bg-red-500/10 rounded-2xl text-red-400 text-sm">
              {error}
            </div>
          )}

          {/* Upload Area */}
          {!previewUrl ? (
            <div
              onDragEnter={handleDrag}
              onDragOver={handleDrag}
              onDragLeave={handleDrag}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`relative border-2 border-dashed rounded-3xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-300 min-h-[260px]
                ${dragActive 
                  ? 'border-neon bg-neon/5 shadow-[0_0_20px_rgba(255,0,127,0.1)]' 
                  : 'border-gray-800 hover:border-neon/50 hover:bg-gray-900/35'
                }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                accept="image/*"
                onChange={handleFileChange}
              />
              <div className="p-4 mb-4 rounded-full bg-gray-950 border border-gray-900 group-hover:border-neon/30 transition-colors">
                <UploadCloud className="w-8 h-8 text-gray-400 group-hover:text-neon transition-colors" />
              </div>
              <h3 className="text-lg font-bold text-white mb-1">Drag & drop your image here</h3>
              <p className="text-sm text-gray-500 mb-4 max-w-[260px]">
                Support JPG, PNG, WebP. Expired automatically after 24h.
              </p>
              <button 
                type="button"
                className="px-5 py-2.5 bg-gray-900 hover:bg-neon hover:text-white border border-gray-800 hover:border-transparent text-sm font-semibold rounded-2xl transition-all duration-300"
              >
                Select File
              </button>
            </div>
          ) : (
            <div className="relative rounded-3xl overflow-hidden border border-gray-800 bg-gray-950/50 aspect-square max-h-[300px] flex items-center justify-center">
              <img 
                src={previewUrl} 
                alt="Upload preview" 
                className="w-full h-full object-cover" 
              />
              <button
                onClick={clearSelection}
                className="absolute top-3 right-3 p-2 bg-black/60 hover:bg-black/90 text-white rounded-full backdrop-blur-sm transition-colors border border-white/10"
                aria-label="Remove image"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Caption Input */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-sm font-semibold text-gray-400">
              <label htmlFor="glimpse-caption">Write a caption</label>
              <span className={caption.length > 150 ? 'text-red-500 font-mono' : 'text-gray-600 font-mono'}>
                {caption.length}/150
              </span>
            </div>
            <textarea
              id="glimpse-caption"
              placeholder="What's happening right now? Add context..."
              value={caption}
              onChange={(e) => setCaption(e.target.value.slice(0, 150))}
              rows={3}
              className="w-full px-4 py-3 bg-gray-950 border border-gray-800 hover:border-gray-700 focus:border-neon focus:ring-1 focus:ring-neon rounded-2xl text-white placeholder-gray-600 outline-none transition-all duration-300 resize-none text-sm"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-900 bg-black">
          <button
            onClick={onClose}
            disabled={isUploading}
            className="px-6 py-3 border border-gray-800 hover:border-gray-700 text-gray-400 hover:text-white font-semibold rounded-2xl text-sm transition-all duration-300 active:scale-95 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleUpload}
            disabled={isUploading || !file}
            className="px-6 py-3 bg-neon hover:bg-neon/90 text-white font-bold rounded-2xl text-sm shadow-[0_0_15px_rgba(255,0,127,0.4)] hover:shadow-[0_0_25px_rgba(255,0,127,0.6)] transition-all duration-300 active:scale-95 disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-2 min-w-[100px]"
          >
            {isUploading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Posting...
              </>
            ) : (
              'Post Now'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
