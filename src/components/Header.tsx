import React from 'react';
import { ShoppingCart, MessageCircle, ShieldCheck, Search } from 'lucide-react';
import { ThemeConfig } from '../types';

export type PageId = 'home' | 'apparel' | 'bats' | 'gloves' | 'accessories' | 'cart' | 'admin';

interface HeaderProps {
  currentPage: PageId;
  onNavigate: (page: PageId) => void;
  cartCount: number;
  onOpenCart: () => void;
  onOpenLookup?: () => void;
  theme: ThemeConfig;
}

export const Header: React.FC<HeaderProps> = ({
  currentPage,
  onNavigate,
  cartCount,
  onOpenCart,
  onOpenLookup,
  theme,
}) => {
  const navLinks: { id: PageId; label: string }[] = [
    { id: 'home', label: 'Home' },
    { id: 'apparel', label: 'Athletic Wear' },
    { id: 'bats', label: 'Tape Ball Cricket' },
    { id: 'gloves', label: 'Gloves & Kit' },
    { id: 'accessories', label: 'Accessories' },
  ];

  return (
    <header 
      className="sticky top-0 z-40 w-full backdrop-blur-md transition-colors duration-300" 
      style={{
        backgroundColor: 'rgba(248, 247, 244, 0.96)',
        borderBottom: `1px solid ${theme.border}`,
      }}
    >
      {/* Top Announcement Bar */}
      <div 
        className="w-full py-1.5 px-4 text-xs font-medium tracking-wide flex items-center justify-between"
        style={{
          backgroundColor: '#f1eee7',
          borderBottom: `1px solid ${theme.border}`,
          color: theme.textMuted,
        }}
      >
        <div className="max-w-7xl mx-auto w-full flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-3.5 h-3.5" style={{ color: theme.accent }} />
            <span>Free nationwide delivery over Rs. 3,000 · Cash on Delivery across Pakistan</span>
          </div>
          <div className="hidden sm:flex items-center gap-4 text-[11px]">
            <a
              href="https://www.facebook.com/share/1GwRXXcXXm/"
              target="_blank"
              rel="noreferrer"
              className="hover:text-black transition-colors"
            >
              Official Facebook: AK Sports (1.9K Followers)
            </a>
            <span>·</span>
            <a
              href="https://wa.me/?text=Hi%20AK%20Sports%2C%20I%20have%20an%20inquiry%20regarding%20orders"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1 text-emerald-700 hover:text-emerald-800 transition-colors font-semibold"
            >
              <MessageCircle className="w-3 h-3" />
              <span>WhatsApp Helpline</span>
            </a>
          </div>
        </div>
      </div>

      {/* Main Navigation: 3-Zone Top Bar Contract */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between gap-8">
        
        {/* Zone 1: Brand Wordmark & Official Logo */}
        <button 
          onClick={() => onNavigate('home')} 
          className="flex items-center gap-3 shrink-0 group py-1 text-left cursor-pointer"
          style={{ color: theme.textPrimary }}
        >
          {/* Official AK Sports Logo Image */}
          <div 
            className="w-11 h-11 rounded-full flex items-center justify-center relative overflow-hidden border-2 shadow-sm transition-transform duration-300 group-hover:scale-105 bg-black shrink-0"
            style={{
              borderColor: '#d4af37',
            }}
          >
            <img 
              src="/images/ak_sports_logo.jpg" 
              alt="AK Sports Official Logo" 
              className="w-full h-full object-cover object-center scale-135"
            />
          </div>

          <div className="flex flex-col">
            <span className="font-display font-extrabold text-xl tracking-wider uppercase leading-none" style={{ color: theme.textPrimary }}>
              AK SPORTS
            </span>
            <span className="text-[10px] tracking-[0.2em] uppercase font-medium mt-0.5" style={{ color: theme.accent }}>
              ATHLETIC WEAR &amp; CRICKET
            </span>
          </div>
        </button>

        {/* Zone 2: Dedicated Page Navigation Links */}
        <nav className="hidden md:flex items-center gap-7 text-sm font-medium">
          {navLinks.map((link) => {
            const isActive = currentPage === link.id;
            return (
              <button
                key={link.id}
                onClick={() => onNavigate(link.id)}
                className="whitespace-nowrap shrink-0 transition-colors py-2 relative text-sm cursor-pointer"
                style={{
                  color: isActive ? theme.textPrimary : theme.textMuted,
                  fontWeight: isActive ? 700 : 500,
                }}
              >
                {link.label}
                {isActive && (
                  <span 
                    className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full"
                    style={{ backgroundColor: theme.accent }}
                  />
                )}
              </button>
            );
          })}
        </nav>

        {/* Zone 3: Primary Actions (Track Order + Shopping Cart) */}
        <div className="flex items-center gap-2.5 shrink-0">
          {onOpenLookup && (
            <button
              onClick={onOpenLookup}
              aria-label="Track Order"
              className="p-2 px-3 rounded-lg border text-xs font-semibold transition-all duration-200 cursor-pointer flex items-center gap-1.5 hover:bg-black/5"
              style={{
                backgroundColor: theme.cardBg,
                borderColor: theme.border,
                color: theme.textPrimary,
              }}
            >
              <Search className="w-3.5 h-3.5" style={{ color: theme.accent }} />
              <span className="hidden sm:inline">Track Order</span>
            </button>
          )}

          <button
            onClick={() => onNavigate('cart')}
            aria-label="Open Shopping Cart"
            className="relative p-2 px-3.5 rounded-lg border transition-all duration-200 cursor-pointer flex items-center gap-2 hover:bg-black/5"
            style={{
              backgroundColor: currentPage === 'cart' ? theme.badgeBg : theme.cardBg,
              borderColor: currentPage === 'cart' ? theme.accent : theme.border,
              color: theme.textPrimary,
            }}
          >
            <ShoppingCart className="w-4 h-4" style={{ color: theme.accent }} />
            <span className="text-xs font-semibold tracking-tight tabular-nums">
              Cart ({cartCount})
            </span>
          </button>
        </div>

      </div>
    </header>
  );
};
