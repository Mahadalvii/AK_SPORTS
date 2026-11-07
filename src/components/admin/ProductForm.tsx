import React, { useState } from 'react';
import { 
  ArrowLeft, 
  Save, 
  Plus, 
  Trash2, 
  Upload, 
  Star, 
  Check, 
  AlertCircle, 
  Loader2, 
  MoveUp, 
  MoveDown, 
  Video, 
  Link as LinkIcon, 
  Image as ImageIcon,
  CheckCircle2,
  FileCheck
} from 'lucide-react';
import { 
  AdminProduct, 
  AdminProductVariant, 
  AdminProductImage, 
  uploadProductImageToStorage, 
  uploadProductVideoToStorage,
  validateVideoUrl 
} from '../../lib/adminApi';
import { compressProductImage } from '../../lib/imageCompression';
import { SafeVideoPlayer } from '../SafeVideoPlayer';

interface ProductFormProps {
  initialProduct?: AdminProduct | null;
  onSave: (product: AdminProduct) => Promise<{ success: boolean; error?: string }>;
  onCancel: () => void;
  onRequestDeleteVariant: (variantTitle: string, index: number) => void;
}

export const ProductForm: React.FC<ProductFormProps> = ({
  initialProduct,
  onSave,
  onCancel,
  onRequestDeleteVariant,
}) => {
  const isEditing = Boolean(initialProduct);

  // Form State
  const [id, setId] = useState(initialProduct?.id || '');
  const [name, setName] = useState(initialProduct?.name || '');
  const [category, setCategory] = useState<'apparel' | 'bats' | 'balls' | 'gloves' | 'kits'>(
    initialProduct?.category || 'apparel'
  );
  const [categoryLabel, setCategoryLabel] = useState(
    initialProduct?.category_label || 'Athletic Wear Collection'
  );
  const [price, setPrice] = useState<number | ''>(
    initialProduct?.price !== undefined ? Math.round(initialProduct.price) : 2500
  );
  const [originalPrice, setOriginalPrice] = useState<number | ''>(
    initialProduct?.original_price !== undefined && initialProduct?.original_price !== null
      ? Math.round(initialProduct.original_price)
      : ''
  );
  const [tag, setTag] = useState(initialProduct?.tag || '');
  const [description, setDescription] = useState(initialProduct?.description || '');
  const [weight, setWeight] = useState(initialProduct?.weight || '');
  const [isFeatured, setIsFeatured] = useState(initialProduct?.is_featured || false);
  const [isActive, setIsActive] = useState(initialProduct?.is_active ?? true);

  // Specifications state: { label, value }[]
  const [specs, setSpecs] = useState<{ label: string; value: string }[]>(
    initialProduct?.specs && initialProduct.specs.length > 0
      ? initialProduct.specs
      : [{ label: 'Material', value: '4-Way Stretch Flex Poly' }]
  );

  // Features state: string[]
  const [features, setFeatures] = useState<string[]>(
    initialProduct?.features && initialProduct.features.length > 0
      ? initialProduct.features
      : ['Reinforced bar-tack pocket stitching', 'Pre-shrunk fabric']
  );

  // Variants state (Rule 3)
  const [variants, setVariants] = useState<AdminProductVariant[]>(
    initialProduct?.variants && initialProduct.variants.length > 0
      ? initialProduct.variants
      : [
          { size_or_variant: 'M (31-33")', stock: 15 },
          { size_or_variant: 'L (34-36")', stock: 10 },
        ]
  );
  const [newSizeName, setNewSizeName] = useState('');
  const [newSizeStock, setNewSizeStock] = useState<number>(10);

  // Images state (Rule 4)
  const [images, setImages] = useState<AdminProductImage[]>(
    initialProduct?.images && initialProduct.images.length > 0
      ? initialProduct.images
      : initialProduct?.image_url
      ? [{ url: initialProduct.image_url, sort_order: 0 }]
      : []
  );
  const [isCompressingImage, setIsCompressingImage] = useState(false);
  const [compressionLogs, setCompressionLogs] = useState<string[]>([]);

  // Video state (Rule 5)
  const [videoMode, setVideoMode] = useState<'url' | 'upload'>('url');
  const [videoUrl, setVideoUrl] = useState(initialProduct?.video_url || '');
  const [isUploadingVideo, setIsUploadingVideo] = useState(false);

  // UI status
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Auto-generate slug ID from title if creating new
  const handleNameChange = (val: string) => {
    setName(val);
    if (!isEditing && (!id || id.startsWith('ak-'))) {
      const generated = val
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
      setId(generated ? `ak-${generated}` : '');
    }
  };

  // Specs helpers
  const handleAddSpec = () => {
    setSpecs([...specs, { label: '', value: '' }]);
  };
  const handleUpdateSpec = (idx: number, field: 'label' | 'value', text: string) => {
    const next = [...specs];
    next[idx][field] = text;
    setSpecs(next);
  };
  const handleRemoveSpec = (idx: number) => {
    setSpecs(specs.filter((_, i) => i !== idx));
  };

  // Features helpers
  const handleAddFeature = () => {
    setFeatures([...features, '']);
  };
  const handleUpdateFeature = (idx: number, val: string) => {
    const next = [...features];
    next[idx] = val;
    setFeatures(next);
  };
  const handleRemoveFeature = (idx: number) => {
    setFeatures(features.filter((_, i) => i !== idx));
  };

  // Variants helpers
  const handleAddVariant = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSizeName.trim()) return;
    setVariants([
      ...variants,
      {
        size_or_variant: newSizeName.trim(),
        stock: Math.max(0, Math.floor(newSizeStock || 0)),
      },
    ]);
    setNewSizeName('');
    setNewSizeStock(10);
  };

  const handleUpdateVariantStock = (idx: number, newStock: number) => {
    const next = [...variants];
    next[idx].stock = Math.max(0, Math.floor(newStock));
    setVariants(next);
  };

  // Images helpers (Rule 4: in-browser compression < 300KB and 1200px max)
  const handleImageFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsCompressingImage(true);
    setFormError(null);
    const logs: string[] = [];

    try {
      const newUploadedImages: AdminProductImage[] = [];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        logs.push(`Compressing "${file.name}" (${Math.round(file.size / 1024)} KB)...`);
        
        // Browser canvas compression
        const compressed = await compressProductImage(file, 1200, 300 * 1024);
        logs.push(
          `Compressed to ${compressed.compressedSizeKB} KB (${compressed.width}x${compressed.height})`
        );

        // Upload compressed file to Supabase storage bucket 'product-images'
        const targetId = id.trim() || 'temp-product';
        const uploadResult = await uploadProductImageToStorage(compressed.file, targetId);

        if (!uploadResult.success || !uploadResult.url) {
          throw new Error(uploadResult.error || `Failed uploading ${file.name}`);
        }

        newUploadedImages.push({
          url: uploadResult.url,
          sort_order: images.length + i,
        });
      }

      setImages([...images, ...newUploadedImages]);
      setCompressionLogs(logs);
    } catch (err: any) {
      setFormError(err.message || 'Error uploading and compressing image files.');
    } finally {
      setIsCompressingImage(false);
      e.target.value = '';
    }
  };

  const handleSetMainImage = (index: number) => {
    if (index === 0) return;
    const target = images[index];
    const remaining = images.filter((_, idx) => idx !== index);
    const reordered = [target, ...remaining].map((img, i) => ({ ...img, sort_order: i }));
    setImages(reordered);
  };

  const handleMoveImage = (index: number, direction: 'up' | 'down') => {
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= images.length) return;
    const copy = [...images];
    const temp = copy[index];
    copy[index] = copy[targetIdx];
    copy[targetIdx] = temp;
    setImages(copy.map((img, idx) => ({ ...img, sort_order: idx })));
  };

  const handleRemoveImage = (index: number) => {
    setImages(images.filter((_, idx) => idx !== index).map((img, idx) => ({ ...img, sort_order: idx })));
  };

  // Video upload handler (Rule 5: MP4 under 10MB)
  const handleVideoFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Rule 5 validation
    const maxBytes = 10 * 1024 * 1024; // 10 MB
    if (file.size > maxBytes) {
      const sizeMB = (file.size / (1024 * 1024)).toFixed(1);
      setFormError(`Video file exceeds maximum limit of 10 MB (Selected file: ${sizeMB} MB). Please compress the video or provide a YouTube / Instagram link.`);
      e.target.value = '';
      return;
    }

    if (!file.type.includes('mp4') && !file.name.toLowerCase().endsWith('.mp4')) {
      setFormError('Only .mp4 video files under 10 MB are accepted.');
      e.target.value = '';
      return;
    }

    setIsUploadingVideo(true);
    setFormError(null);

    try {
      const targetId = id.trim() || 'temp-product';
      const result = await uploadProductVideoToStorage(file, targetId);
      if (!result.success || !result.url) {
        throw new Error(result.error || 'Failed uploading video');
      }
      setVideoUrl(result.url);
    } catch (err: any) {
      setFormError(err.message || 'Error uploading video.');
    } finally {
      setIsUploadingVideo(false);
      e.target.value = '';
    }
  };

  // Main Submit Validation & Execution
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    setFormError(null);

    // Rule 7: Prices are whole rupees only. Block saving price < 0 or original price < price
    const numPrice = Number(price);
    if (!Number.isInteger(numPrice) || numPrice < 0) {
      setFormError('Selling price must be a whole rupee amount greater than or equal to 0.');
      return;
    }

    let numOriginalPrice: number | null = null;
    if (originalPrice !== '' && originalPrice !== undefined && originalPrice !== null) {
      numOriginalPrice = Number(originalPrice);
      if (!Number.isInteger(numOriginalPrice)) {
        setFormError('Original price must be a whole rupee amount.');
        return;
      }
      if (numOriginalPrice < numPrice) {
        setFormError(`Original price (Rs. ${numOriginalPrice.toLocaleString()}) cannot be lower than the selling price (Rs. ${numPrice.toLocaleString()}).`);
        return;
      }
    }

    if (!name.trim()) {
      setFormError('Product name is required.');
      return;
    }

    if (!id.trim()) {
      setFormError('Slug ID is required.');
      return;
    }

    if (images.length === 0) {
      setFormError('Please add at least one product image.');
      return;
    }

    // Security Rule 2: Validate video URL if provided
    if (videoUrl && videoUrl.trim()) {
      const videoCheck = validateVideoUrl(videoUrl);
      if (!videoCheck.valid) {
        setFormError(videoCheck.error || 'Invalid video link. Only HTTPS YouTube, Instagram, or Supabase MP4 files are permitted.');
        return;
      }
    }

    if (variants.length === 0) {
      setFormError('Please configure at least one size variant.');
      return;
    }

    setIsSubmitting(true);

    const payload: AdminProduct = {
      id: id.trim(),
      name: name.trim(),
      category,
      category_label: categoryLabel.trim(),
      price: numPrice,
      original_price: numOriginalPrice,
      tag: tag.trim() || null,
      description: description.trim(),
      specs: specs.filter((s) => s.label.trim() && s.value.trim()),
      features: features.filter((f) => f.trim()),
      weight: weight.trim() || null,
      video_url: videoUrl.trim() || null,
      image_url: images[0]?.url || '/images/ak_sports_logo.jpg',
      is_featured: isFeatured,
      is_active: isActive,
      variants,
      images,
    };

    const res = await onSave(payload);
    setIsSubmitting(false);

    if (!res.success) {
      setFormError(res.error || 'Failed to save product in database.');
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header Bar */}
      <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="p-2 rounded-xl border border-zinc-800 bg-[#18181b] hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h2 className="font-display font-extrabold text-xl text-white">
              {isEditing ? `Edit: ${initialProduct?.name}` : 'Create New Product'}
            </h2>
            <p className="text-xs text-zinc-400">
              Configure product catalog attributes, whole-rupee pricing, gallery, and inventory.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 rounded-xl border border-zinc-700 hover:bg-zinc-800 text-zinc-300 text-xs font-semibold cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="px-5 py-2 rounded-xl bg-[#d4af37] hover:bg-[#c29e2f] text-black text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-md cursor-pointer disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Save Product</span>
              </>
            )}
          </button>
        </div>
      </div>

      {formError && (
        <div className="p-4 rounded-xl bg-rose-950/70 border border-rose-800 text-rose-200 text-xs flex items-start gap-2.5 animate-in fade-in">
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
          <div className="flex-1 leading-relaxed font-medium">{formError}</div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* LEFT COLUMN: BASIC INFO, PRICING, SPECS, VARIANTS (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Card 1: Core Details */}
          <div className="p-6 bg-[#18181b] rounded-2xl border border-zinc-800 space-y-4">
            <h3 className="font-display font-bold text-sm text-white uppercase tracking-wider text-[#d4af37]">
              1. General Information
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2 space-y-1">
                <label className="text-xs font-semibold text-zinc-300 block">
                  Product Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="e.g. AK Pro Matrix Flex Athletic Trousers"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-700 bg-zinc-900 text-white text-xs focus:outline-none focus:ring-2 focus:ring-[#d4af37]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-zinc-300 block">
                  Slug ID <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  disabled={isEditing}
                  value={id}
                  onChange={(e) => setId(e.target.value)}
                  placeholder="e.g. ak-pro-matrix-flex-trousers"
                  className="w-full px-3.5 py-2 rounded-xl border border-zinc-700 bg-zinc-900 text-white font-mono text-xs focus:outline-none focus:ring-2 focus:ring-[#d4af37] disabled:opacity-50"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-zinc-300 block">
                  Marketing Badge / Tag
                </label>
                <input
                  type="text"
                  value={tag}
                  onChange={(e) => setTag(e.target.value)}
                  placeholder="e.g. BESTSELLER, 2026 EDITION"
                  className="w-full px-3.5 py-2 rounded-xl border border-zinc-700 bg-zinc-900 text-white text-xs focus:outline-none focus:ring-2 focus:ring-[#d4af37]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-zinc-300 block">
                  Category <span className="text-rose-500">*</span>
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl border border-zinc-700 bg-zinc-900 text-white text-xs focus:outline-none focus:ring-2 focus:ring-[#d4af37]"
                >
                  <option value="apparel">apparel (Athletic Wear)</option>
                  <option value="bats">bats (Tape Ball Bats)</option>
                  <option value="balls">balls (Tournament Balls)</option>
                  <option value="gloves">gloves (Batting Gloves &amp; Armor)</option>
                  <option value="kits">kits (Accessories)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-zinc-300 block">
                  Category Display Label <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={categoryLabel}
                  onChange={(e) => setCategoryLabel(e.target.value)}
                  placeholder="e.g. Athletic Wear Collection"
                  className="w-full px-3.5 py-2 rounded-xl border border-zinc-700 bg-zinc-900 text-white text-xs focus:outline-none focus:ring-2 focus:ring-[#d4af37]"
                />
              </div>

              <div className="sm:col-span-2 space-y-1">
                <label className="text-xs font-semibold text-zinc-300 block">
                  Description
                </label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Detailed product story, craftsmanship, and performance characteristics..."
                  className="w-full px-3.5 py-2 rounded-xl border border-zinc-700 bg-zinc-900 text-white text-xs focus:outline-none focus:ring-2 focus:ring-[#d4af37]"
                />
              </div>
            </div>

            {/* Visibility Toggles */}
            <div className="pt-3 border-t border-zinc-800 flex flex-wrap items-center gap-6 text-xs">
              <label className="flex items-center gap-2 cursor-pointer text-zinc-300">
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="rounded text-[#d4af37] focus:ring-[#d4af37] bg-zinc-900 border-zinc-700 w-4 h-4"
                />
                <span><strong>Active on Storefront</strong> (uncheck to hide)</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer text-zinc-300">
                <input
                  type="checkbox"
                  checked={isFeatured}
                  onChange={(e) => setIsFeatured(e.target.checked)}
                  className="rounded text-[#d4af37] focus:ring-[#d4af37] bg-zinc-900 border-zinc-700 w-4 h-4"
                />
                <span>Featured on Homepage</span>
              </label>
            </div>
          </div>

          {/* Card 2: Pricing (Rule 7) */}
          <div className="p-6 bg-[#18181b] rounded-2xl border border-zinc-800 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-display font-bold text-sm text-white uppercase tracking-wider text-[#d4af37]">
                2. Pricing (Whole Rupees Only)
              </h3>
              <span className="text-[10px] text-zinc-400 font-mono">Currency: PKR</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-zinc-300 block">
                  Selling Price (PKR) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  required
                  step="1"
                  min="0"
                  value={price}
                  onChange={(e) => setPrice(e.target.value === '' ? '' : Math.round(Number(e.target.value)))}
                  placeholder="2500"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-700 bg-zinc-900 text-white font-mono text-sm focus:outline-none focus:ring-2 focus:ring-[#d4af37]"
                />
                <span className="text-[10px] text-zinc-500 block">
                  Must be whole rupees &ge; 0
                </span>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-zinc-300 block">
                  Original / Strikethrough Price (Optional)
                </label>
                <input
                  type="number"
                  step="1"
                  min="0"
                  value={originalPrice}
                  onChange={(e) => setOriginalPrice(e.target.value === '' ? '' : Math.round(Number(e.target.value)))}
                  placeholder="e.g. 3500"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-700 bg-zinc-900 text-white font-mono text-sm focus:outline-none focus:ring-2 focus:ring-[#d4af37]"
                />
                <span className="text-[10px] text-zinc-500 block">
                  If set, must be &ge; selling price (shows discount badge)
                </span>
              </div>
            </div>
          </div>

          {/* Card 3: Variants & Stock (Rule 3) */}
          <div className="p-6 bg-[#18181b] rounded-2xl border border-zinc-800 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-display font-bold text-sm text-white uppercase tracking-wider text-[#d4af37]">
                  3. Size Variants &amp; Inventory
                </h3>
                <p className="text-xs text-zinc-400">
                  Manage individual sizing specifications and stock allocation.
                </p>
              </div>
              <span className="text-xs px-2.5 py-1 rounded-full bg-zinc-900 border border-zinc-700 text-[#d4af37] font-mono">
                {variants.reduce((sum, v) => sum + (v.stock || 0), 0)} Total Units
              </span>
            </div>

            {/* Existing Variants Table */}
            <div className="rounded-xl border border-zinc-800 overflow-hidden divide-y divide-zinc-800 bg-zinc-900/60">
              {variants.map((v, idx) => (
                <div key={v.id || idx} className="p-3 px-4 flex items-center justify-between gap-4 text-xs">
                  <div className="flex-1 font-semibold text-white">
                    {v.size_or_variant}
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-zinc-400 text-[11px]">Stock:</span>
                    <input
                      type="number"
                      min="0"
                      step="1"
                      value={v.stock}
                      onChange={(e) => handleUpdateVariantStock(idx, Number(e.target.value))}
                      className="w-20 px-2 py-1 rounded-lg border border-zinc-700 bg-black text-white font-mono text-xs text-center focus:outline-none focus:ring-1 focus:ring-[#d4af37]"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() => onRequestDeleteVariant(v.size_or_variant, idx)}
                    className="p-1.5 rounded-lg text-zinc-500 hover:text-rose-400 hover:bg-rose-950/30 transition-colors cursor-pointer"
                    title="Delete Variant (Audit Confirm)"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            {/* Add Variant Inline Form */}
            <div className="pt-2 flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                value={newSizeName}
                onChange={(e) => setNewSizeName(e.target.value)}
                placeholder="Size / Spec (e.g. XL (37-39''))"
                className="flex-1 px-3 py-2 rounded-xl border border-zinc-700 bg-zinc-900 text-white text-xs focus:outline-none focus:ring-1 focus:ring-[#d4af37]"
              />
              <input
                type="number"
                min="0"
                value={newSizeStock}
                onChange={(e) => setNewSizeStock(Number(e.target.value))}
                placeholder="Stock"
                className="w-24 px-3 py-2 rounded-xl border border-zinc-700 bg-zinc-900 text-white text-xs text-center font-mono focus:outline-none focus:ring-1 focus:ring-[#d4af37]"
              />
              <button
                type="button"
                onClick={handleAddVariant}
                className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-semibold flex items-center justify-center gap-1 cursor-pointer transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Variant</span>
              </button>
            </div>
          </div>

          {/* Card 4: Specifications & Features */}
          <div className="p-6 bg-[#18181b] rounded-2xl border border-zinc-800 space-y-4">
            <h3 className="font-display font-bold text-sm text-white uppercase tracking-wider text-[#d4af37]">
              4. Specifications &amp; Highlights
            </h3>

            {/* Specifications Key/Value */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-zinc-300">Technical Specs:</span>
                <button
                  type="button"
                  onClick={handleAddSpec}
                  className="text-[11px] text-[#d4af37] hover:underline cursor-pointer flex items-center gap-1"
                >
                  <Plus className="w-3 h-3" />
                  <span>Add Spec Row</span>
                </button>
              </div>

              <div className="space-y-2">
                {specs.map((sp, idx) => (
                  <div key={idx} className="flex gap-2 items-center">
                    <input
                      type="text"
                      value={sp.label}
                      onChange={(e) => handleUpdateSpec(idx, 'label', e.target.value)}
                      placeholder="Label (e.g. Fabric, Handle)"
                      className="w-1/3 px-3 py-1.5 rounded-lg border border-zinc-700 bg-zinc-900 text-white text-xs"
                    />
                    <input
                      type="text"
                      value={sp.value}
                      onChange={(e) => handleUpdateSpec(idx, 'value', e.target.value)}
                      placeholder="Value (e.g. 280 GSM Cotton, 3-Piece Cane)"
                      className="flex-1 px-3 py-1.5 rounded-lg border border-zinc-700 bg-zinc-900 text-white text-xs"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveSpec(idx)}
                      className="p-1.5 text-zinc-500 hover:text-rose-400 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Bullet Features */}
            <div className="pt-3 border-t border-zinc-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-zinc-300">Key Features (Bullets):</span>
                <button
                  type="button"
                  onClick={handleAddFeature}
                  className="text-[11px] text-[#d4af37] hover:underline cursor-pointer flex items-center gap-1"
                >
                  <Plus className="w-3 h-3" />
                  <span>Add Bullet</span>
                </button>
              </div>

              <div className="space-y-2">
                {features.map((feat, idx) => (
                  <div key={idx} className="flex gap-2 items-center">
                    <input
                      type="text"
                      value={feat}
                      onChange={(e) => handleUpdateFeature(idx, e.target.value)}
                      placeholder="Feature bullet point..."
                      className="flex-1 px-3 py-1.5 rounded-lg border border-zinc-700 bg-zinc-900 text-white text-xs"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveFeature(idx)}
                      className="p-1.5 text-zinc-500 hover:text-rose-400 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: IMAGES & VIDEO (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Card 5: Images & Browser Compression (Rule 4) */}
          <div className="p-6 bg-[#18181b] rounded-2xl border border-zinc-800 space-y-4">
            <div>
              <h3 className="font-display font-bold text-sm text-white uppercase tracking-wider text-[#d4af37]">
                5. Product Images (Supabase Storage)
              </h3>
              <p className="text-xs text-zinc-400 mt-1">
                Auto-compressed in browser (max 1200px, &lt;300 KB). Upload several images, reorder, and designate the main thumbnail.
              </p>
            </div>

            {/* Upload Area */}
            <label className="p-6 border-2 border-dashed border-zinc-700 hover:border-[#d4af37] rounded-xl flex flex-col items-center justify-center gap-2 cursor-pointer transition-colors bg-zinc-900/60 text-center">
              <Upload className="w-6 h-6 text-[#d4af37]" />
              <div className="text-xs font-semibold text-zinc-200">
                {isCompressingImage ? 'Compressing & Uploading...' : 'Click or Drag images to upload'}
              </div>
              <span className="text-[10px] text-zinc-500">
                JPG, PNG, or WebP · Client-side compressed to &lt;300 KB
              </span>
              <input
                type="file"
                multiple
                accept="image/jpeg,image/png,image/webp"
                disabled={isCompressingImage}
                onChange={handleImageFileSelect}
                className="hidden"
              />
            </label>

            {/* Compression Logs Feedback */}
            {compressionLogs.length > 0 && (
              <div className="p-3 rounded-lg bg-zinc-900 border border-zinc-800 text-[10px] font-mono text-zinc-400 space-y-1 max-h-24 overflow-y-auto">
                {compressionLogs.map((log, i) => (
                  <div key={i} className="flex items-center gap-1.5 text-emerald-400">
                    <CheckCircle2 className="w-3 h-3 shrink-0" />
                    <span>{log}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Images Gallery List */}
            <div className="space-y-3 pt-2">
              <span className="text-xs font-semibold text-zinc-300 block">
                Gallery Images ({images.length})
              </span>

              {images.length === 0 ? (
                <div className="p-4 rounded-xl border border-zinc-800 text-center text-xs text-zinc-500">
                  No images uploaded yet.
                </div>
              ) : (
                <div className="space-y-2">
                  {images.map((img, idx) => (
                    <div 
                      key={img.url}
                      className={`p-2.5 rounded-xl border flex items-center justify-between gap-3 transition-colors ${
                        idx === 0 
                          ? 'border-[#d4af37] bg-zinc-900' 
                          : 'border-zinc-800 bg-zinc-900/50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-lg bg-black border border-zinc-700 overflow-hidden shrink-0">
                          <img
                            src={img.url}
                            alt="Product preview"
                            className="w-full h-full object-cover object-center"
                          />
                        </div>
                        <div>
                          {idx === 0 ? (
                            <span className="inline-block px-2 py-0.5 rounded bg-[#d4af37] text-black font-bold text-[10px] uppercase font-mono">
                              Main Image
                            </span>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleSetMainImage(idx)}
                              className="text-[11px] text-[#d4af37] hover:underline cursor-pointer flex items-center gap-1"
                            >
                              <Star className="w-3 h-3" />
                              <span>Make Main</span>
                            </button>
                          )}
                          <span className="block text-[10px] text-zinc-500 font-mono mt-0.5 truncate max-w-[150px]">
                            {img.url.split('/').pop()}
                          </span>
                        </div>
                      </div>

                      {/* Reorder and Delete controls */}
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          disabled={idx === 0}
                          onClick={() => handleMoveImage(idx, 'up')}
                          className="p-1 rounded text-zinc-400 hover:text-white disabled:opacity-20 cursor-pointer"
                          title="Move Up"
                        >
                          <MoveUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          disabled={idx === images.length - 1}
                          onClick={() => handleMoveImage(idx, 'down')}
                          className="p-1 rounded text-zinc-400 hover:text-white disabled:opacity-20 cursor-pointer"
                          title="Move Down"
                        >
                          <MoveDown className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRemoveImage(idx)}
                          className="p-1 rounded text-zinc-500 hover:text-rose-400 cursor-pointer"
                          title="Remove Image"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Card 6: Video Link or MP4 < 10MB (Rule 5) */}
          <div className="p-6 bg-[#18181b] rounded-2xl border border-zinc-800 space-y-4">
            <div>
              <h3 className="font-display font-bold text-sm text-white uppercase tracking-wider text-[#d4af37]">
                6. Product Demonstration Video
              </h3>
              <p className="text-xs text-zinc-400 mt-1">
                Provide a YouTube / Instagram link, or upload an MP4 file strictly under 10 MB.
              </p>
            </div>

            {/* Toggle URL vs MP4 */}
            <div className="grid grid-cols-2 gap-2 p-1 rounded-xl bg-zinc-900 border border-zinc-800 text-xs">
              <button
                type="button"
                onClick={() => setVideoMode('url')}
                className={`py-1.5 px-3 rounded-lg font-semibold transition-all cursor-pointer ${
                  videoMode === 'url' ? 'bg-zinc-800 text-white shadow-xs' : 'text-zinc-400 hover:text-white'
                }`}
              >
                YouTube / Instagram URL
              </button>
              <button
                type="button"
                onClick={() => setVideoMode('upload')}
                className={`py-1.5 px-3 rounded-lg font-semibold transition-all cursor-pointer ${
                  videoMode === 'upload' ? 'bg-zinc-800 text-white shadow-xs' : 'text-zinc-400 hover:text-white'
                }`}
              >
                Upload MP4 (&lt;10 MB)
              </button>
            </div>

            {videoMode === 'url' ? (
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-300 block">
                  Video URL (YouTube or Instagram)
                </label>
                <div className="relative">
                  <input
                    type="url"
                    value={videoUrl}
                    onChange={(e) => setVideoUrl(e.target.value)}
                    placeholder="https://www.youtube.com/watch?v=... or Instagram reel"
                    className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-zinc-700 bg-zinc-900 text-white text-xs focus:outline-none focus:ring-1 focus:ring-[#d4af37]"
                  />
                  <LinkIcon className="w-4 h-4 text-zinc-500 absolute left-3 top-2.5" />
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <label className="text-xs font-semibold text-zinc-300 block">
                  Select MP4 Video File (Max 10 MB limit)
                </label>
                <input
                  type="file"
                  accept="video/mp4"
                  disabled={isUploadingVideo}
                  onChange={handleVideoFileSelect}
                  className="w-full text-xs text-zinc-400 file:mr-3 file:py-2 file:px-3 file:rounded-xl file:border file:border-zinc-700 file:bg-zinc-800 file:text-white file:text-xs file:font-semibold hover:file:bg-zinc-700 cursor-pointer"
                />
                {isUploadingVideo && (
                  <div className="flex items-center gap-2 text-xs text-[#d4af37]">
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Uploading MP4 to product-images/videos/...</span>
                  </div>
                )}
                {videoUrl && (
                  <div className="p-2.5 rounded-lg bg-zinc-900 border border-zinc-800 text-[11px] text-zinc-300 flex items-center justify-between">
                    <span className="truncate max-w-[200px] font-mono">{videoUrl}</span>
                    <button
                      type="button"
                      onClick={() => setVideoUrl('')}
                      className="text-rose-400 hover:underline cursor-pointer"
                    >
                      Remove
                    </button>
                  </div>
                )}

                {/* Live validation feedback and Safe Video Player (Rule 2) */}
                {videoUrl && !validateVideoUrl(videoUrl).valid && (
                  <div className="p-2.5 rounded-xl bg-rose-950/60 border border-rose-800 text-rose-300 text-[11px] flex items-start gap-2">
                    <AlertCircle className="w-3.5 h-3.5 text-rose-400 shrink-0 mt-0.5" />
                    <span>{validateVideoUrl(videoUrl).error}</span>
                  </div>
                )}

                {videoUrl && validateVideoUrl(videoUrl).valid && (
                  <div className="space-y-1.5 pt-2 border-t border-zinc-800">
                    <span className="text-[10px] uppercase font-mono font-bold tracking-wider text-zinc-400 block">
                      Safe Preview (No raw HTML / sandboxed)
                    </span>
                    <SafeVideoPlayer url={videoUrl} />
                  </div>
                )}
              </div>
            )}
          </div>

        </div>

      </form>

    </div>
  );
};
