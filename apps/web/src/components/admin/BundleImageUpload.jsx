import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Upload, Loader2, X, Image as ImageIcon } from 'lucide-react';
import { supabase } from '@/lib/customSupabaseClient';
import { useAuth } from '@/contexts/SupabaseAuthContext';

const BundleImageUpload = ({ currentImageUrl, onImageUpload }) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(currentImageUrl || '');
  const [imageFile, setImageFile] = useState(null);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      
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

      setImageFile(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpload = async () => {
    if (!imageFile) {
      toast({
        variant: "destructive",
        title: "No file selected",
        description: "Please select an image to upload."
      });
      return;
    }

    setIsUploading(true);

    try {
      const fileName = `bundles/${user.id}/${Date.now()}-${imageFile.name}`;
      
      const { data, error } = await supabase.storage
        .from('product-images')
        .upload(fileName, imageFile, {
          cacheControl: '3600',
          upsert: false,
          contentType: imageFile.type,
        });

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from('product-images')
        .getPublicUrl(data.path);

      setPreviewUrl(publicUrl);
      onImageUpload(publicUrl);

      toast({
        title: "Image uploaded successfully!",
        description: "Bundle image has been uploaded.",
      });

      setImageFile(null);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Upload failed",
        description: error.message || "Failed to upload image."
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemove = () => {
    setPreviewUrl('');
    setImageFile(null);
    onImageUpload('');
  };

  const handleUrlChange = (e) => {
    const url = e.target.value;
    setPreviewUrl(url);
    onImageUpload(url);
  };

  return (
    <div className="space-y-3">
      {/* URL Input */}
      <div>
        <input 
          type="url" 
          placeholder="Or enter image URL directly..." 
          className="admin-input" 
          value={previewUrl}
          onChange={handleUrlChange}
        />
      </div>

      {/* File Upload */}
      <div className="flex gap-2">
        <input 
          type="file" 
          accept="image/jpeg,image/png,image/webp,image/gif" 
          onChange={handleFileChange}
          className="admin-input flex-1"
          disabled={isUploading}
        />
        {imageFile && (
          <Button 
            type="button"
            onClick={handleUpload} 
            disabled={isUploading}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {isUploading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Upload className="h-4 w-4" />
            )}
          </Button>
        )}
      </div>

      {/* Preview */}
      {previewUrl && (
        <div className="relative border border-border rounded-md p-3 bg-white">
          <div className="flex items-center gap-3">
            <div className="h-24 w-24 rounded-md border overflow-hidden bg-gray-50 flex items-center justify-center flex-shrink-0">
              {previewUrl ? (
                <img 
                  src={previewUrl} 
                  alt="Bundle preview" 
                  className="max-h-full max-w-full object-contain"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                  }}
                />
              ) : null}
              <div className="hidden flex-col items-center justify-center text-muted-foreground">
                <ImageIcon className="h-8 w-8 mb-1" />
                <span className="text-xs">No preview</span>
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground">Bundle Image</p>
              <p className="text-xs text-muted-foreground truncate mt-1" title={previewUrl}>
                {previewUrl}
              </p>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={handleRemove}
              className="h-8 w-8 text-destructive hover:bg-destructive/10 flex-shrink-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      <p className="text-xs text-muted-foreground">
        Supported formats: JPEG, PNG, WebP, GIF (max 5MB)
      </p>
    </div>
  );
};

export default BundleImageUpload;