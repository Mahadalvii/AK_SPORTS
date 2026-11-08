import React, { useState } from 'react';
import { 
  Hammer, 
  Scale, 
  ShieldCheck, 
  MessageCircle, 
  Sparkles, 
  Trophy, 
  Award,
  ArrowRight,
  ExternalLink,
  Heart
} from 'lucide-react';
import { ThemeConfig } from '../types';
import { TRUST_PROMISES } from '../data/products';

interface BrandStoryProps {
  theme: ThemeConfig;
  onNavigateToCategory: (page: 'apparel' | 'bats') => void;
}

export const BrandStory: React.FC<BrandStoryProps> = ({ theme, onNavigateToCategory }) => {
  const [imageError, setImageError] = useState(false);
  const ownerFacebookUrl = "https://web.facebook.com/saad786007";

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
            
            {/* Left Column: Authentic CEO Workshop Photo */}
            <div className="lg:col-span-5 relative bg-[#0c0c0e] text-white flex flex-col justify-between overflow-hidden min-h-[380px] sm:min-h-[460px] lg:min-h-[560px]">
              
              {/* Photo Container */}
              <div className="absolute inset-0 z-0">
                {!imageError ? (
                  <img
                    src="/images/saad_ashraf_alvi.jpg"
                    alt="Saad Ashraf Alvi in Sialkot Workshop with Handcrafted AK Bats"
                    onError={() => setImageError(true)}
                    className="w-full h-full object-cover object-center transition-transform duration-700 hover:scale-[1.02]"
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

                {/* Subtle gradient scrim at top and bottom to keep text legible */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-black/60 pointer-events-none" />
              </div>

              {/* Top Badge Overlay */}
              <div className="relative z-10 p-4 sm:p-6 flex items-center justify-between">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/80 backdrop-blur-md border border-[#d4af37]/70 text-[10px] sm:text-xs font-semibold text-[#f3e08b] uppercase tracking-wider shadow-md">
                  <Award className="w-3.5 h-3.5 text-[#d4af37]" />
                  <span>Founder &amp; Player</span>
                </span>
                
                <a
                  href={ownerFacebookUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/80 hover:bg-black/95 text-[10px] sm:text-[11px] font-medium text-zinc-300 hover:text-white border border-white/15 transition-colors shadow-sm"
                  title="View Saad's public profile on Facebook"
                >
                  <span>@saad786007</span>
                  <ExternalLink className="w-3 h-3 text-[#d4af37]" />
                </a>
              </div>

              {/* Bottom Portrait Caption */}
              <div className="relative z-10 p-4 sm:p-6 space-y-1.5">
                <div className="flex items-center gap-1.5">
                  <Trophy className="w-3.5 h-3.5 text-[#d4af37]" />
                  <span className="text-[11px] font-mono uppercase tracking-wider text-[#d4af37] font-semibold">
                    Local Tape Ball Competitor
                  </span>
                </div>
                <h3 className="font-display text-2xl sm:text-3xl font-extrabold text-white leading-tight">
                  Saad Ashraf Alvi
                </h3>
                <p className="text-xs text-zinc-200 leading-relaxed max-w-sm font-light">
                  Founder of AK Sports · Sialkot Workshop
                </p>
              </div>

            </div>

            {/* Right Column: Emotional, Humanized Backstory & Quality Promise */}
            <div className="lg:col-span-7 p-6 sm:p-10 lg:p-12 flex flex-col justify-between space-y-6">
              
              <div className="space-y-5">
                {/* Section Kicker */}
                <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#b89428]">
                  <Heart className="w-3.5 h-3.5 fill-[#b89428]" />
                  <span>The Story Behind AK Sports</span>
                </div>

                {/* Emotional Story Headline */}
                <h2 className="font-display text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-zinc-900 leading-snug">
                  "I didn't start this brand to do business. I started it because cricket is my whole life."
                </h2>

                {/* Narrative: Natural, Humanized, Emotional */}
                <div className="space-y-4 text-xs sm:text-sm leading-relaxed text-zinc-600">
                  <p>
                    Ever since I was a young boy, every evening of my life was spent on local dusty pitches, running with a taped tennis ball in hand, dreaming of the perfect stroke. Cricket was never just a weekend hobby for me—it was my obsession, my sanctuary, and my identity.
                  </p>

                  <p>
                    As a competitive local player myself, I know the heartbreak every cricketer feels: buying an expensive bat with hard-earned money, only for it to feel dead in the hands, poorly balanced, or snap when you need it most. I knew tape ball players deserved something real—crafted with honesty, heart, and respect for their game.
                  </p>

                  <p>
                    That is why I created <strong>AK Sports</strong>. We personally import hand-selected raw cricket wood directly from Sri Lanka, and bring every single cleft into our workshop in Sialkot. There, we shave, balance, press, and refine each blade with 48mm+ massive edges and feather-light pickup—tailoring it to each player’s personal budget and stroke style, without any corporate middleman markups.
                  </p>
                </div>

                {/* Signature quote callout */}
                <div className="p-4 rounded-xl bg-[#faf8f4] border-l-3 border-[#d4af37] text-xs sm:text-sm text-zinc-800 italic leading-relaxed">
                  "When you hold an AK bat, remember: it was shaped by hands that love this game just as fiercely as you do. Every grain, every curve, and every ping is tested so you can walk out to the crease with pride."
                  <span className="block not-italic font-bold text-xs text-zinc-900 mt-2">
                    — Saad Ashraf Alvi
                  </span>
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
                  href={ownerFacebookUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full sm:w-auto px-5 py-3 rounded-xl text-xs font-bold uppercase tracking-wider border transition-all cursor-pointer flex items-center justify-center gap-2 hover:bg-black/5 shadow-xs text-zinc-800"
                  style={{
                    borderColor: theme.border,
                  }}
                >
                  <span>A Peek into Saad's Life (Facebook)</span>
                  <ExternalLink className="w-3.5 h-3.5 text-[#b89428]" />
                </a>

                <a
                  href="https://wa.me/923082073415?text=Salam%20Saad%20Bhai!%20I%20want%20to%20discuss%20a%20custom%20handcrafted%20bat%20from%20AK%20Sports"
                  target="_blank"
                  rel="noreferrer"
                  className="w-full sm:w-auto px-5 py-3 rounded-xl text-xs font-bold uppercase tracking-wider bg-emerald-600 hover:bg-emerald-500 text-white transition-all cursor-pointer flex items-center justify-center gap-2 shadow-xs text-center"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>WhatsApp Saad</span>
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
