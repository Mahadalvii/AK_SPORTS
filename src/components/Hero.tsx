import React from 'react';
import { ArrowRight, ShieldCheck, Zap, Sparkles, Check } from 'lucide-react';
import { Product, ThemeConfig } from '../types';
import { PageId } from './Header';

interface HeroProps {
  heroProduct?: Product;
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
    <section className="relative overflow-hidden pt-6 pb-12 sm:pt-10 sm:pb-16 md:pt-14 md:pb-20 border-b" style={{ borderColor: theme.border }}>
      {/* Subtle warm ambient highlight */}
      <div 
        className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[340px] sm:w-[650px] h-[220px] sm:h-[360px] rounded-full blur-[100px] sm:blur-[160px] pointer-events-none opacity-25"
        style={{ backgroundColor: '#e5c378' }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-center">
          
          {/* Left Column: Brand Statement & Apparel Value Proposition */}
          <div className="lg:col-span-7 space-y-4 sm:space-y-6">
            {/* Minimalist Kicker */}
            <div className="inline-flex items-center gap-1.5 sm:gap-2 text-[11px] sm:text-xs font-semibold tracking-wider uppercase" style={{ color: theme.accent }}>
              <Sparkles className="w-3.5 h-3.5" />
              <span>AK SPORTS - THE NAME OF QUALITY</span>
            </div>

            {/* Headline with responsive sizing */}
            <h1 
              className="font-display text-2xl sm:text-4xl lg:text-6xl font-extrabold tracking-tight leading-[1.15] sm:leading-[1.1] text-balance"
              style={{ color: theme.textPrimary }}
            >
              Performance gear. <br />
              <span 
                className="bg-clip-text text-transparent bg-gradient-to-r"
                style={{
                  backgroundImage: `linear-gradient(135deg, #b89428 0%, #d4af37 50%, #99751f 100%)`
                }}
              >
                Designed for daily wear.
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-xs sm:text-base leading-relaxed max-w-2xl" style={{ color: theme.textMuted }}>
              Flexible everyday joggers designed for natural movement, and performance tracksuits that keep you comfortable and dry.
            </p>

            {/* Action Buttons: Full width on mobile, inline on desktop */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
              <button
                onClick={() => onNavigate('apparel')}
                className="w-full sm:w-auto px-6 py-3.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-200 cursor-pointer shadow-md flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98]"
                style={{
                  backgroundColor: theme.accent,
                  color: theme.accentText,
                }}
              >
                <span>Apparel</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => onNavigate('bats')}
                className="w-full sm:w-auto px-6 py-3.5 rounded-xl text-xs font-semibold uppercase tracking-wider border transition-all duration-200 cursor-pointer hover:bg-black/5 text-center"
                style={{
                  borderColor: theme.border,
                  color: theme.textPrimary,
                  backgroundColor: theme.cardBg,
                }}
              >
                Tape Ball
              </button>

              <button
                onClick={() => onNavigate('hardball')}
                className="w-full sm:w-auto px-6 py-3.5 rounded-xl text-xs font-semibold uppercase tracking-wider border transition-all duration-200 cursor-pointer hover:bg-black/5 text-center"
                style={{
                  borderColor: theme.border,
                  color: theme.textPrimary,
                  backgroundColor: theme.cardBg,
                }}
              >
                Hard Ball
              </button>
            </div>

            {/* Proof Points Strip */}
            <div 
              className="grid grid-cols-2 gap-3 sm:gap-6 pt-4 sm:pt-6 border-t max-w-lg"
              style={{ borderColor: theme.border }}
            >
              <div className="p-2 sm:p-0 rounded-lg bg-black/2 sm:bg-transparent">
                <span className="font-display font-bold text-base sm:text-lg tabular-nums block" style={{ color: theme.accent }}>
                  7 Days Refund Policy
                </span>
                <span className="text-[11px] sm:text-xs text-zinc-600 block">
                  Hassle-Free Guarantee
                </span>
              </div>

              <div className="p-2 sm:p-0 rounded-lg bg-black/2 sm:bg-transparent">
                <span className="font-display font-bold text-base sm:text-lg tabular-nums block" style={{ color: theme.accent }}>
                  Verified Quality
                </span>
                <span className="text-[11px] sm:text-xs text-zinc-600 block">
                  Trusted Craftsmanship
                </span>
              </div>
            </div>
          </div>

          {/* Right Column: Hero Showcase Card */}
          <div className="lg:col-span-5">
            {heroProduct ? (
              <div 
                className="rounded-2xl border p-3.5 sm:p-5 shadow-lg relative group overflow-hidden transition-all duration-300"
                style={{
                  backgroundColor: theme.cardBg,
                  borderColor: theme.border,
                }}
              >
                {/* Image Container with Subtle Zoom */}
                <div 
                  className="relative aspect-4/3 sm:aspect-4/3 rounded-xl overflow-hidden cursor-pointer"
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
                    className="absolute top-2.5 left-2.5 sm:top-3 sm:left-3 px-2.5 py-1 rounded text-[10px] sm:text-[11px] font-bold tracking-wider uppercase shadow-md backdrop-blur-md"
                    style={{
                      backgroundColor: theme.accent,
                      color: theme.accentText,
                    }}
                  >
                    Featured Essential
                  </div>
                </div>

                {/* Product Info */}
                <div className="pt-3 sm:pt-4 space-y-2.5 sm:space-y-3">
                  <div className="flex items-center justify-between text-xs" style={{ color: theme.textMuted }}>
                    <span className="text-[11px] sm:text-xs">{heroProduct.categoryLabel}</span>
                    {Boolean(heroProduct.reviewsCount && heroProduct.reviewsCount > 0) && (
                      <span className="flex items-center gap-1 font-semibold text-[11px] sm:text-xs" style={{ color: theme.accent }}>
                        ★ {heroProduct.rating} ({heroProduct.reviewsCount})
                      </span>
                    )}
                  </div>

                  <div className="flex items-start justify-between gap-3">
                    <h3 
                      onClick={() => onOpenProduct(heroProduct)}
                      className="font-display font-bold text-base sm:text-lg hover:underline cursor-pointer leading-snug"
                      style={{ color: theme.textPrimary }}
                    >
                      {heroProduct.name}
                    </h3>
                    <div className="text-right shrink-0">
                      <span className="font-display font-bold text-base sm:text-lg tabular-nums block" style={{ color: theme.accent }}>
                        Rs. {heroProduct.price.toLocaleString()}
                      </span>
                      {heroProduct.originalPrice && (
                        <span className="text-[11px] sm:text-xs line-through tabular-nums" style={{ color: theme.textMuted }}>
                          Rs. {heroProduct.originalPrice.toLocaleString()}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Quick Action Buttons */}
                  <div className="grid grid-cols-2 gap-2 pt-1 sm:pt-2">
                    <button
                      onClick={() => onOpenProduct(heroProduct)}
                      className="py-2.5 px-3 rounded-lg text-xs font-semibold border transition-colors cursor-pointer text-center"
                      style={{
                        borderColor: theme.border,
                        backgroundColor: theme.bg,
                        color: theme.textPrimary,
                      }}
                    >
                      View Specs
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
            ) : (
              <div 
                className="rounded-2xl border p-3.5 sm:p-5 shadow-lg relative overflow-hidden"
                style={{
                  backgroundColor: theme.cardBg,
                  borderColor: theme.border,
                }}
              >
                <div className="relative aspect-4/3 rounded-xl overflow-hidden bg-zinc-950">
                  <img
                    src="/images/ak_sports_background.png"
                    alt="AK Sports Official Flagship Showcase"
                    className="w-full h-full object-cover object-center"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-black/20" />
                  <div 
                    className="absolute top-3 left-3 px-2.5 py-1 rounded text-[10px] sm:text-[11px] font-bold tracking-wider uppercase shadow-md"
                    style={{
                      backgroundColor: theme.accent,
                      color: theme.accentText,
                    }}
                  >
                    New Drop Coming Soon
                  </div>
                </div>
                <div className="pt-4 space-y-2">
                  <div className="flex items-center justify-between text-xs" style={{ color: theme.textMuted }}>
                    <span>Main Outlet: Cantt Road, Bahawalnagar</span>
                    <span className="font-semibold" style={{ color: theme.accent }}>Factory: Sialkot</span>
                  </div>
                  <h3 className="font-display font-bold text-base sm:text-lg" style={{ color: theme.textPrimary }}>
                    AK Sports — Official Storefront
                  </h3>
                  <p className="text-xs leading-relaxed" style={{ color: theme.textMuted }}>
                    New collection items are being uploaded shortly. Reach out on WhatsApp for custom bat weights or apparel inquiries.
                  </p>
                </div>
              </div>
            )}
          </div>

        </div>
      </div>
    </section>
  );
};
