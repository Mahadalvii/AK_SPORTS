import React, { useState } from 'react';
import { 
  Hammer, 
  Scale, 
  ShieldCheck, 
  MessageCircle, 
  Sparkles, 
  Trophy, 
  CheckCircle2, 
  Award,
  ArrowRight
} from 'lucide-react';
import { ThemeConfig } from '../types';
import { TRUST_PROMISES } from '../data/products';

interface BrandStoryProps {
  theme: ThemeConfig;
  onNavigateToCategory: (page: 'apparel' | 'bats') => void;
}

export const BrandStory: React.FC<BrandStoryProps> = ({ theme, onNavigateToCategory }) => {
  const [imageError, setImageError] = useState(false);

  return (
    <section className="py-10 sm:py-16 md:py-24 border-b" style={{ borderColor: theme.border }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12 sm:space-y-16">
        
        {/* CEO & Founder Story Showcase Card */}
        <div 
          className="rounded-2xl sm:rounded-3xl border overflow-hidden shadow-lg transition-all"
          style={{
            borderColor: theme.border,
            backgroundColor: theme.cardBg,
          }}
        >
          <div className="grid grid-cols-1 lg:grid-cols-12 items-stretch">
            
            {/* Left Column: CEO Portrait Stage */}
            <div className="lg:col-span-5 relative bg-gradient-to-b from-[#18181b] to-black text-white flex flex-col justify-between overflow-hidden min-h-[380px] lg:min-h-[520px]">
              
              {/* Image Container with Fallback */}
              <div className="absolute inset-0 z-0">
                {!imageError ? (
                  <img
                    src="/images/saad_ashraf_alvi.jpg"
                    alt="Saad Ashraf Alvi — Founder & CEO of AK Sports"
                    onError={() => setImageError(true)}
                    className="w-full h-full object-cover object-top opacity-90 transition-transform duration-700 hover:scale-105"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center p-8 text-center bg-radial from-zinc-900 to-black">
                    <div className="w-24 h-24 rounded-full border-2 border-[#d4af37] bg-black p-1 shadow-xl mb-4 flex items-center justify-center">
                      <img 
                        src="/images/ak_sports_logo_centered.png" 
                        alt="AK Sports Crest" 
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <span className="font-display font-extrabold text-xl text-white block">
                      Saad Ashraf Alvi
                    </span>
                    <span className="text-xs text-[#d4af37] font-mono uppercase tracking-widest mt-1 block">
                      Founder &amp; CEO · AK Sports
                    </span>
                  </div>
                )}

                {/* Subtle gradient scrim */}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
              </div>

              {/* Top Badge */}
              <div className="relative z-10 p-5 sm:p-6 flex items-center justify-between">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/75 backdrop-blur-md border border-[#d4af37]/60 text-[10px] sm:text-xs font-semibold text-[#f3e08b] uppercase tracking-wider shadow-md">
                  <Award className="w-3.5 h-3.5 text-[#d4af37]" />
                  <span>Founder &amp; CEO</span>
                </span>
                <span className="text-[10px] font-mono text-zinc-300 bg-black/60 px-2 py-0.5 rounded border border-white/10">
                  Est. Sialkot
                </span>
              </div>

              {/* Bottom Portrait Caption */}
              <div className="relative z-10 p-5 sm:p-6 space-y-2">
                <div className="flex items-center gap-2">
                  <Trophy className="w-4 h-4 text-[#d4af37]" />
                  <span className="text-xs font-mono uppercase tracking-wider text-[#d4af37]">
                    Professional Tape Ball Player
                  </span>
                </div>
                <h3 className="font-display text-2xl sm:text-3xl font-extrabold text-white leading-tight">
                  Saad Ashraf Alvi
                </h3>
                <p className="text-xs text-zinc-300 leading-relaxed max-w-sm">
                  "Cricket has always been my life. Building AK Sports is how I share that passion with every player who steps onto the pitch."
                </p>
              </div>

            </div>

            {/* Right Column: Backstory, Vision, Srilankan Willow & Quality */}
            <div className="lg:col-span-7 p-6 sm:p-10 lg:p-12 flex flex-col justify-between space-y-6">
              
              <div className="space-y-5">
                {/* Section Kicker */}
                <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#b89428]">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>The Founder's Vision &amp; Craftsmanship</span>
                </div>

                {/* Story Headline */}
                <h2 className="font-display text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-zinc-900 leading-tight">
                  Born from the pitch. Built for players who demand the best.
                </h2>

                {/* Narrative Paragraph 1: Player Background */}
                <p className="text-xs sm:text-sm leading-relaxed text-zinc-600">
                  As a competitive and well-known local tape ball player, <strong>Saad Ashraf Alvi</strong> lived and breathed cricket from inside the boundary ropes. For him, cricket was never just a hobby—it was a life calling. He always dreamed of dedicating his life to the sport, and <strong>AK Sports</strong> is the realization of that lifelong commitment.
                </p>

                {/* Narrative Paragraph 2: Sri Lankan Wood & Sialkot Workshop Refinement */}
                <p className="text-xs sm:text-sm leading-relaxed text-zinc-600">
                  To ensure world-class performance, <strong>we directly import select raw cricket wood from Sri Lanka</strong>. Every single cleft is then transported to our dedicated workshop in <strong>Sialkot</strong>, where our master artisans season, plane, contour, and balance each blade to match our customers' exact playing style, stroke profile, and weight preferences—all delivered within an honest, effective budget.
                </p>

                {/* Quality Highlights Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
                  <div className="p-3.5 rounded-xl border bg-[#fcfbf9] flex items-start gap-3" style={{ borderColor: theme.border }}>
                    <div className="w-6 h-6 rounded-full flex items-center justify-center shrink-0 border border-[#b89428] text-[#b89428] font-bold text-xs">
                      ✓
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-zinc-900">Direct Sri Lankan Wood Import</h4>
                      <p className="text-[11px] text-zinc-500 mt-0.5">
                        Selected raw clefts cured and hand-refined in Sialkot for supreme ping and explosive rebound.
                      </p>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl border bg-[#fcfbf9] flex items-start gap-3" style={{ borderColor: theme.border }}>
                    <div className="w-6 h-6 rounded-full flex items-center justify-center shrink-0 border border-[#b89428] text-[#b89428] font-bold text-xs">
                      ✓
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-zinc-900">Tailored Within Player Budgets</h4>
                      <p className="text-[11px] text-zinc-500 mt-0.5">
                        Custom blade profiling, 48mm+ massive edges, and feather-light pickup without retail middleman markup.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t flex flex-col sm:flex-row items-stretch sm:items-center gap-3" style={{ borderColor: theme.border }}>
                <button
                  onClick={() => onNavigateToCategory('bats')}
                  className="w-full sm:w-auto px-6 py-3 rounded-xl text-xs font-bold uppercase tracking-wider text-white transition-all cursor-pointer shadow-md hover:opacity-90 active:scale-95 flex items-center justify-center gap-2"
                  style={{
                    backgroundColor: theme.accent,
                  }}
                >
                  <span>Explore Handcrafted Bats</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <a
                  href="https://wa.me/923082073415?text=Salam%20Saad%20Bhai!%20I%20want%20to%20discuss%20a%20custom%20handcrafted%20bat%20from%20AK%20Sports"
                  target="_blank"
                  rel="noreferrer"
                  className="w-full sm:w-auto px-6 py-3 rounded-xl text-xs font-bold uppercase tracking-wider border transition-all cursor-pointer flex items-center justify-center gap-2 hover:bg-black/5 shadow-xs text-zinc-800"
                  style={{
                    borderColor: theme.border,
                  }}
                >
                  <MessageCircle className="w-4 h-4 text-emerald-600" />
                  <span>Talk with Saad on WhatsApp</span>
                </a>
              </div>

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
              The AK Sports Quality Guarantee
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
