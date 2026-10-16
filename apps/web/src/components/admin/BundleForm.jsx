import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Checkbox } from '@/components/ui/checkbox';
import { Loader2, Save, Upload } from 'lucide-react';
import { supabase } from '@/lib/customSupabaseClient';
import BundleImageUpload from './BundleImageUpload';

const BundleForm = ({ isOpen, onClose, bundle, products, onSuccess }) => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    base_price: '',
    discount_percentage: '',
    specifications: '{}',
    status: 'active',
    image_url: '',
    included_products: []
  });

  const [imageFile, setImageFile] = useState(null);

  useEffect(() => {
    if (bundle) {
      setFormData({
        name: bundle.name || '',
        description: bundle.description || '',
        base_price: bundle.base_price || '',
        discount_percentage: bundle.discount_percentage || '',
        specifications: typeof bundle.specifications === 'object' 
          ? JSON.stringify(bundle.specifications, null, 2) 
          : bundle.specifications || '{}',
        status: bundle.status || 'active',
        image_url: bundle.image_url || '',
        included_products: bundle.included_products || []
      });
    } else {
      resetForm();
    }
  }, [bundle]);

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      base_price: '',
      discount_percentage: '',
      specifications: '{}',
      status: 'active',
      image_url: '',
      included_products: []
    });
    setImageFile(null);
  };

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleProductToggle = (productId) => {
    setFormData(prev => {
      const included = prev.included_products.includes(productId)
        ? prev.included_products.filter(id => id !== productId)
        : [...prev.included_products, productId];
      return { ...prev, included_products: included };
    });
  };

  const handleImageUpload = (url) => {
    setFormData(prev => ({ ...prev, image_url: url }));
  };

  const calculateDiscountedPrice = () => {
    const basePrice = parseFloat(formData.base_price) || 0;
    const discount = parseFloat(formData.discount_percentage) || 0;
    if (discount > 0 && basePrice > 0) {
      return basePrice - (basePrice * discount / 100);
    }
    return basePrice;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.base_price) {
      toast({ 
        variant: "destructive", 
        title: "Validation Error", 
        description: "Bundle name and base price are required." 
      });
      return;
    }

    if (formData.included_products.length === 0) {
      toast({ 
        variant: "destructive", 
        title: "Validation Error", 
        description: "Please select at least one product for this bundle." 
      });
      return;
    }

    setIsSubmitting(true);

    try {
      let specificationsJson = {};
      try {
        specificationsJson = JSON.parse(formData.specifications);
      } catch (err) {
        throw new Error("Invalid JSON in Specifications field.");
      }

      const discountedPrice = calculateDiscountedPrice();

      const payload = {
        name: formData.name,
        description: formData.description,
        base_price: parseFloat(formData.base_price),
        discount_percentage: formData.discount_percentage ? parseFloat(formData.discount_percentage) : null,
        discounted_price: discountedPrice,
        specifications: specificationsJson,
        status: formData.status,
        image_url: formData.image_url,
        included_products: formData.included_products
      };

      let error;
      if (bundle) {
        const { error: updateError } = await supabase
          .from('bundles')
          .update(payload)
          .eq('id', bundle.id);
        error = updateError;
      } else {
        if (!payload.image_url) {
          throw new Error("A bundle image URL is required.");
        }
        // New bundles go to the END of the list
        const { data: maxRow } = await supabase
          .from('bundles')
          .select('sort_order')
          .order('sort_order', { ascending: false })
          .limit(1)
          .maybeSingle();
        const nextSort = (maxRow?.sort_order || 0) + 1;
        const { error: insertError } = await supabase
          .from('bundles')
          .insert([{ ...payload, sort_order: nextSort }]);
        error = insertError;
      }

      if (error) throw error;

      toast({
        title: `Bundle ${bundle ? 'updated' : 'created'} successfully!`,
        description: `${formData.name} has been saved.`,
      });

      onSuccess();
    } catch (error) {
      toast({
        variant: "destructive",
        title: `Failed to save bundle`,
        description: error.message || "An unexpected error occurred.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col p-0 overflow-hidden bg-background">
        <DialogHeader className="px-6 py-4 border-b border-border bg-muted/20">
          <DialogTitle className="text-xl">
            {bundle ? 'Edit Bundle' : 'Create New Bundle'}
          </DialogTitle>
          <DialogDescription>
            Complete the form below to {bundle ? 'update the' : 'create a new'} equipment bundle.
          </DialogDescription>
        </DialogHeader>

        <form id="bundle-form" onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-6 py-6 custom-scrollbar">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* Left Column: Basic Info */}
            <div className="space-y-5">
              <h3 className="text-lg font-semibold border-b pb-2">Basic Information</h3>
              
              <div className="admin-form-group">
                <label htmlFor="name" className="admin-label">Bundle Name *</label>
                <input 
                  id="name" 
                  type="text" 
                  className="admin-input" 
                  value={formData.name} 
                  onChange={handleInputChange} 
                  required 
                  placeholder="e.g., Complete Electrochemistry Setup"
                />
              </div>

              <div className="admin-form-group">
                <label htmlFor="description" className="admin-label">Description</label>
                <textarea 
                  id="description" 
                  className="admin-textarea" 
                  value={formData.description} 
                  onChange={handleInputChange} 
                  rows={3}
                  placeholder="Brief description of the bundle and its benefits..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="admin-form-group">
                  <label htmlFor="base_price" className="admin-label">Base Price (₹) *</label>
                  <input 
                    id="base_price" 
                    type="number" 
                    className="admin-input" 
                    value={formData.base_price} 
                    onChange={handleInputChange} 
                    required
                    min="0"
                    step="0.01"
                  />
                </div>
                <div className="admin-form-group">
                  <label htmlFor="discount_percentage" className="admin-label">Discount (%)</label>
                  <input 
                    id="discount_percentage" 
                    type="number" 
                    className="admin-input" 
                    value={formData.discount_percentage} 
                    onChange={handleInputChange}
                    min="0"
                    max="100"
                    step="0.01"
                    placeholder="e.g., 15"
                  />
                </div>
              </div>

              {formData.base_price && (
                <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
                  <p className="text-sm text-blue-800">
                    <span className="font-semibold">Final Price: </span>
                    ₹{calculateDiscountedPrice().toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                  {formData.discount_percentage > 0 && (
                    <p className="text-xs text-blue-600 mt-1">
                      You save ₹{((parseFloat(formData.base_price) || 0) - calculateDiscountedPrice()).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ({formData.discount_percentage}%)
                    </p>
                  )}
                </div>
              )}

              <div className="admin-form-group">
                <label htmlFor="status" className="admin-label">Status</label>
                <select 
                  id="status" 
                  className="admin-select" 
                  value={formData.status} 
                  onChange={handleInputChange}
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>

              <div className="admin-form-group">
                <label htmlFor="specifications" className="admin-label">Specifications (JSON)</label>
                <textarea 
                  id="specifications" 
                  className="admin-textarea font-mono text-xs" 
                  value={formData.specifications} 
                  onChange={handleInputChange} 
                  rows={6} 
                  placeholder='{"key": "value", "feature": "description"}'
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Enter additional bundle specifications in JSON format
                </p>
              </div>
            </div>

            {/* Right Column: Products & Media */}
            <div className="space-y-5">
              <h3 className="text-lg font-semibold border-b pb-2">Included Products & Media</h3>

              <div className="admin-form-group">
                <label className="admin-label mb-2 block">Included Products * (Select products)</label>
                <div className="bg-muted/20 p-3 rounded-md border border-border max-h-64 overflow-y-auto custom-scrollbar">
                  {products.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      No products available. Create products first to add them to bundles.
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {products.map((product) => (
                        <div key={product.id} className="admin-checkbox-group border-b border-border/50 pb-2 last:border-0">
                          <Checkbox 
                            id={`product-${product.id}`} 
                            checked={formData.included_products.includes(product.id)}
                            onCheckedChange={() => handleProductToggle(product.id)}
                          />
                          <label htmlFor={`product-${product.id}`} className="text-sm cursor-pointer flex-1">
                            <span className="font-medium">{product.name}</span>
                            <span className="text-xs text-muted-foreground ml-2">
                              ({product.category})
                            </span>
                          </label>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Selected: {formData.included_products.length} product(s)
                </p>
              </div>

              <div className="admin-form-group">
                <label className="admin-label mb-2 block">Bundle Image *</label>
                <BundleImageUpload 
                  currentImageUrl={formData.image_url}
                  onImageUpload={handleImageUpload}
                />
              </div>
            </div>
          </div>
        </form>

        <DialogFooter className="px-6 py-4 border-t border-border bg-muted/20 sm:justify-between">
          <div className="text-sm text-muted-foreground flex items-center">
            * Required fields
          </div>
          <div className="flex gap-2">
            <DialogClose asChild>
              <Button type="button" variant="outline">Cancel</Button>
            </DialogClose>
            <Button 
              type="submit" 
              form="bundle-form" 
              disabled={isSubmitting} 
              className="bg-accent hover:bg-primary text-white min-w-[120px]"
            >
              {isSubmitting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Save className="mr-2 h-4 w-4" />
              )}
              {bundle ? 'Save Changes' : 'Create Bundle'}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default BundleForm;