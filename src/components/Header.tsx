import React, { useState } from 'react';
import { 
  ShoppingCart, 
  MessageCircle, 
  ShieldCheck, 
  Search, 
  Menu, 
  X, 
  Home, 
  Shirt, 
  Trophy, 
  Shield, 
  Package, 
  ExternalLink,
  ChevronRight
} from 'lucide-react';
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks: { id: PageId; label: string; icon: React.ReactNode }[] = [
    { id: 'home', label: 'Home', icon: <Home className="w-4 h-4" /> },
    { id: 'apparel', label: 'Athletic Wear', icon: <Shirt className="w-4 h-4" /> },
    { id: 'bats', label: 'Tape Ball Cricket', icon: <Trophy className="w-4 h-4" /> },
    { id: 'gloves', label: 'Gloves & Kit', icon: <Shield className="w-4 h-4" /> },
    { id: 'accessories', label: 'Accessories', icon: <Package className="w-4 h-4" /> },
  ];

  const handleMobileNav = (page: PageId) => {
    onNavigate(page);
    setMobileMenuOpen(false);
  };

  return (
    <header 
      className="sticky top-0 z-40 w-full backdrop-blur-md transition-colors duration-300 shadow-2xs" 
      style={{
        backgroundColor: 'rgba(248, 247, 244, 0.98)',
        borderBottom: `1px solid ${theme.border}`,
      }}
    >
      {/* Top Announcement Bar */}
      <div 
        className="w-full py-1 sm:py-1.5 px-3 sm:px-4 text-[11px] sm:text-xs font-medium tracking-wide flex items-center justify-between"
        style={{
          backgroundColor: '#f1eee7',
          borderBottom: `1px solid ${theme.border}`,
          color: theme.textMuted,
        }}
      >
        <div className="max-w-7xl mx-auto w-full flex items-center justify-between">
          <div className="flex items-center gap-1.5 sm:gap-2 mx-auto sm:mx-0 text-center">
            <ShieldCheck className="w-3.5 h-3.5 shrink-0" style={{ color: theme.accent }} />
            <span className="truncate">
              Free delivery over Rs. 3,000 · Cash on Delivery nationwide
            </span>
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
              href="https://wa.me/923082073415?text=Hi%20AK%20Sports%2C%20I%20have%20an%20inquiry%20regarding%20orders"
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

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-15 sm:h-18 flex items-center justify-between gap-2 sm:gap-8">
        
        {/* Left: Mobile Hamburger Toggle + Brand Logo */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Mobile Hamburger Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle navigation menu"
            className="md:hidden p-2 rounded-lg text-zinc-700 hover:text-black hover:bg-black/5 transition-colors cursor-pointer"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          {/* Brand Wordmark & Official Centered Crest */}
          <button 
            onClick={() => handleMobileNav('home')} 
            className="flex items-center gap-2 sm:gap-3 shrink-0 group py-1 text-left cursor-pointer"
            style={{ color: theme.textPrimary }}
          >
            <div 
              className="w-9 h-9 sm:w-11 sm:h-11 rounded-full flex items-center justify-center relative overflow-hidden border-2 shadow-sm transition-transform duration-300 group-hover:scale-105 bg-black shrink-0 p-0.5"
              style={{
                borderColor: '#d4af37',
              }}
            >
              <img 
                src="/images/ak_sports_logo_centered.png" 
                alt="AK Sports Official Logo" 
                className="w-full h-full object-contain object-center"
              />
            </div>

            <div className="flex flex-col">
              <span className="font-display font-extrabold text-base sm:text-xl tracking-wider uppercase leading-none" style={{ color: theme.textPrimary }}>
                AK SPORTS
              </span>
              <span className="text-[8px] sm:text-[10px] tracking-[0.16em] uppercase font-semibold mt-0.5" style={{ color: theme.accent }}>
                ATHLETIC WEAR &amp; CRICKET
              </span>
            </div>
          </button>
        </div>

        {/* Center: Desktop Navigation Links */}
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

        {/* Right: Actions (Track Order + Cart) */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
          {onOpenLookup && (
            <button
              onClick={onOpenLookup}
              aria-label="Track Order"
              className="p-2 sm:px-3 rounded-lg border text-xs font-semibold transition-all duration-200 cursor-pointer flex items-center gap-1.5 hover:bg-black/5"
              style={{
                backgroundColor: theme.cardBg,
                borderColor: theme.border,
                color: theme.textPrimary,
              }}
            >
              <Search className="w-3.5 h-3.5" style={{ color: theme.accent }} />
              <span className="hidden sm:inline">Track</span>
            </button>
          )}

          <button
            onClick={() => onNavigate('cart')}
            aria-label="Open Shopping Cart"
            className="relative p-2 sm:px-3.5 rounded-lg border transition-all duration-200 cursor-pointer flex items-center gap-1.5 sm:gap-2 hover:bg-black/5"
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

      {/* Horizontal Category Pill Scrollbar (Mobile View) */}
      <div 
        className="md:hidden w-full overflow-x-auto no-scrollbar border-t py-2 px-3 flex items-center gap-2"
        style={{
          borderColor: theme.border,
          backgroundColor: '#faf8f5',
        }}
      >
        {navLinks.map((link) => {
          const isActive = currentPage === link.id;
          return (
            <button
              key={link.id}
              onClick={() => onNavigate(link.id)}
              className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                isActive 
                  ? 'bg-[#d4af37] text-zinc-950 shadow-xs' 
                  : 'bg-white border text-zinc-700 hover:text-black'
              }`}
              style={{
                borderColor: isActive ? '#d4af37' : theme.border,
              }}
            >
              {link.label}
            </button>
          );
        })}
      </div>

      {/* Mobile Slide-Out Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex animate-in fade-in duration-200">
          <div 
            className="w-4/5 max-w-sm h-full flex flex-col justify-between p-5 shadow-2xl animate-in slide-in-from-left duration-300"
            style={{ backgroundColor: theme.cardBg }}
          >
            <div className="space-y-6">
              {/* Drawer Header */}
              <div className="flex items-center justify-between pb-4 border-b" style={{ borderColor: theme.border }}>
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-black border border-[#d4af37] p-0.5 overflow-hidden">
                    <img 
                      src="/images/ak_sports_logo_centered.png" 
                      alt="AK Sports Crest" 
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div>
                    <span className="font-display font-extrabold text-sm uppercase block">
                      AK SPORTS
                    </span>
                    <span className="text-[9px] uppercase font-semibold text-[#b89428] block">
                      Sialkot Craft &amp; Apparel
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1.5 rounded-lg text-zinc-500 hover:text-black hover:bg-black/5"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Navigation Links List */}
              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 px-3 block mb-1">
                  Catalog Categories
                </span>
                {navLinks.map((link) => {
                  const isActive = currentPage === link.id;
                  return (
                    <button
                      key={link.id}
                      onClick={() => handleMobileNav(link.id)}
                      className={`w-full p-3 rounded-xl text-xs font-semibold flex items-center justify-between transition-colors text-left ${
                        isActive
                          ? 'bg-[#d4af37]/15 text-[#b89428] font-bold'
                          : 'text-zinc-800 hover:bg-black/5'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span style={{ color: isActive ? theme.accent : theme.textMuted }}>
                          {link.icon}
                        </span>
                        <span>{link.label}</span>
                      </div>
                      <ChevronRight className="w-4 h-4 text-zinc-400" />
                    </button>
                  );
                })}
              </div>

              {/* Quick Actions */}
              <div className="space-y-2 pt-2 border-t" style={{ borderColor: theme.border }}>
                <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 px-3 block mb-1">
                  Customer Care
                </span>
                {onOpenLookup && (
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      onOpenLookup();
                    }}
                    className="w-full p-3 rounded-xl text-xs font-semibold flex items-center gap-3 text-zinc-800 hover:bg-black/5 text-left"
                  >
                    <Search className="w-4 h-4 text-[#b89428]" />
                    <span>Track Your Order</span>
                  </button>
                )}

                <a
                  href="https://wa.me/923082073415?text=Hi%20AK%20Sports%2C%20I%20have%20an%20inquiry%20regarding%20orders"
                  target="_blank"
                  rel="noreferrer"
                  className="w-full p-3 rounded-xl text-xs font-semibold flex items-center gap-3 text-emerald-700 bg-emerald-50 hover:bg-emerald-100 transition-colors"
                >
                  <MessageCircle className="w-4 h-4 text-emerald-600" />
                  <span>WhatsApp Helpline (+92 308 2073415)</span>
                </a>

                <a
                  href="https://www.facebook.com/share/1GwRXXcXXm/"
                  target="_blank"
                  rel="noreferrer"
                  className="w-full p-3 rounded-xl text-xs font-semibold flex items-center justify-between text-zinc-700 hover:bg-black/5"
                >
                  <div className="flex items-center gap-3">
                    <ExternalLink className="w-4 h-4 text-[#b89428]" />
                    <span>Official Facebook Page (1.9K)</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-zinc-400" />
                </a>
              </div>
            </div>

            {/* Drawer Footer */}
            <div className="pt-4 border-t text-[11px] text-zinc-500 space-y-1" style={{ borderColor: theme.border }}>
              <p className="font-medium text-zinc-800">AK Sports Sialkot Workshop</p>
              <p>Cash on Delivery across Pakistan</p>
            </div>
          </div>

          {/* Backdrop closer */}
          <div 
            className="flex-1 h-full cursor-pointer"
            onClick={() => setMobileMenuOpen(false)}
          />
        </div>
      )}
    </header>
  );
};
