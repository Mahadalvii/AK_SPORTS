import React from 'react';
import { Hammer, Scale, ShieldCheck, MessageCircle, ExternalLink, Sparkles, Check } from 'lucide-react';
import { ThemeConfig } from '../types';
import { TRUST_PROMISES } from '../data/products';

interface BrandStoryProps {
  theme: ThemeConfig;
  onNavigateToCategory: (page: 'apparel' | 'bats') => void;
}

export const BrandStory: React.FC<BrandStoryProps> = ({ theme, onNavigateToCategory }) => {
  const facebookUrl = "https://www.facebook.com/share/1GwRXXcXXm/";

  return (
    <section className="py-10 sm:py-16 md:py-24 border-b" style={{ borderColor: theme.border }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10 sm:space-y-16">
        
        {/* Center-Aligned Brand Showcase Section */}
        <div 
          className="rounded-2xl sm:rounded-3xl border overflow-hidden shadow-md text-center"
          style={{
            borderColor: theme.border,
            backgroundColor: theme.cardBg,
          }}
        >
          {/* Main Visual: Workshop Photo with Clickable Facebook Link */}
          <a
            href={facebookUrl}
            target="_blank"
            rel="noreferrer"
            className="block relative w-full overflow-hidden group bg-black cursor-pointer"
            title="Visit Official AK Sports Facebook Workshop"
          >
            <img
              src="/images/ak_sports_background.png"
              alt="AK Sports Workshop with Sialkot Handcrafted Gold Edition Bat and Crest"
              className="w-full h-auto max-h-[250px] sm:max-h-[380px] md:max-h-[520px] object-cover object-center transition-transform duration-700 group-hover:scale-[1.02]"
            />

            {/* Clean Facebook Workshop link pill in corner */}
            <div className="absolute bottom-2.5 right-2.5 sm:bottom-4 sm:right-4 z-10">
              <span className="inline-flex items-center gap-1.5 sm:gap-2 px-2.5 py-1 sm:px-3.5 sm:py-1.5 rounded-full bg-black/80 hover:bg-black/95 backdrop-blur-md border border-[#d4af37]/60 text-[10px] sm:text-xs font-semibold text-white shadow-xl transition-all duration-300 group-hover:scale-105">
                <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-[#d4af37]" />
                <span className="text-[#f3e08b] font-mono text-[9px] sm:text-[11px] uppercase tracking-wider">Facebook Page</span>
                <ExternalLink className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[#d4af37]" />
              </span>
            </div>
          </a>

          {/* Editorial Story Text & Buttons Below Banner (Responsive Padding) */}
          <div className="p-4 sm:p-8 md:p-12 max-w-4xl mx-auto space-y-4 sm:space-y-6">
            <div className="inline-flex items-center justify-center gap-1.5 text-[11px] sm:text-xs font-bold uppercase tracking-wider text-[#b89428]">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Sialkot Factory Mastery &amp; Modern Apparel</span>
            </div>

            <h3 className="font-display text-xl sm:text-2xl md:text-3xl font-extrabold tracking-tight text-zinc-900 leading-tight">
              Where everyday sportswear meets master cricket craft.
            </h3>

            <p className="text-xs sm:text-sm leading-relaxed text-zinc-600 max-w-2xl mx-auto">
              Born in Sialkot, AK Sports unites two worlds: engineered everyday athletic apparel (4-way stretch flex joggers, combed heavy-cotton tees, and training gear) built for daily gym and street life, alongside our master-carved tape ball cricket bats with 48mm+ massive edges.
            </p>

            {/* Responsive Highlights */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 max-w-2xl mx-auto text-left pt-2">
              <div className="p-3.5 sm:p-4 rounded-xl border bg-[#fcfbf9] flex items-start gap-3" style={{ borderColor: theme.border }}>
                <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center shrink-0 border border-[#b89428] text-[#b89428] font-bold text-[10px] sm:text-xs">
                  ✓
                </div>
                <div>
                  <h4 className="text-xs font-bold text-zinc-900">Everyday Athletic Fit &amp; Durability</h4>
                  <p className="text-[11px] text-zinc-500 mt-0.5">Pre-shrunk 280 GSM cotton and zippered stretch trousers tested for all-day gym, travel, and casual movement.</p>
                </div>
              </div>

              <div className="p-3.5 sm:p-4 rounded-xl border bg-[#fcfbf9] flex items-start gap-3" style={{ borderColor: theme.border }}>
                <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center shrink-0 border border-[#b89428] text-[#b89428] font-bold text-[10px] sm:text-xs">
                  ✓
                </div>
                <div>
                  <h4 className="text-xs font-bold text-zinc-900">Direct Factory-to-Doorstep Pricing</h4>
                  <p className="text-[11px] text-zinc-500 mt-0.5">Zero middleman markup with nationwide Cash On Delivery across all cities in Pakistan.</p>
                </div>
              </div>
            </div>

            {/* Centered Action Buttons: Full-width on mobile */}
            <div className="pt-2 sm:pt-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3">
              <a
                href={facebookUrl}
                target="_blank"
                rel="noreferrer"
                className="w-full sm:w-auto px-5 py-3 rounded-xl text-xs font-bold uppercase tracking-wider border transition-all cursor-pointer flex items-center justify-center gap-2 hover:bg-black/5 shadow-xs"
                style={{
                  borderColor: theme.accent,
                  color: theme.accent,
                }}
              >
                <span>Visit Facebook Page</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>

              <button
                onClick={() => onNavigateToCategory('apparel')}
                className="w-full sm:w-auto px-5 py-3 rounded-xl text-xs font-bold uppercase tracking-wider text-white transition-all cursor-pointer shadow-md hover:opacity-90 active:scale-95 text-center"
                style={{
                  backgroundColor: theme.accent,
                }}
              >
                Explore Athletic Wear
              </button>
            </div>
          </div>

        </div>

        {/* The 4 Trust Pillars */}
        <div>
          <div className="text-center max-w-xl mx-auto mb-6 sm:mb-10">
            <span className="text-[11px] sm:text-xs uppercase font-semibold tracking-widest text-[#b89428]">
              Direct From Maker To Player
            </span>
            <h3 className="font-display text-xl sm:text-2xl font-bold mt-1 text-zinc-900">
              The AK Sports Guarantee
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-6">
            {TRUST_PROMISES.map((t, idx) => (
              <div 
                key={t.title}
                className="p-4 sm:p-6 rounded-2xl border flex items-start gap-3.5 sm:flex-col sm:items-start transition-all duration-200 hover:-translate-y-1 shadow-2xs"
                style={{
                  backgroundColor: theme.cardBg,
                  borderColor: theme.border,
                }}
              >
                <div 
                  className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center border shrink-0"
                  style={{
                    backgroundColor: theme.badgeBg,
                    borderColor: theme.accent,
                    color: theme.accent,
                  }}
                >
                  {idx === 0 && <Hammer className="w-4 h-4 sm:w-5 sm:h-5" />}
                  {idx === 1 && <ShieldCheck className="w-4 h-4 sm:w-5 sm:h-5" />}
                  {idx === 2 && <Scale className="w-4 h-4 sm:w-5 sm:h-5" />}
                  {idx === 3 && <MessageCircle className="w-4 h-4 sm:w-5 sm:h-5" />}
                </div>

                <div>
                  <h4 className="font-display font-bold text-xs sm:text-sm mb-1 text-zinc-900">
                    {t.title}
                  </h4>
                  <p className="text-[11px] sm:text-xs leading-relaxed text-zinc-600">
                    {t.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
};
