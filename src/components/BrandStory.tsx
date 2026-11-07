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
    <section className="py-16 md:py-24 border-b" style={{ borderColor: theme.border }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        
        {/* Center-Aligned Brand Showcase Section */}
        <div 
          className="rounded-3xl border overflow-hidden shadow-md text-center"
          style={{
            borderColor: theme.border,
            backgroundColor: theme.cardBg,
          }}
        >
          {/* Main Visual: Full Workshop Photo with Direct Clickable Facebook Link */}
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
              className="w-full h-auto max-h-[520px] object-cover object-center transition-transform duration-700 group-hover:scale-[1.02]"
            />

            {/* Clean, minimal Facebook Workshop link pill in corner */}
            <div className="absolute bottom-4 right-4 z-10">
              <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-black/75 hover:bg-black/90 backdrop-blur-md border border-[#d4af37]/60 text-xs font-semibold text-white shadow-xl transition-all duration-300 group-hover:scale-105">
                <span className="w-2 h-2 rounded-full bg-[#d4af37]" />
                <span className="text-[#f3e08b] font-mono text-[11px] uppercase tracking-wider">Official Facebook Page</span>
                <ExternalLink className="w-3.5 h-3.5 text-[#d4af37]" />
              </span>
            </div>
          </a>

          {/* Editorial Story Text & Buttons Below Banner (Clean, Center-Aligned) */}
          <div className="p-8 sm:p-12 max-w-4xl mx-auto space-y-6">
            <div className="inline-flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-wider text-[#b89428]">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Sialkot Factory Mastery &amp; Modern Apparel</span>
            </div>

            <h3 className="font-display text-2xl sm:text-3xl font-extrabold tracking-tight text-zinc-900">
              Where everyday sportswear meets master cricket craft.
            </h3>

            <p className="text-sm leading-relaxed text-zinc-600 max-w-2xl mx-auto">
              Born in Sialkot, AK Sports unites two worlds: engineered everyday athletic apparel (4-way stretch flex joggers, combed heavy-cotton tees, and training gear) built for daily gym and street life, alongside our master-carved tape ball cricket bats with 48mm+ massive edges.
            </p>

            {/* Centered Highlights */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl mx-auto text-left pt-2">
              <div className="p-4 rounded-xl border bg-[#fcfbf9] flex items-start gap-3" style={{ borderColor: theme.border }}>
                <div className="w-6 h-6 rounded-full flex items-center justify-center shrink-0 border border-[#b89428] text-[#b89428] font-bold text-xs">
                  ✓
                </div>
                <div>
                  <h4 className="text-xs font-bold text-zinc-900">Everyday Athletic Fit &amp; Durability</h4>
                  <p className="text-[11px] text-zinc-500">Pre-shrunk 280 GSM cotton and zippered stretch trousers tested for all-day gym, travel, and casual movement.</p>
                </div>
              </div>

              <div className="p-4 rounded-xl border bg-[#fcfbf9] flex items-start gap-3" style={{ borderColor: theme.border }}>
                <div className="w-6 h-6 rounded-full flex items-center justify-center shrink-0 border border-[#b89428] text-[#b89428] font-bold text-xs">
                  ✓
                </div>
                <div>
                  <h4 className="text-xs font-bold text-zinc-900">Direct Factory-to-Doorstep Pricing</h4>
                  <p className="text-[11px] text-zinc-500">Zero middleman markup with nationwide Cash On Delivery across all cities in Pakistan.</p>
                </div>
              </div>
            </div>

            {/* Centered Action Buttons */}
            <div className="pt-4 flex flex-wrap items-center justify-center gap-4">
              <a
                href={facebookUrl}
                target="_blank"
                rel="noreferrer"
                className="px-6 py-3 rounded-xl text-xs font-bold uppercase tracking-wider border transition-all cursor-pointer flex items-center gap-2 hover:bg-black/5 shadow-xs"
                style={{
                  borderColor: theme.accent,
                  color: theme.accent,
                }}
              >
                <span>Visit Official Facebook Page</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>

              <button
                onClick={() => onNavigateToCategory('apparel')}
                className="px-6 py-3 rounded-xl text-xs font-bold uppercase tracking-wider text-white transition-all cursor-pointer shadow-md hover:opacity-90 active:scale-95"
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
          <div className="text-center max-w-xl mx-auto mb-10">
            <span className="text-xs uppercase font-semibold tracking-widest text-[#b89428]">
              Direct From Maker To Player
            </span>
            <h3 className="font-display text-2xl font-bold mt-1 text-zinc-900">
              The AK Sports Guarantee
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {TRUST_PROMISES.map((t, idx) => (
              <div 
                key={t.title}
                className="p-6 rounded-2xl border flex flex-col items-start gap-4 transition-all duration-200 hover:-translate-y-1 shadow-xs"
                style={{
                  backgroundColor: theme.cardBg,
                  borderColor: theme.border,
                }}
              >
                <div 
                  className="w-12 h-12 rounded-xl flex items-center justify-center border"
                  style={{
                    backgroundColor: theme.badgeBg,
                    borderColor: theme.accent,
                    color: theme.accent,
                  }}
                >
                  {idx === 0 && <Hammer className="w-5 h-5" />}
                  {idx === 1 && <ShieldCheck className="w-5 h-5" />}
                  {idx === 2 && <Scale className="w-5 h-5" />}
                  {idx === 3 && <MessageCircle className="w-5 h-5" />}
                </div>

                <div>
                  <h4 className="font-display font-bold text-sm mb-1 text-zinc-900">
                    {t.title}
                  </h4>
                  <p className="text-xs leading-relaxed text-zinc-600">
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
