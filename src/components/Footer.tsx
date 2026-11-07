import React from 'react';
import { MessageCircle, ShieldCheck, Heart, ExternalLink } from 'lucide-react';
import { ThemeConfig } from '../types';
import { PageId } from './Header';

interface FooterProps {
  theme: ThemeConfig;
  onNavigate: (page: PageId) => void;
  onOpenLookup?: () => void;
}

export const Footer: React.FC<FooterProps> = ({ theme, onNavigate, onOpenLookup }) => {
  return (
    <footer 
      className="border-t pt-16 pb-12 transition-colors duration-300"
      style={{
        backgroundColor: theme.bg,
        borderColor: theme.border,
        color: theme.textPrimary,
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          
          {/* Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <button 
              onClick={() => onNavigate('home')}
              className="flex items-center gap-3 text-left cursor-pointer group"
            >
              <div 
                className="w-10 h-10 rounded-full flex items-center justify-center border shadow-xs overflow-hidden bg-black p-0.5"
                style={{
                  borderColor: 'rgba(184, 148, 40, 0.4)',
                }}
              >
                <img 
                  src="/images/ak_sports_logo_centered.png" 
                  alt="AK Sports Official Logo" 
                  className="w-full h-full object-contain object-center"
                />
              </div>
              <div>
                <span className="font-display font-extrabold text-lg tracking-wider uppercase block leading-none">
                  AK SPORTS
                </span>
                <span className="text-[10px] tracking-widest uppercase font-semibold text-[#b89428]">
                  ATHLETIC WEAR &amp; CRICKET
                </span>
              </div>
            </button>

            <p className="text-xs leading-relaxed max-w-sm" style={{ color: theme.textMuted }}>
              Engineered everyday athletic trousers, heavy-cotton training tees, active joggers, and championship handcrafted tape ball cricket gear from Sialkot.
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-3">
              <a
                href="https://wa.me/?text=Hi%20AK%20Sports%20Team"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white transition-colors"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                <span>WhatsApp Helpline</span>
              </a>

              <a
                href="https://www.facebook.com/share/1GwRXXcXXm/"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors hover:bg-black/5"
                style={{ borderColor: theme.border, color: theme.textPrimary }}
              >
                <span>Official Facebook Page</span>
                <ExternalLink className="w-3 h-3 text-[#b89428]" />
              </a>
            </div>
          </div>

          {/* Quick Links: Athletic Wear */}
          <div className="space-y-3">
            <h4 className="font-display font-bold text-xs uppercase tracking-wider" style={{ color: theme.accent }}>
              Athletic Wear
            </h4>
            <ul className="space-y-2 text-xs" style={{ color: theme.textMuted }}>
              <li>
                <button onClick={() => onNavigate('apparel')} className="hover:text-black transition-colors cursor-pointer text-left">
                  4-Way Stretch Trousers
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('apparel')} className="hover:text-black transition-colors cursor-pointer text-left">
                  Heavy-Cotton Training Tees
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('apparel')} className="hover:text-black transition-colors cursor-pointer text-left">
                  Dry-Fit Match Sets
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('apparel')} className="hover:text-black transition-colors cursor-pointer text-left">
                  Athletic Joggers &amp; Shorts
                </button>
              </li>
            </ul>
          </div>

          {/* Quick Links: Tape Ball Cricket */}
          <div className="space-y-3">
            <h4 className="font-display font-bold text-xs uppercase tracking-wider" style={{ color: theme.accent }}>
              Tape Ball Cricket
            </h4>
            <ul className="space-y-2 text-xs" style={{ color: theme.textMuted }}>
              <li>
                <button onClick={() => onNavigate('bats')} className="hover:text-black transition-colors cursor-pointer text-left">
                  Gold Edition 48mm Bats
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('bats')} className="hover:text-black transition-colors cursor-pointer text-left">
                  Carbon Shadow Limited Bats
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('bats')} className="hover:text-black transition-colors cursor-pointer text-left">
                  Tournament Match Balls (6-Pack)
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('gloves')} className="hover:text-black transition-colors cursor-pointer text-left">
                  Royal Pro Batting Gloves
                </button>
              </li>
            </ul>
          </div>

          {/* Order Terms & Workshop Location */}
          <div className="space-y-3">
            <h4 className="font-display font-bold text-xs uppercase tracking-wider" style={{ color: theme.accent }}>
              Workshop &amp; Delivery
            </h4>
            <div className="space-y-2 text-xs" style={{ color: theme.textMuted }}>
              <p>📍 Small Industrial Estate, Sialkot, Punjab, Pakistan</p>
              <p>🚚 2–4 Business Days Delivery across Pakistan via TCS &amp; Leopards</p>
              <p>💵 Cash On Delivery (COD) accepted nationwide</p>
            </div>
            {onOpenLookup && (
              <div className="pt-2">
                <button
                  onClick={onOpenLookup}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors hover:bg-black/5 cursor-pointer"
                  style={{ borderColor: theme.border, color: theme.textPrimary }}
                >
                  <span>Track Your Order</span>
                </button>
              </div>
            )}
          </div>

        </div>

        {/* Bottom Bar */}
        <div 
          className="pt-8 border-t flex flex-col sm:flex-row items-center justify-between gap-4 text-xs"
          style={{ borderColor: theme.border, color: theme.textMuted }}
        >
          <div>
            © {new Date().getFullYear()} AK Sports. Handcrafted in Sialkot, Pakistan.
          </div>

          <div className="flex items-center gap-4">
            <a href="https://www.facebook.com/share/1GwRXXcXXm/" target="_blank" rel="noreferrer" className="hover:text-black">
              Facebook
            </a>
            <span>·</span>
            <span>COD Delivery Terms</span>
            <span>·</span>
            <span>Replacement Guarantee</span>
            <span>·</span>
            <button 
              onClick={() => onNavigate('admin')}
              className="hover:text-black transition-colors underline underline-offset-2 cursor-pointer font-medium"
            >
              Admin Portal
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
