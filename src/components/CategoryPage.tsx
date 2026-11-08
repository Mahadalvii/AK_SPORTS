import React, { useState, useMemo } from 'react';
import { Product, ThemeConfig } from '../types';
import { ProductCard } from './ProductCard';
import { PageId } from './Header';
import { ArrowLeft, Search, Filter, ShieldCheck, Sparkles, ChevronRight } from 'lucide-react';

interface CategoryPageProps {
  pageId: PageId;
  products: Product[];
  onOpenProduct: (product: Product) => void;
  onAddToCart: (product: Product) => void;
  onNavigate: (page: PageId) => void;
  theme: ThemeConfig;
}

export const CategoryPage: React.FC<CategoryPageProps> = ({
  pageId,
  products,
  onOpenProduct,
  onAddToCart,
  onNavigate,
  theme,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'featured' | 'price-asc' | 'price-desc' | 'rating'>('featured');

  const meta = useMemo(() => {
    switch (pageId) {
      case 'apparel':
        return {
          title: 'Athletic Wear Collection',
          subtitle: 'Engineered everyday performance trousers, combed heavy-cotton tees, and training sets.',
          category: 'apparel',
          badge: 'Daily Training & Gym Life',
          description: 'Tested 4-way stretch flex joggers and 280 GSM luxury combed cotton drop-shoulder shirts built for gym agility, running, travel, and casual movement.',
        };
      case 'bats':
        return {
          title: 'Tape Ball Cricket Division',
          subtitle: 'Handcrafted English willow bats with 48mm+ massive edges and tournament balls.',
          category: 'bats',
          badge: 'Handcrafted Player Division',
          description: 'Custom blade profiles carved for maximum pickup balance, explosive sweet spots, and high rebound ping against tournament tape balls.',
        };
      case 'gloves':
        return {
          title: 'Gloves & Protective Gear',
          subtitle: 'Split-finger high-density EVA batting gloves and impact protection.',
          category: 'gloves',
          badge: 'Player Protection',
          description: 'Perforated sheepskin leather palms offering soft touch, sweat absorption, and reinforced finger protection against raw pace.',
        };
      case 'accessories':
        return {
          title: 'Accessories & Upgrades',
          subtitle: 'Chevron matrix bat grips, protective covers, and gear maintenance.',
          category: 'accessories',
          badge: 'Maintenance & Upgrades',
          description: 'Non-slip shock-absorbing grips and accessories to keep your equipment match-ready.',
        };
      default:
        return {
          title: 'AK Sports Catalog',
          subtitle: 'Everyday athletic wear and championship cricket gear.',
          category: 'all',
          badge: 'All Products',
          description: 'Explore the full range of handcrafted gear and modern apparel.',
        };
    }
  }, [pageId]);

  const pageProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesCategory = pageId === 'bats' 
        ? (p.category === 'bats' || p.category === 'balls')
        : p.category === meta.category;

      const matchesSearch =
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesCategory && matchesSearch;
    }).sort((a, b) => {
      if (sortBy === 'price-asc') return a.price - b.price;
      if (sortBy === 'price-desc') return b.price - a.price;
      if (sortBy === 'rating') return (b.rating || 0) - (a.rating || 0);
      return 0;
    });
  }, [products, pageId, meta.category, searchQuery, sortBy]);

  return (
    <div className="py-4 sm:py-8 space-y-6 sm:space-y-8 animate-in fade-in duration-200">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 space-y-6 sm:space-y-8">
        
        {/* Breadcrumb Navigation */}
        <div className="flex items-center gap-1.5 sm:gap-2 text-[11px] sm:text-xs" style={{ color: theme.textMuted }}>
          <button 
            onClick={() => onNavigate('home')}
            className="hover:text-black transition-colors flex items-center gap-1 cursor-pointer font-medium"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Home</span>
          </button>
          <ChevronRight className="w-3 h-3 text-zinc-400" />
          <span className="font-semibold text-zinc-900 truncate max-w-[200px]">{meta.title}</span>
        </div>

        {/* Dedicated Page Banner */}
        <div 
          className="rounded-2xl sm:rounded-3xl border p-4 sm:p-8 md:p-12 shadow-xs relative overflow-hidden"
          style={{
            backgroundColor: theme.cardBg,
            borderColor: theme.border,
          }}
        >
          {/* Subtle gold gradient accent on right */}
          <div 
            className="absolute -right-20 -top-20 w-80 h-80 rounded-full blur-3xl opacity-20 pointer-events-none"
            style={{ backgroundColor: theme.accent }}
          />

          <div className="max-w-3xl space-y-2.5 sm:space-y-4 relative z-10">
            <div className="inline-flex items-center gap-1.5 text-[10px] sm:text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full border" style={{ borderColor: theme.border, backgroundColor: theme.bg, color: theme.accent }}>
              <Sparkles className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
              <span>{meta.badge}</span>
            </div>

            <h1 className="font-display text-2xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-zinc-900 leading-tight">
              {meta.title}
            </h1>

            <p className="text-xs sm:text-base leading-relaxed text-zinc-600">
              {meta.subtitle}
            </p>

            <p className="text-[11px] sm:text-xs text-zinc-500 pt-1 leading-relaxed border-t" style={{ borderColor: theme.border }}>
              {meta.description}
            </p>
          </div>
        </div>

        {/* Filter and Sort Toolbar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-1 pb-3 sm:pb-4 border-b" style={{ borderColor: theme.border }}>
          
          <div className="flex items-center justify-between sm:justify-start gap-2">
            <span className="text-xs font-semibold text-zinc-900">
              Showing {pageProducts.length} Products
            </span>
            <span className="text-[11px] sm:text-xs text-emerald-700 font-medium">· Cash on Delivery</span>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {/* Search Input */}
            <div className="relative flex-1 sm:w-60">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
              <input
                type="text"
                placeholder={`Search ${meta.title.toLowerCase()}...`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border outline-none transition-colors"
                style={{
                  backgroundColor: theme.cardBg,
                  borderColor: theme.border,
                  color: theme.textPrimary,
                }}
              />
            </div>

            {/* Sort Dropdown */}
            <div className="relative shrink-0">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-2.5 py-1.5 text-xs rounded-lg border outline-none cursor-pointer pr-6 appearance-none font-medium"
                style={{
                  backgroundColor: theme.cardBg,
                  borderColor: theme.border,
                  color: theme.textPrimary,
                }}
              >
                <option value="featured">Featured</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="rating">Top Rated</option>
              </select>
            </div>
          </div>

        </div>

        {/* Product Grid: 2 Columns on Mobile, 3 Columns on Tablet/Desktop */}
        {pageProducts.length === 0 ? (
          <div className="py-16 text-center space-y-3 rounded-2xl border" style={{ borderColor: theme.border, backgroundColor: theme.cardBg }}>
            <p className="text-base font-semibold text-zinc-900">No products found matching "{searchQuery}"</p>
            <p className="text-xs text-zinc-500">Try searching with a different term.</p>
            <button
              onClick={() => setSearchQuery('')}
              className="px-4 py-2 text-xs font-semibold rounded-lg border cursor-pointer hover:bg-black/5"
              style={{ borderColor: theme.border, color: theme.accent }}
            >
              Clear Search
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
            {pageProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onOpenProduct={onOpenProduct}
                onAddToCart={onAddToCart}
                theme={theme}
              />
            ))}
          </div>
        )}

        {/* Delivery Reassurance Bar on Category Page */}
        <div 
          className="p-3.5 sm:p-5 rounded-2xl border flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4 text-xs"
          style={{
            backgroundColor: theme.cardBg,
            borderColor: theme.border,
          }}
        >
          <div className="flex items-center gap-3 text-center sm:text-left">
            <ShieldCheck className="w-5 h-5 text-[#b89428] shrink-0" />
            <div>
              <span className="font-bold text-zinc-900 block text-xs sm:text-sm">Nationwide Cash on Delivery (COD)</span>
              <span className="text-[11px] sm:text-xs text-zinc-500">Free delivery on all orders over Rs. 3,000 across Pakistan.</span>
            </div>
          </div>
          <a
            href="https://wa.me/923082073415?text=Hi%20AK%20Sports%2C%20I%20have%20questions%20about%20your%20products"
            target="_blank"
            rel="noreferrer"
            className="w-full sm:w-auto px-4 py-2.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white transition-colors cursor-pointer shrink-0 text-center"
          >
            Ask Questions on WhatsApp
          </a>
        </div>

      </div>
    </div>
  );
};
