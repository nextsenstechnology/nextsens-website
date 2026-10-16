import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Upload, Loader2, X, Image as ImageIcon, CheckCircle2 } from 'lucide-react';
import { supabase } from '@/lib/customSupabaseClient';
import { useAuth } from '@/contexts/SupabaseAuthContext';

const BundleImageUpload = ({ currentImageUrl, onImageUpload }) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(currentImageUrl || '');

  // Keep previewUrl in sync whenever currentImageUrl changes from parent
  useEffect(() => {
    setPreviewUrl(currentImageUrl || '');
  }, [currentImageUrl]);

  const uploadFileToStorage = async (file) => {
    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        variant: "destructive",
        title: "Invalid file type",
        description: "Please select an image file (JPEG, PNG, WebP, or GIF)."
      });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        variant: "destructive",
        title: "File too large",
        description: "Image must be less than 5MB."
      });
      return;
    }

    setIsUploading(true);

    try {
      const userId = user?.id || 'admin';
      const cleanName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
      const fileName = `bundles/${userId}/${Date.now()}-${cleanName}`;
      
      // Upload to the verified 'product-files' storage bucket
      const { data, error } = await supabase.storage
        .from('product-files')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: true,
          contentType: file.type,
        });

      if (error) {
        throw new Error(error.message);
      }

      const { data: { publicUrl } } = supabase.storage
        .from('product-files')
        .getPublicUrl(data.path);

      setPreviewUrl(publicUrl);
      onImageUpload(publicUrl);

      toast({
        title: "Image uploaded! ✓",
        description: "Bundle image uploaded and attached successfully.",
      });
    } catch (error) {
      console.error("Storage upload error:", error);
      toast({
        variant: "destructive",
        title: "Upload failed",
        description: error.message || "Failed to upload image to storage. You can also paste an image URL directly.",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileChange = async (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      await uploadFileToStorage(file);
      // Reset input so same file can be re-selected if needed
      e.target.value = '';
    }
  };

  const handleUrlChange = (e) => {
    const url = e.target.value;
    setPreviewUrl(url);
    onImageUpload(url);
  };

  const handleRemove = () => {
    setPreviewUrl('');
    onImageUpload('');
  };

  return (
    <div className="space-y-3">
      {/* File Upload (Auto-uploads on file selection) */}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-semibold text-muted-foreground">Upload from Computer</label>
        <div className="flex gap-2 items-center">
          <input 
            type="file" 
            accept="image/jpeg,image/png,image/webp,image/gif" 
            onChange={handleFileChange}
            className="admin-input flex-1 text-xs file:mr-2 file:py-1 file:px-2 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20 cursor-pointer"
            disabled={isUploading}
          />
          {isUploading && (
            <div className="flex items-center gap-1.5 text-xs text-primary font-medium px-2 py-1 bg-primary/10 rounded-md">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Uploading...</span>
            </div>
          )}
        </div>
      </div>

      {/* Direct URL Input */}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-semibold text-muted-foreground">Or Enter / Paste Image URL</label>
        <input 
          type="url" 
          placeholder="https://example.com/bundle-image.jpg" 
          className="admin-input text-xs" 
          value={previewUrl}
          onChange={handleUrlChange}
        />
      </div>

      {/* Preview Card */}
      {previewUrl ? (
        <div className="relative border border-border rounded-lg p-3 bg-card shadow-sm">
          <div className="flex items-center gap-3">
            <div className="h-20 w-20 rounded-md border border-border/80 overflow-hidden bg-muted/40 flex items-center justify-center flex-shrink-0">
              <img 
                src={previewUrl} 
                alt="Bundle preview" 
                className="max-h-full max-w-full object-contain"
                onError={(e) => {
                  e.target.style.display = 'none';
                  const fallback = e.target.parentElement.querySelector('.image-fallback');
                  if (fallback) fallback.style.display = 'flex';
                }}
              />
              <div className="image-fallback hidden flex-col items-center justify-center text-muted-foreground p-1 text-center">
                <ImageIcon className="h-6 w-6 mb-1 text-muted-foreground/40" />
                <span className="text-[10px]">Preview unavailable</span>
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Image Attached</span>
              </div>
              <p className="text-xs text-muted-foreground truncate mt-1 select-all" title={previewUrl}>
                {previewUrl}
              </p>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={handleRemove}
              className="h-8 w-8 text-destructive hover:bg-destructive/10 flex-shrink-0"
              title="Remove image"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      ) : (
        <div className="p-3 border border-dashed rounded-lg bg-muted/10 text-center">
          <p className="text-xs text-muted-foreground">
            No image attached. Select a file above or paste an image URL.
          </p>
        </div>
      )}

      <p className="text-[11px] text-muted-foreground">
        Supported formats: JPEG, PNG, WebP, GIF (max 5MB). Images are stored in high-performance CDN storage.
      </p>
    </div>
  );
};

export default BundleImageUpload;