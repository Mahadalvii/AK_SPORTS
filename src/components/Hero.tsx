import React from 'react';
import { ArrowRight, ShieldCheck, Zap, Sparkles, Check } from 'lucide-react';
import { Product, ThemeConfig } from '../types';

import { PageId } from './Header';

interface HeroProps {
  heroProduct: Product;
  onOpenProduct: (product: Product) => void;
  onAddToCart: (product: Product) => void;
  onNavigate: (page: PageId) => void;
  theme: ThemeConfig;
}

export const Hero: React.FC<HeroProps> = ({
  heroProduct,
  onOpenProduct,
  onAddToCart,
  onNavigate,
  theme,
}) => {
  return (
    <section className="relative overflow-hidden pt-8 pb-16 md:pt-12 md:pb-20 border-b" style={{ borderColor: theme.border }}>
      {/* Subtle warm ambient highlight */}
      <div 
        className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[360px] rounded-full blur-[160px] pointer-events-none opacity-25"
        style={{ backgroundColor: '#e5c378' }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          
          {/* Left Column: Brand Statement & Apparel Value Proposition */}
          <div className="lg:col-span-7 space-y-6">
            {/* Minimalist Kicker */}
            <div className="inline-flex items-center gap-2 text-xs font-semibold tracking-wider uppercase" style={{ color: theme.accent }}>
              <Sparkles className="w-3.5 h-3.5" />
              <span>Contemporary Athletic Wear · Tape Ball Cricket Division</span>
            </div>

            {/* Headline with text-wrap: balance */}
            <h1 
              className="font-display text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.1] text-balance"
              style={{ color: theme.textPrimary }}
            >
              Everyday athletic wear. <br />
              <span 
                className="bg-clip-text text-transparent bg-gradient-to-r"
                style={{
                  backgroundImage: `linear-gradient(135deg, #b89428 0%, #d4af37 50%, #99751f 100%)`
                }}
              >
                Engineered for life.
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-base sm:text-lg max-w-2xl leading-relaxed" style={{ color: theme.textMuted }}>
              Premium four-way stretch joggers, heavy-cotton drop-shoulder tees, and moisture-wicking training tracksuits built for gym, streetwear, and daily comfort—paired with our handcrafted tournament tape ball cricket gear.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <button
                onClick={() => onNavigate('apparel')}
                className="px-6 py-3.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all duration-200 cursor-pointer shadow-md flex items-center gap-2 hover:scale-[1.02] active:scale-[0.98]"
                style={{
                  backgroundColor: theme.accent,
                  color: theme.accentText,
                }}
              >
                <span>Shop Athletic Wear</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => onNavigate('bats')}
                className="px-6 py-3.5 rounded-lg text-xs font-semibold uppercase tracking-wider border transition-all duration-200 cursor-pointer hover:bg-black/5"
                style={{
                  borderColor: theme.border,
                  color: theme.textPrimary,
                  backgroundColor: theme.cardBg,
                }}
              >
                Tape Ball Cricket
              </button>
            </div>

            {/* Proof Points Strip */}
            <div 
              className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6 border-t"
              style={{ borderColor: theme.border }}
            >
              <div>
                <span className="font-display font-bold text-lg tabular-nums block" style={{ color: theme.accent }}>
                  4-Way Flex
                </span>
                <span className="text-xs" style={{ color: theme.textMuted }}>
                  Stretch Trousers
                </span>
              </div>

              <div>
                <span className="font-display font-bold text-lg tabular-nums block" style={{ color: theme.accent }}>
                  280 GSM
                </span>
                <span className="text-xs" style={{ color: theme.textMuted }}>
                  Combed Heavy Cotton
                </span>
              </div>

              <div>
                <span className="font-display font-bold text-lg tabular-nums block" style={{ color: theme.accent }}>
                  48mm Edges
                </span>
                <span className="text-xs" style={{ color: theme.textMuted }}>
                  Tape Ball Bats
                </span>
              </div>

              <div>
                <span className="font-display font-bold text-lg tabular-nums block" style={{ color: theme.accent }}>
                  100% COD
                </span>
                <span className="text-xs" style={{ color: theme.textMuted }}>
                  Pay at Doorstep
                </span>
              </div>
            </div>
          </div>

          {/* Right Column: Hero Showcase Card (Trousers / Lead Apparel) */}
          <div className="lg:col-span-5">
            <div 
              className="rounded-2xl border p-5 shadow-lg relative group overflow-hidden transition-all duration-300"
              style={{
                backgroundColor: theme.cardBg,
                borderColor: theme.border,
              }}
            >
              {/* Image Container with Subtle Zoom */}
              <div 
                className="relative aspect-4/3 rounded-xl overflow-hidden cursor-pointer"
                onClick={() => onOpenProduct(heroProduct)}
                style={{ backgroundColor: theme.bg }}
              >
                <img
                  src={heroProduct.image}
                  alt={heroProduct.name}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                
                {/* Minimalist Pill Tag */}
                <div 
                  className="absolute top-3 left-3 px-2.5 py-1 rounded text-[11px] font-bold tracking-wider uppercase shadow-md backdrop-blur-md"
                  style={{
                    backgroundColor: theme.accent,
                    color: theme.accentText,
                  }}
                >
                  Featured Daily Essential
                </div>
              </div>

              {/* Product Info */}
              <div className="pt-4 space-y-3">
                <div className="flex items-center justify-between text-xs" style={{ color: theme.textMuted }}>
                  <span>Slim Tapered Cut · Gold Zipper Pockets</span>
                  <span className="flex items-center gap-1 font-semibold" style={{ color: theme.accent }}>
                    ★ {heroProduct.rating} ({heroProduct.reviewsCount})
                  </span>
                </div>

                <div className="flex items-start justify-between gap-4">
                  <h3 
                    onClick={() => onOpenProduct(heroProduct)}
                    className="font-display font-bold text-lg hover:underline cursor-pointer leading-tight"
                    style={{ color: theme.textPrimary }}
                  >
                    {heroProduct.name}
                  </h3>
                  <div className="text-right shrink-0">
                    <span className="font-display font-bold text-lg tabular-nums block" style={{ color: theme.accent }}>
                      Rs. {heroProduct.price.toLocaleString()}
                    </span>
                    {heroProduct.originalPrice && (
                      <span className="text-xs line-through tabular-nums" style={{ color: theme.textMuted }}>
                        Rs. {heroProduct.originalPrice.toLocaleString()}
                      </span>
                    )}
                  </div>
                </div>

                {/* Quick Action Buttons */}
                <div className="grid grid-cols-2 gap-2 pt-2">
                  <button
                    onClick={() => onOpenProduct(heroProduct)}
                    className="py-2.5 px-3 rounded-lg text-xs font-semibold border transition-colors cursor-pointer text-center"
                    style={{
                      borderColor: theme.border,
                      backgroundColor: theme.bg,
                      color: theme.textPrimary,
                    }}
                  >
                    View Sizes &amp; Fit
                  </button>
                  <button
                    onClick={() => onAddToCart(heroProduct)}
                    className="py-2.5 px-3 rounded-lg text-xs font-bold uppercase tracking-wider transition-all cursor-pointer text-center active:scale-95 shadow-sm"
                    style={{
                      backgroundColor: theme.accent,
                      color: theme.accentText,
                    }}
                  >
                    Add to Cart
                  </button>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
