import React from 'react';
import { Eye, ShoppingCart, Star } from 'lucide-react';
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
        className="relative aspect-square sm:aspect-4/3 overflow-hidden cursor-pointer"
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
            className="absolute top-2 left-2 sm:top-2.5 sm:left-2.5 px-1.5 py-0.5 sm:px-2 rounded text-[9px] sm:text-[10px] font-bold tracking-wider uppercase backdrop-blur-md shadow-sm"
            style={{
              backgroundColor: theme.mode === 'dark' ? 'rgba(0,0,0,0.75)' : 'rgba(255,255,255,0.92)',
              color: theme.accent,
              border: `1px solid ${theme.border}`,
            }}
          >
            {product.tag}
          </div>
        )}

        {/* Quick View Overlay Trigger (Desktop hover) */}
        <div className="hidden sm:flex absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 items-center justify-center gap-2 p-4">
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
      <div className="p-2.5 sm:p-4 flex flex-col flex-1 justify-between gap-2 sm:gap-3">
        <div>
          {/* Metadata Line */}
          <div className="flex items-center justify-between text-[10px] sm:text-[11px] mb-1 text-zinc-500">
            <span className="uppercase font-semibold tracking-wider truncate mr-1">
              {product.categoryLabel}
            </span>
            {Boolean(product.reviewsCount && product.reviewsCount > 0) && (
              <span className="flex items-center gap-0.5 sm:gap-1 shrink-0">
                <Star className="w-2.5 h-2.5 sm:w-3 sm:h-3 fill-amber-400 text-amber-400" />
                <span className="tabular-nums font-medium text-[10px] sm:text-[11px]">{product.rating}</span>
              </span>
            )}
          </div>

          {/* Product Title */}
          <h4 
            onClick={() => onOpenProduct(product)}
            className="font-display font-semibold text-xs sm:text-base line-clamp-2 hover:underline cursor-pointer transition-colors leading-snug"
            style={{ color: theme.textPrimary }}
            title={product.name}
          >
            {product.name}
          </h4>

          {/* Short feature preview (hidden on extra small screens for tight grid) */}
          {product.specs?.[0] && (
            <p className="hidden sm:block text-xs line-clamp-1 mt-1 text-zinc-500">
              {product.specs[0].label}: {product.specs[0].value}
            </p>
          )}
        </div>

        {/* Price & Add to Cart Footer */}
        <div className="pt-2 border-t flex items-center justify-between gap-1.5" style={{ borderColor: theme.border }}>
          <div className="min-w-0">
            <div className="flex flex-col sm:flex-row sm:items-baseline sm:gap-1.5">
              <span className="font-display font-bold text-xs sm:text-base tabular-nums truncate block" style={{ color: theme.accent }}>
                Rs. {product.price.toLocaleString()}
              </span>
              {product.originalPrice && (
                <span className="text-[9px] sm:text-[11px] line-through tabular-nums text-zinc-400 block sm:inline">
                  Rs. {product.originalPrice.toLocaleString()}
                </span>
              )}
            </div>
          </div>

          <button
            onClick={() => onAddToCart(product)}
            className="px-2 py-1.5 sm:px-3 sm:py-2 rounded-lg text-[11px] sm:text-xs font-semibold transition-all duration-150 flex items-center gap-1 sm:gap-1.5 cursor-pointer hover:opacity-90 active:scale-95 shadow-xs shrink-0"
            style={{
              backgroundColor: theme.accent,
              color: theme.accentText,
            }}
            title="Add to Cart"
          >
            <ShoppingCart className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
            <span className="hidden xs:inline sm:inline">Add</span>
          </button>
        </div>
      </div>
    </div>
  );
};
