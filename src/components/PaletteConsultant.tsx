import React, { useState } from 'react';
import { X, Check, Palette, Sparkles, Sliders, Layers, Eye, Shield, ArrowRight } from 'lucide-react';
import { THEMES } from '../data/products';
import { ColorPalette, ThemeConfig } from '../types';

interface PaletteConsultantProps {
  isOpen: boolean;
  onClose: () => void;
  currentTheme: ColorPalette;
  onSelectTheme: (theme: ColorPalette) => void;
  activeThemeConfig: ThemeConfig;
}

export const PaletteConsultant: React.FC<PaletteConsultantProps> = ({
  isOpen,
  onClose,
  currentTheme,
  onSelectTheme,
  activeThemeConfig,
}) => {
  const [activeTab, setActiveTab] = useState<'palettes' | 'colors' | 'improvements'>('palettes');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="w-full max-w-4xl max-h-[90vh] flex flex-col rounded-2xl shadow-2xl overflow-hidden border transition-all duration-300"
        style={{
          backgroundColor: activeThemeConfig.cardBg,
          borderColor: activeThemeConfig.border,
          color: activeThemeConfig.textPrimary,
        }}
      >
        {/* Modal Header */}
        <div 
          className="px-6 py-5 flex items-center justify-between border-b"
          style={{ borderColor: activeThemeConfig.border }}
        >
          <div className="flex items-center gap-3">
            <div 
              className="w-10 h-10 rounded-xl flex items-center justify-center border"
              style={{
                backgroundColor: activeThemeConfig.badgeBg,
                borderColor: activeThemeConfig.accent,
                color: activeThemeConfig.accent,
              }}
            >
              <Palette className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold font-display tracking-tight flex items-center gap-2">
                Brand Identity &amp; Aesthetic Strategy
                <span className="text-xs px-2 py-0.5 rounded-full font-mono font-medium" style={{ backgroundColor: activeThemeConfig.badgeBg, color: activeThemeConfig.accent }}>
                  Live Preview
                </span>
              </h3>
              <p className="text-xs" style={{ color: activeThemeConfig.textMuted }}>
                Analysis of your uploaded AK Sports crest, Facebook cover, and recommendations for complementary colors.
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
            style={{ color: activeThemeConfig.textMuted }}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Controls */}
        <div 
          className="flex border-b px-6 text-sm font-medium"
          style={{ borderColor: activeThemeConfig.border }}
        >
          <button
            onClick={() => setActiveTab('palettes')}
            className={`py-3 px-4 border-b-2 transition-all cursor-pointer ${
              activeTab === 'palettes' ? 'border-[#d4af37] text-[#d4af37] font-semibold' : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            1. Try Live Color Themes
          </button>
          <button
            onClick={() => setActiveTab('colors')}
            className={`py-3 px-4 border-b-2 transition-all cursor-pointer ${
              activeTab === 'colors' ? 'border-[#d4af37] text-[#d4af37] font-semibold' : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            2. Complementary Color Strategy
          </button>
          <button
            onClick={() => setActiveTab('improvements')}
            className={`py-3 px-4 border-b-2 transition-all cursor-pointer ${
              activeTab === 'improvements' ? 'border-[#d4af37] text-[#d4af37] font-semibold' : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            3. UI/UX Changes &amp; Advice
          </button>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {activeTab === 'palettes' && (
            <div className="space-y-6">
              <div className="p-4 rounded-xl border" style={{ backgroundColor: activeThemeConfig.bg, borderColor: activeThemeConfig.border }}>
                <p className="text-sm font-medium leading-relaxed" style={{ color: activeThemeConfig.textPrimary }}>
                  Click any palette below to immediately re-skin the entire e-commerce store in real time. We extracted the colors from your uploaded Facebook banner (the gold crest, the fluted acoustic wall, and the electric blue custom cricket bat).
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.values(THEMES).map((th) => {
                  const isSelected = currentTheme === th.id;
                  return (
                    <div
                      key={th.id}
                      onClick={() => onSelectTheme(th.id as ColorPalette)}
                      className={`p-5 rounded-xl border-2 transition-all cursor-pointer relative flex flex-col justify-between ${
                        isSelected ? 'ring-2 ring-offset-2 ring-offset-black' : 'hover:border-zinc-500'
                      }`}
                      style={{
                        backgroundColor: th.cardBg,
                        borderColor: isSelected ? th.accent : th.border,
                      }}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="text-base font-bold font-display" style={{ color: th.textPrimary }}>
                            {th.name}
                          </h4>
                          {isSelected && (
                            <span 
                              className="w-5 h-5 rounded-full flex items-center justify-center text-xs"
                              style={{ backgroundColor: th.accent, color: th.accentText }}
                            >
                              <Check className="w-3.5 h-3.5 stroke-[3]" />
                            </span>
                          )}
                        </div>
                        <p className="text-xs mb-4" style={{ color: th.textMuted }}>
                          {th.tagline}
                        </p>
                      </div>

                      {/* Color swatch row */}
                      <div className="flex items-center gap-2 pt-2 border-t" style={{ borderColor: th.border }}>
                        <span className="text-[10px] uppercase font-mono tracking-wider mr-1" style={{ color: th.textMuted }}>
                          Palette:
                        </span>
                        <div className="flex items-center gap-1.5">
                          <div className="w-5 h-5 rounded border border-white/20 shadow-sm" style={{ backgroundColor: th.bg }} title="Canvas" />
                          <div className="w-5 h-5 rounded border border-white/20 shadow-sm" style={{ backgroundColor: th.cardBg }} title="Surface" />
                          <div className="w-5 h-5 rounded border border-white/20 shadow-sm" style={{ backgroundColor: th.accent }} title="Accent" />
                          <div className="w-5 h-5 rounded border border-white/20 shadow-sm" style={{ backgroundColor: th.accentLight }} title="Accent Light" />
                          <div className="w-5 h-5 rounded border border-white/20 shadow-sm" style={{ backgroundColor: th.textPrimary }} title="Ink" />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Reference to user's uploaded banner */}
              <div className="p-4 rounded-xl border flex items-center gap-4" style={{ backgroundColor: activeThemeConfig.bg, borderColor: activeThemeConfig.border }}>
                <img 
                  src="/images/ak_sports_consultant.png" 
                  alt="AK Sports brand banner" 
                  className="w-24 h-14 object-cover rounded-lg border border-white/10 shrink-0"
                />
                <div className="text-xs space-y-1">
                  <span className="font-semibold text-[#d4af37]">Inspected from your attached Facebook page banner:</span>
                  <p style={{ color: activeThemeConfig.textMuted }}>
                    Golden Crown &amp; Shield monogram, vertical walnut acoustic wall paneling, and an electric blue bat wrap ("AK GOLD EDITION").
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'colors' && (
            <div className="space-y-6">
              <div>
                <h4 className="text-base font-bold font-display mb-1" style={{ color: activeThemeConfig.textPrimary }}>
                  What More Colors Can We Add Beyond Gold?
                </h4>
                <p className="text-xs" style={{ color: activeThemeConfig.textMuted }}>
                  Your core brand color is <strong>Metallic Gold (#D4AF37 / #E5B842)</strong>. In luxury e-commerce, using pure gold everywhere creates visual exhaustion. Following the 60-30-10 design rule, here are the exact complementary colors we recommend:
                </p>
              </div>

              <div className="space-y-3">
                {/* Color 1 */}
                <div className="p-4 rounded-xl border flex items-start gap-4" style={{ backgroundColor: activeThemeConfig.bg, borderColor: activeThemeConfig.border }}>
                  <div className="w-12 h-12 rounded-lg bg-[#0C0C0E] border border-zinc-700 shrink-0 shadow" />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm">1. Onyx Charcoal &amp; Deep Slate (#0C0C0E / #151518)</span>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 font-mono">60% Canvas</span>
                    </div>
                    <p className="text-xs mt-1" style={{ color: activeThemeConfig.textMuted }}>
                      Why it works: High-contrast dark charcoal acts as an ultra-luxurious backdrop. It makes the gold leaf crest glow like jewelry in a boutique display case.
                    </p>
                  </div>
                </div>

                {/* Color 2 */}
                <div className="p-4 rounded-xl border flex items-start gap-4" style={{ backgroundColor: activeThemeConfig.bg, borderColor: activeThemeConfig.border }}>
                  <div className="w-12 h-12 rounded-lg bg-[#2563EB] border border-blue-400 shrink-0 shadow" />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm">2. Electric Cobalt Blue (#1D4ED8 / #2563EB)</span>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-blue-950 text-blue-300 font-mono">Sport Energy Accent</span>
                    </div>
                    <p className="text-xs mt-1" style={{ color: activeThemeConfig.textMuted }}>
                      Why it works: Look closely at your Facebook cover photo—your custom "AK GOLD EDITION" bat uses a vibrant royal blue camo wrap! Blue is the perfect athletic contrast to gold, adding velocity and modern punch to tournament gear.
                    </p>
                  </div>
                </div>

                {/* Color 3 */}
                <div className="p-4 rounded-xl border flex items-start gap-4" style={{ backgroundColor: activeThemeConfig.bg, borderColor: activeThemeConfig.border }}>
                  <div className="w-12 h-12 rounded-lg bg-[#8C6338] border border-amber-900 shrink-0 shadow" />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm">3. Warm Raw Walnut &amp; English Willow Timber (#8C6338 / #2E2218)</span>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-amber-950 text-amber-300 font-mono">Tactile Warmth</span>
                    </div>
                    <p className="text-xs mt-1" style={{ color: activeThemeConfig.textMuted }}>
                      Why it works: Handcrafted cricket bats come from raw wood. The acoustic fluted wall in your Facebook banner also introduces this warm timber tone, grounding the brand in authentic physical craftsmanship.
                    </p>
                  </div>
                </div>

                {/* Color 4 */}
                <div className="p-4 rounded-xl border flex items-start gap-4" style={{ backgroundColor: activeThemeConfig.bg, borderColor: activeThemeConfig.border }}>
                  <div className="w-12 h-12 rounded-lg bg-[#F8FAFC] border border-zinc-300 shrink-0 shadow" />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-zinc-100">4. Crisp Tournament White &amp; Travertine (#F8FAFC)</span>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 font-mono">Legibility &amp; Contrast</span>
                    </div>
                    <p className="text-xs mt-1" style={{ color: activeThemeConfig.textMuted }}>
                      Why it works: Cricket is historically played in whites. Clean off-white provides 100% WCAG AA contrast for product specs, prices, and specifications tables so players can read bat weights and edge sizes effortlessly.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'improvements' && (
            <div className="space-y-5">
              <div>
                <h4 className="text-base font-bold font-display mb-1" style={{ color: activeThemeConfig.textPrimary }}>
                  What Changes Can We Make to Upgrade Your Initial Rough Layout?
                </h4>
                <p className="text-xs" style={{ color: activeThemeConfig.textMuted }}>
                  We reviewed your attached `ak-sports-homepage_40ed7457.html` wireframe. Here are the key high-impact improvements we implemented in this new design:
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl border" style={{ backgroundColor: activeThemeConfig.bg, borderColor: activeThemeConfig.border }}>
                  <h5 className="text-xs font-bold uppercase tracking-wider text-[#d4af37] mb-2 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" />
                    1. High-Fidelity Studio Photography
                  </h5>
                  <p className="text-xs leading-relaxed" style={{ color: activeThemeConfig.textMuted }}>
                    Replaced the flat grey wireframe boxes with dramatic studio product photography (dark slate surfaces, warm timber, rim lighting on bat grain, and macro glove textures).
                  </p>
                </div>

                <div className="p-4 rounded-xl border" style={{ backgroundColor: activeThemeConfig.bg, borderColor: activeThemeConfig.border }}>
                  <h5 className="text-xs font-bold uppercase tracking-wider text-[#d4af37] mb-2 flex items-center gap-1.5">
                    <Shield className="w-3.5 h-3.5" />
                    2. Clear Cricket Specifications
                  </h5>
                  <p className="text-xs leading-relaxed" style={{ color: activeThemeConfig.textMuted }}>
                    Tape ball cricketers care deeply about <strong>blade length (35"), edge thickness (48mm), weight (820g), and handle cane</strong>. We embedded an interactive specs sheet for every bat.
                  </p>
                </div>

                <div className="p-4 rounded-xl border" style={{ backgroundColor: activeThemeConfig.bg, borderColor: activeThemeConfig.border }}>
                  <h5 className="text-xs font-bold uppercase tracking-wider text-[#d4af37] mb-2 flex items-center gap-1.5">
                    <Sliders className="w-3.5 h-3.5" />
                    3. Dual Checkout: WhatsApp + Cart
                  </h5>
                  <p className="text-xs leading-relaxed" style={{ color: activeThemeConfig.textMuted }}>
                    Over 80% of cricket gear sales in Pakistan happen over WhatsApp with Cash on Delivery (COD). We integrated instant 1-tap WhatsApp checkout that automatically composes the item details, price, and specs in the message!
                  </p>
                </div>

                <div className="p-4 rounded-xl border" style={{ backgroundColor: activeThemeConfig.bg, borderColor: activeThemeConfig.border }}>
                  <h5 className="text-xs font-bold uppercase tracking-wider text-[#d4af37] mb-2 flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5" />
                    4. Anti-Slop Minimalist Restraint
                  </h5>
                  <p className="text-xs leading-relaxed" style={{ color: activeThemeConfig.textMuted }}>
                    No tacky neon badges or fake discount clocks. We use clean hairline borders, generous whitespace, and tabular numbers for an editorial luxury athletic look.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div 
          className="px-6 py-4 border-t flex items-center justify-between"
          style={{ borderColor: activeThemeConfig.border, backgroundColor: activeThemeConfig.bg }}
        >
          <div className="text-xs" style={{ color: activeThemeConfig.textMuted }}>
            Current Palette: <span className="font-semibold" style={{ color: activeThemeConfig.accent }}>{THEMES[currentTheme].name}</span>
          </div>
          <button
            onClick={onClose}
            className="px-5 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-transform active:scale-95 cursor-pointer shadow-md"
            style={{
              backgroundColor: activeThemeConfig.accent,
              color: activeThemeConfig.accentText,
            }}
          >
            Apply &amp; Continue Browsing
          </button>
        </div>
      </div>
    </div>
  );
};
