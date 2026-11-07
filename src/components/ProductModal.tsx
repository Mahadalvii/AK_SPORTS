import React, { useState } from 'react';
import { X, Star, ShoppingCart, MessageCircle, ShieldCheck, Truck, RotateCcw, Check } from 'lucide-react';
import { Product, ThemeConfig } from '../types';
import { SafeVideoPlayer } from './SafeVideoPlayer';

interface ProductModalProps {
  product: Product | null;
  onClose: () => void;
  onAddToCart: (product: Product, quantity: number, selectedSize?: string) => void;
  theme: ThemeConfig;
}

export const ProductModal: React.FC<ProductModalProps> = ({
  product,
  onClose,
  onAddToCart,
  theme,
}) => {
  if (!product) return null;

  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState<string | undefined>(
    product.sizes ? product.sizes[0] : undefined
  );
  const [addedNotice, setAddedNotice] = useState(false);

  const handleAdd = () => {
    onAddToCart(product, quantity, selectedSize);
    setAddedNotice(true);
    setTimeout(() => setAddedNotice(false), 2200);
  };

  const whatsAppUrl = `https://wa.me/923082073415?text=${encodeURIComponent(
    `Hello AK Sports! I am interested in purchasing:
- Product: ${product.name}
- Price: Rs. ${product.price.toLocaleString()}
${selectedSize ? `- Variant/Size: ${selectedSize}` : ''}
- Quantity: ${quantity}
Please confirm availability and Cash on Delivery details.`
  )}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="w-full max-w-3xl max-h-[92vh] flex flex-col md:flex-row rounded-2xl shadow-2xl overflow-hidden border transition-all duration-300 relative"
        style={{
          backgroundColor: theme.cardBg,
          borderColor: theme.border,
          color: theme.textPrimary,
        }}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          aria-label="Close details"
          className="absolute top-4 right-4 z-20 p-2 rounded-full bg-black/60 text-white hover:bg-black/90 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Left Column: Image Showcase */}
        <div 
          className="md:w-1/2 relative min-h-[260px] md:min-h-[460px] flex items-center justify-center overflow-hidden"
          style={{ backgroundColor: theme.bg }}
        >
          <img
            src={product.image}
            alt={product.name}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover"
          />

          {product.tag && (
            <div 
              className="absolute top-4 left-4 px-3 py-1 rounded text-xs font-bold tracking-wider uppercase shadow-md backdrop-blur-md"
              style={{
                backgroundColor: theme.accent,
                color: theme.accentText,
              }}
            >
              {product.tag}
            </div>
          )}
        </div>

        {/* Right Column: Detailed Product Purchase Module */}
        <div className="md:w-1/2 p-6 overflow-y-auto flex flex-col justify-between space-y-5">
          <div className="space-y-4">
            {/* Category & Rating */}
            <div className="flex items-center justify-between text-xs" style={{ color: theme.textMuted }}>
              <span className="uppercase font-semibold tracking-wider">{product.categoryLabel}</span>
              {Boolean(product.reviewsCount && product.reviewsCount > 0) && (
                <div className="flex items-center gap-1 font-semibold" style={{ color: theme.accent }}>
                  <Star className="w-3.5 h-3.5 fill-current" />
                  <span className="tabular-nums">{product.rating}</span>
                  <span style={{ color: theme.textMuted }}>({product.reviewsCount} reviews)</span>
                </div>
              )}
            </div>

            {/* Product Name */}
            <h2 className="font-display font-bold text-2xl leading-tight" style={{ color: theme.textPrimary }}>
              {product.name}
            </h2>

            {/* Price block */}
            <div className="flex items-baseline gap-3">
              <span className="font-display font-extrabold text-2xl tabular-nums" style={{ color: theme.accent }}>
                Rs. {product.price.toLocaleString()}
              </span>
              {product.originalPrice && (
                <span className="text-sm line-through tabular-nums" style={{ color: theme.textMuted }}>
                  Rs. {product.originalPrice.toLocaleString()}
                </span>
              )}
              {product.originalPrice && (
                <span className="text-xs px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 font-medium">
                  Save Rs. {(product.originalPrice - product.price).toLocaleString()}
                </span>
              )}
            </div>

            {/* Description */}
            <p className="text-xs sm:text-sm leading-relaxed" style={{ color: theme.textMuted }}>
              {product.description}
            </p>

            {/* Size / Weight Selector if available */}
            {product.sizes && product.sizes.length > 0 && (
              <div className="space-y-2 pt-2 border-t" style={{ borderColor: theme.border }}>
                <label className="text-xs font-semibold block" style={{ color: theme.textPrimary }}>
                  Select Specification / Weight:
                </label>
                <div className="grid grid-cols-1 gap-1.5">
                  {product.sizes.map((sz) => (
                    <button
                      key={sz}
                      onClick={() => setSelectedSize(sz)}
                      className={`px-3 py-2 text-xs rounded-lg border text-left flex items-center justify-between transition-colors cursor-pointer ${
                        selectedSize === sz ? 'font-semibold' : 'opacity-80 hover:opacity-100'
                      }`}
                      style={{
                        borderColor: selectedSize === sz ? theme.accent : theme.border,
                        backgroundColor: selectedSize === sz ? theme.badgeBg : theme.bg,
                        color: selectedSize === sz ? theme.accent : theme.textPrimary,
                      }}
                    >
                      <span>{sz}</span>
                      {selectedSize === sz && <Check className="w-3.5 h-3.5" />}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Optional Demonstration Video (Security Rule 2: Safe embed or <video src>) */}
            {product.videoUrl && (
              <div className="space-y-1.5 pt-2 border-t" style={{ borderColor: theme.border }}>
                <span className="text-xs font-bold uppercase tracking-wider block" style={{ color: theme.textPrimary }}>
                  Demonstration Video:
                </span>
                <SafeVideoPlayer url={product.videoUrl} />
              </div>
            )}

            {/* Specs Sheet Table */}
            <div className="space-y-2 pt-2 border-t" style={{ borderColor: theme.border }}>
              <span className="text-xs font-bold uppercase tracking-wider block" style={{ color: theme.textPrimary }}>
                Tournament Specifications:
              </span>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {product.specs.map((sp) => (
                  <div key={sp.label} className="p-2 rounded border" style={{ backgroundColor: theme.bg, borderColor: theme.border }}>
                    <span className="text-[10px] block font-medium" style={{ color: theme.textMuted }}>{sp.label}</span>
                    <span className="font-semibold block truncate" style={{ color: theme.textPrimary }}>{sp.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Quantity and Actions */}
          <div className="space-y-3 pt-3 border-t" style={{ borderColor: theme.border }}>
            <div className="flex items-center gap-3">
              <span className="text-xs font-medium" style={{ color: theme.textMuted }}>Qty:</span>
              <div className="flex items-center border rounded-lg overflow-hidden" style={{ borderColor: theme.border }}>
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-3 py-1.5 hover:bg-white/10 transition-colors text-sm cursor-pointer"
                >
                  -
                </button>
                <span className="px-3 py-1.5 text-xs font-semibold tabular-nums" style={{ color: theme.textPrimary }}>
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="px-3 py-1.5 hover:bg-white/10 transition-colors text-sm cursor-pointer"
                >
                  +
                </button>
              </div>

              <span className="text-xs text-emerald-400 font-medium">In Stock ({product.stock} left)</span>
            </div>

            {/* Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <button
                onClick={handleAdd}
                className="w-full py-3 px-4 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-150 flex items-center justify-center gap-2 cursor-pointer active:scale-95 shadow-md"
                style={{
                  backgroundColor: theme.accent,
                  color: theme.accentText,
                }}
              >
                <ShoppingCart className="w-4 h-4" />
                <span>{addedNotice ? 'Added to Cart!' : 'Add to Cart'}</span>
              </button>

              <a
                href={whatsAppUrl}
                target="_blank"
                rel="noreferrer"
                className="w-full py-3 px-4 rounded-xl text-xs font-bold uppercase tracking-wider bg-emerald-600 hover:bg-emerald-500 text-white transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md text-center"
              >
                <MessageCircle className="w-4 h-4" />
                <span>WhatsApp Order</span>
              </a>
            </div>

            {/* Reassurance strip */}
            <div className="grid grid-cols-3 gap-2 pt-2 text-[10px] text-center" style={{ color: theme.textMuted }}>
              <div className="flex flex-col items-center gap-1">
                <Truck className="w-3.5 h-3.5" style={{ color: theme.accent }} />
                <span>Free delivery over Rs. 3,000</span>
              </div>
              <div className="flex flex-col items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" style={{ color: theme.accent }} />
                <span>Cash on Delivery</span>
              </div>
              <div className="flex flex-col items-center gap-1">
                <RotateCcw className="w-3.5 h-3.5" style={{ color: theme.accent }} />
                <span>7-Day Replacement</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
