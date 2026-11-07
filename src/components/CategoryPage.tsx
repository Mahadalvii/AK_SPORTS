import React, { useState, useMemo } from 'react';
import { ProductCard } from './ProductCard';
import { Product, ThemeConfig } from '../types';
import { PageId } from './Header';
import { ChevronRight, Search, SlidersHorizontal, ArrowLeft, ShieldCheck, Sparkles, Filter } from 'lucide-react';

interface CategoryPageProps {
  pageId: PageId;
  products: Product[];
  onNavigate: (page: PageId) => void;
  onOpenProduct: (product: Product) => void;
  onAddToCart: (product: Product) => void;
  theme: ThemeConfig;
}

const PAGE_METADATA: Record<string, {
  title: string;
  category: Product['category'] | 'all';
  subtitle: string;
  badge: string;
  description: string;
}> = {
  apparel: {
    title: 'Athletic Wear Collection',
    category: 'apparel',
    badge: 'Everyday Performance & Streetwear',
    subtitle: 'Engineered 4-way stretch athletic trousers, drop-shoulder 280 GSM heavy combed cotton tees, and moisture-wicking match sets.',
    description: 'Designed for daily gym training, outdoor running, and streetwear comfort. Built with reinforced stitching, deep secure zippered pockets, and pre-shrunk premium fabrics direct from Sialkot textile mills.',
  },
  bats: {
    title: 'Tape Ball Cricket Division',
    category: 'bats',
    badge: 'Handcrafted in Sialkot · 2026 Gold Standard',
    subtitle: 'Triple-pressed willow bats with massive 48mm–50mm contoured edges and aerodynamic tournament match balls.',
    description: 'Carved specifically for heavy tape ball tournament play. Each blade features an extended mid-to-low sweet spot, 3-piece cane handles with carbon vibration dampening, and featherweight pick-up balance.',
  },
  gloves: {
    title: 'Gloves & Protective Kit',
    category: 'gloves',
    badge: 'Pro Batting Armor',
    subtitle: 'Split-finger high-density EVA batting gloves and impact protective accessories.',
    description: 'Maximum knuckle articulation with genuine perforated sheepskin palms for bat grip, ventilation, and shock absorption against high-speed tape ball deliveries.',
  },
  accessories: {
    title: 'Accessories & Upgrades',
    category: 'kits',
    badge: 'Tournament Accessories',
    subtitle: 'Matrix chevron polymer grips, wrist toweling, and bat maintenance gear.',
    description: 'High-traction diamond chevron polymer grips providing maximum wrist control and shock dampening in humid or rainy match conditions.',
  },
};

export const CategoryPage: React.FC<CategoryPageProps> = ({
  pageId,
  products,
  onNavigate,
  onOpenProduct,
  onAddToCart,
  theme,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'featured' | 'price-asc' | 'price-desc' | 'rating'>('featured');

  const meta = PAGE_METADATA[pageId] || PAGE_METADATA['apparel'];

  // Filter items strictly for this dedicated page
  const pageProducts = useMemo(() => {
    return products.filter((p) => {
      // For bats page, also include balls if relevant, or match page category
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
      if (sortBy === 'rating') return b.rating - a.rating;
      return 0;
    });
  }, [products, pageId, meta.category, searchQuery, sortBy]);

  return (
    <div className="py-8 space-y-8 animate-in fade-in duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Breadcrumb Navigation */}
        <div className="flex items-center gap-2 text-xs" style={{ color: theme.textMuted }}>
          <button 
            onClick={() => onNavigate('home')}
            className="hover:text-black transition-colors flex items-center gap-1 cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Home</span>
          </button>
          <ChevronRight className="w-3 h-3 text-zinc-400" />
          <span className="font-semibold text-zinc-900">{meta.title}</span>
        </div>

        {/* Dedicated Page Banner */}
        <div 
          className="rounded-3xl border p-8 md:p-12 shadow-xs relative overflow-hidden"
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

          <div className="max-w-3xl space-y-4 relative z-10">
            <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full border" style={{ borderColor: theme.border, backgroundColor: theme.bg, color: theme.accent }}>
              <Sparkles className="w-3.5 h-3.5" />
              <span>{meta.badge}</span>
            </div>

            <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-zinc-900">
              {meta.title}
            </h1>

            <p className="text-sm sm:text-base leading-relaxed text-zinc-600">
              {meta.subtitle}
            </p>

            <p className="text-xs text-zinc-500 pt-1 leading-relaxed border-t" style={{ borderColor: theme.border }}>
              {meta.description}
            </p>
          </div>
        </div>

        {/* Filter and Sort Toolbar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 pt-2 pb-4 border-b" style={{ borderColor: theme.border }}>
          
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-zinc-900">
              Showing {pageProducts.length} Products
            </span>
            <span className="text-xs text-zinc-400">· Cash on Delivery Available</span>
          </div>

          <div className="flex items-center gap-3">
            {/* Search Input */}
            <div className="relative flex-1 sm:w-60">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
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
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-3 py-1.5 text-xs rounded-lg border outline-none cursor-pointer pr-7 appearance-none"
                style={{
                  backgroundColor: theme.cardBg,
                  borderColor: theme.border,
                  color: theme.textPrimary,
                }}
              >
                <option value="featured">Featured First</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="rating">Highest Rated</option>
              </select>
              <SlidersHorizontal className="w-3 h-3 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-400" />
            </div>
          </div>

        </div>

        {/* Product Grid */}
        {pageProducts.length === 0 ? (
          <div className="py-20 text-center space-y-3 rounded-2xl border" style={{ borderColor: theme.border, backgroundColor: theme.cardBg }}>
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
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
          className="p-5 rounded-2xl border flex flex-col sm:flex-row items-center justify-between gap-4 text-xs"
          style={{
            backgroundColor: theme.cardBg,
            borderColor: theme.border,
          }}
        >
          <div className="flex items-center gap-3">
            <ShieldCheck className="w-5 h-5 text-[#b89428]" />
            <div>
              <span className="font-bold text-zinc-900 block">Nationwide Cash on Delivery (COD)</span>
              <span className="text-zinc-500">Free delivery on all orders over Rs. 3,000 across Pakistan.</span>
            </div>
          </div>
          <a
            href="https://wa.me/?text=Hi%20AK%20Sports%2C%20I%20have%20questions%20about%20your%20products"
            target="_blank"
            rel="noreferrer"
            className="px-4 py-2 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white transition-colors cursor-pointer shrink-0"
          >
            Ask Questions on WhatsApp
          </a>
        </div>

      </div>
    </div>
  );
};
