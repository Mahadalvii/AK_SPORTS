import React from 'react';
import { Eye, ShoppingCart, Star, Sparkles } from 'lucide-react';
import { Product, ThemeConfig } from '../types';

interface ProductCardProps {
  product: Product;
  onOpenProduct: (product: Product) => void;
  onAddToCart: (product: Product) => void;
  theme: ThemeConfig;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onOpenProduct,
  onAddToCart,
  theme,
}) => {
  return (
    <div 
      className="group rounded-xl border flex flex-col justify-between overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-xl relative"
      style={{
        backgroundColor: theme.cardBg,
        borderColor: theme.border,
      }}
    >
      {/* Product Image Stage */}
      <div 
        className="relative aspect-4/3 overflow-hidden cursor-pointer"
        onClick={() => onOpenProduct(product)}
        style={{ backgroundColor: theme.bg }}
      >
        <img
          src={product.image}
          alt={product.name}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />

        {/* Subtle Minimalist Tag */}
        {product.tag && (
          <div 
            className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase backdrop-blur-md shadow-sm"
            style={{
              backgroundColor: theme.mode === 'dark' ? 'rgba(0,0,0,0.75)' : 'rgba(255,255,255,0.9)',
              color: theme.accent,
              border: `1px solid ${theme.border}`,
            }}
          >
            {product.tag}
          </div>
        )}

        {/* Quick View Overlay Trigger */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center gap-2 p-4">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onOpenProduct(product);
            }}
            className="px-3.5 py-2 rounded-lg text-xs font-semibold bg-white text-zinc-900 shadow-lg flex items-center gap-1.5 hover:bg-zinc-100 transition-transform active:scale-95 cursor-pointer"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Quick Specs</span>
          </button>
        </div>
      </div>

      {/* Content & Metadata */}
      <div className="p-4 flex flex-col flex-1 justify-between gap-3">
        <div>
          {/* Unboxed Metadata Line with typographic dot separator */}
          <div className="flex items-center justify-between text-[11px] mb-1.5" style={{ color: theme.textMuted }}>
            <span className="uppercase font-semibold tracking-wider">{product.categoryLabel}</span>
            {Boolean(product.reviewsCount && product.reviewsCount > 0) && (
              <span className="flex items-center gap-1">
                <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                <span className="tabular-nums font-medium">{product.rating}</span>
              </span>
            )}
          </div>

          {/* Product Title */}
          <h4 
            onClick={() => onOpenProduct(product)}
            className="font-display font-semibold text-base line-clamp-2 hover:underline cursor-pointer transition-colors"
            style={{ color: theme.textPrimary }}
          >
            {product.name}
          </h4>

          {/* Short feature preview */}
          {product.specs?.[0] && (
            <p className="text-xs line-clamp-1 mt-1" style={{ color: theme.textMuted }}>
              {product.specs[0].label}: {product.specs[0].value}
            </p>
          )}
        </div>

        {/* Price & Add to Cart Footer */}
        <div className="pt-2 border-t flex items-center justify-between gap-2" style={{ borderColor: theme.border }}>
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="font-display font-bold text-base tabular-nums" style={{ color: theme.accent }}>
                Rs. {product.price.toLocaleString()}
              </span>
              {product.originalPrice && (
                <span className="text-[11px] line-through tabular-nums" style={{ color: theme.textMuted }}>
                  Rs. {product.originalPrice.toLocaleString()}
                </span>
              )}
            </div>
            <span className="text-[10px] block" style={{ color: theme.textMuted }}>
              Cash on delivery
            </span>
          </div>

          <button
            onClick={() => onAddToCart(product)}
            className="px-3 py-2 rounded-lg text-xs font-semibold transition-all duration-150 flex items-center gap-1.5 cursor-pointer hover:opacity-90 active:scale-95 shadow-sm"
            style={{
              backgroundColor: theme.accent,
              color: theme.accentText,
            }}
            title="Add to Cart"
          >
            <ShoppingCart className="w-3.5 h-3.5" />
            <span>Add to Cart</span>
          </button>
        </div>
      </div>
    </div>
  );
};
