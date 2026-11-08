import React, { useState, useEffect } from 'react';
import { Header, PageId } from './components/Header';
import { Hero } from './components/Hero';
import { FeaturedVideoSlider } from './components/FeaturedVideoSlider';
import { ProductCard } from './components/ProductCard';
import { ProductModal } from './components/ProductModal';
import { CartDrawer } from './components/CartDrawer';
import { CartPage } from './components/CartPage';
import { OrderLookupModal } from './components/OrderLookupModal';
import { BrandStory } from './components/BrandStory';
import { CategoryPage } from './components/CategoryPage';
import { Footer } from './components/Footer';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { updatePageSEO } from './lib/seo';
import { PRODUCTS, THEMES, REVIEWS, FEATURED_VIDEO_SLIDES } from './data/products';
import { Product, CartItem } from './types';
import { 
  ShoppingCart, 
  Sparkles, 
  Flame, 
  ArrowRight,
  TrendingUp,
  MessageCircle,
  Home,
  Shirt,
  Trophy,
  Search
} from 'lucide-react';

export default function App() {
  const getInitialPage = (): PageId => {
    if (typeof window !== 'undefined') {
      const path = window.location.pathname.toLowerCase();
      if (path === '/admin' || path.startsWith('/admin') || window.location.hash === '#admin') {
        return 'admin';
      }
      if (path === '/cart') return 'cart';
      if (path === '/apparel') return 'apparel';
      if (path === '/bats') return 'bats';
      if (path === '/gloves') return 'gloves';
      if (path === '/accessories') return 'accessories';
    }
    return 'home';
  };

  // Page navigation state: 'home' | 'apparel' | 'bats' | 'gloves' | 'accessories' | 'cart' | 'admin'
  const [currentPage, setCurrentPage] = useState<PageId>(getInitialPage());
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);
  const [isLookupOpen, setIsLookupOpen] = useState<boolean>(false);

  useEffect(() => {
    const handlePopState = () => {
      setCurrentPage(getInitialPage());
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Update dynamic SEO meta tags, title, canonical, and breadcrumbs on route change
  useEffect(() => {
    updatePageSEO(currentPage);
  }, [currentPage]);
  
  // Initial cart with the flagship everyday athletic trousers
  const [cartItems, setCartItems] = useState<CartItem[]>([
    { product: PRODUCTS[0], quantity: 1, selectedSize: 'M (31-33")' }
  ]);

  // Finalized Minimalist Travertine & Gold theme
  const activeTheme = THEMES['travertine-gold'];

  // Smooth page navigation helper
  const handleNavigate = (page: PageId) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (typeof window !== 'undefined' && window.history) {
      const newPath = page === 'home' ? '/' : `/${page}`;
      if (window.location.pathname !== newPath) {
        window.history.pushState(null, '', newPath);
      }
    }
  };

  // Add to cart handler: adds item and takes user directly to dedicated Cart page
  const handleAddToCart = (product: Product, quantity = 1, selectedSize?: string) => {
    setCartItems((prev) => {
      const existingIndex = prev.findIndex(
        (item) => item.product.id === product.id && item.selectedSize === selectedSize
      );
      if (existingIndex > -1) {
        const next = [...prev];
        next[existingIndex] = {
          ...next[existingIndex],
          quantity: next[existingIndex].quantity + quantity,
        };
        return next;
      }
      return [...prev, { product, quantity, selectedSize: selectedSize || product.sizes?.[0] }];
    });
    // Navigate immediately to the Cart page like standard professional e-commerce stores
    handleNavigate('cart');
  };

  // Update item quantity
  const handleUpdateQuantity = (productId: string, quantity: number, selectedSize?: string) => {
    if (quantity <= 0) {
      handleRemoveItem(productId, selectedSize);
      return;
    }
    setCartItems((prev) =>
      prev.map((item) =>
        item.product.id === productId && item.selectedSize === selectedSize
          ? { ...item, quantity }
          : item
      )
    );
  };

  // Remove item
  const handleRemoveItem = (productId: string, selectedSize?: string) => {
    setCartItems((prev) =>
      prev.filter(
        (item) => !(item.product.id === productId && item.selectedSize === selectedSize)
      )
    );
  };

  const handleClearCart = () => {
    setCartItems([]);
  };

  const totalCartQuantity = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  // Main Page Only: Top 4 Highest-Selling Products (Bestsellers across apparel and cricket)
  const bestSellingProducts = [
    PRODUCTS[0], // AK Pro Matrix Flex Athletic Trousers
    PRODUCTS[3], // AK Gold Edition Pro Bat
    PRODUCTS[1], // AK Forged Heavy-Cotton Tee
    PRODUCTS[5], // AK Aerodynamic Pro Tournament Balls (Pack of 6)
  ];

  if (currentPage === 'admin') {
    return <AdminDashboard onExitToStore={() => handleNavigate('home')} />;
  }

  return (
    <div 
      className="min-h-screen flex flex-col font-sans transition-colors duration-300 antialiased pb-20 md:pb-0"
      style={{
        backgroundColor: activeTheme.bg,
        color: activeTheme.textPrimary,
      }}
    >
      {/* Top Header with official logo and separate page links */}
      <Header
        currentPage={currentPage}
        onNavigate={handleNavigate}
        cartCount={totalCartQuantity}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenLookup={() => setIsLookupOpen(true)}
        theme={activeTheme}
      />

      {/* Main Content Area */}
      {currentPage === 'home' ? (
        <main className="flex-1 space-y-10 sm:space-y-16 md:space-y-20">
          {/* Hero Section */}
          <Hero
            heroProduct={PRODUCTS[0]}
            onOpenProduct={setSelectedProduct}
            onAddToCart={handleAddToCart}
            onNavigate={handleNavigate}
            theme={activeTheme}
          />

          {/* Homepage Video Demonstration & Campaign Slider Banner */}
          <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 w-full">
            <FeaturedVideoSlider
              slides={FEATURED_VIDEO_SLIDES}
              products={PRODUCTS}
              onSelectProduct={setSelectedProduct}
              onAddToCart={handleAddToCart}
              theme={activeTheme}
            />
          </div>

          {/* Best Sellers Section: Strictly High-Selling Products */}
          <section className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 w-full space-y-6 sm:space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 sm:gap-4 pb-3 border-b" style={{ borderColor: activeTheme.border }}>
              <div>
                <div className="flex items-center gap-1.5 text-[11px] sm:text-xs font-bold uppercase tracking-wider text-[#b89428]">
                  <Flame className="w-3.5 h-3.5" />
                  <span>Curated High-Demand Drops</span>
                </div>
                <h2 className="font-display text-xl sm:text-2xl md:text-3xl font-extrabold tracking-tight mt-1 text-zinc-900 leading-tight">
                  Best Sellers &amp; Most High-Selling Items
                </h2>
                <p className="text-xs sm:text-sm text-zinc-600 mt-0.5">
                  Our top-volume performance athletic apparel and tournament cricket essentials.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleNavigate('apparel')}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors hover:bg-black/5 cursor-pointer text-zinc-800"
                  style={{ borderColor: activeTheme.border }}
                >
                  Athletic Wear &rarr;
                </button>
                <button
                  onClick={() => handleNavigate('bats')}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors hover:bg-black/5 cursor-pointer text-zinc-800"
                  style={{ borderColor: activeTheme.border }}
                >
                  Tape Ball &rarr;
                </button>
              </div>
            </div>

            {/* 4 Best Sellers Grid: 2 columns on mobile, 4 on desktop */}
            <div className="grid grid-cols-2 gap-3 sm:gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {bestSellingProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onOpenProduct={setSelectedProduct}
                  onAddToCart={handleAddToCart}
                  theme={activeTheme}
                />
              ))}
            </div>

            {/* Separate Category Hub Cards: Direct Portals to Individual Pages */}
            <div className="pt-4 sm:pt-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 sm:gap-6">
                
                {/* Hub 1: Athletic Wear */}
                <div 
                  onClick={() => handleNavigate('apparel')}
                  className="p-4 sm:p-6 rounded-2xl border shadow-xs transition-all duration-300 hover:-translate-y-1 hover:shadow-md cursor-pointer group flex flex-col justify-between"
                  style={{ backgroundColor: activeTheme.cardBg, borderColor: activeTheme.border }}
                >
                  <div className="space-y-1.5 sm:space-y-2">
                    <span className="text-[10px] uppercase font-mono font-bold tracking-widest text-[#b89428]">
                      Core Apparel Line
                    </span>
                    <h3 className="font-display font-bold text-lg sm:text-xl group-hover:underline text-zinc-900 leading-snug">
                      Athletic Wear Collection
                    </h3>
                    <p className="text-xs text-zinc-600 leading-relaxed">
                      4-way stretch flex joggers, combed heavy-cotton tees, training shorts, and active gym wear.
                    </p>
                  </div>
                  <div className="pt-3 mt-3 border-t flex items-center justify-between text-xs font-bold text-[#b89428]" style={{ borderColor: activeTheme.border }}>
                    <span>Browse Collection Page</span>
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </div>
                </div>

                {/* Hub 2: Tape Ball Cricket */}
                <div 
                  onClick={() => handleNavigate('bats')}
                  className="p-4 sm:p-6 rounded-2xl border shadow-xs transition-all duration-300 hover:-translate-y-1 hover:shadow-md cursor-pointer group flex flex-col justify-between"
                  style={{ backgroundColor: activeTheme.cardBg, borderColor: activeTheme.border }}
                >
                  <div className="space-y-1.5 sm:space-y-2">
                    <span className="text-[10px] uppercase font-mono font-bold tracking-widest text-[#b89428]">
                      Tournament Division
                    </span>
                    <h3 className="font-display font-bold text-lg sm:text-xl group-hover:underline text-zinc-900 leading-snug">
                      Tape Ball Cricket
                    </h3>
                    <p className="text-xs text-zinc-600 leading-relaxed">
                      Handcrafted Sialkot English willow bats with 48mm–50mm massive edge profiles and calibrated seam balls.
                    </p>
                  </div>
                  <div className="pt-3 mt-3 border-t flex items-center justify-between text-xs font-bold text-[#b89428]" style={{ borderColor: activeTheme.border }}>
                    <span>Browse Cricket Division</span>
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </div>
                </div>

                {/* Hub 3: Gloves & Kit */}
                <div 
                  onClick={() => handleNavigate('gloves')}
                  className="p-4 sm:p-6 rounded-2xl border shadow-xs transition-all duration-300 hover:-translate-y-1 hover:shadow-md cursor-pointer group flex flex-col justify-between"
                  style={{ backgroundColor: activeTheme.cardBg, borderColor: activeTheme.border }}
                >
                  <div className="space-y-1.5 sm:space-y-2">
                    <span className="text-[10px] uppercase font-mono font-bold tracking-widest text-[#b89428]">
                      Player Protection
                    </span>
                    <h3 className="font-display font-bold text-lg sm:text-xl group-hover:underline text-zinc-900 leading-snug">
                      Gloves &amp; Protective Kit
                    </h3>
                    <p className="text-xs text-zinc-600 leading-relaxed">
                      Split-finger high-density EVA batting gloves with perforated sheepskin palms and accessories.
                    </p>
                  </div>
                  <div className="pt-3 mt-3 border-t flex items-center justify-between text-xs font-bold text-[#b89428]" style={{ borderColor: activeTheme.border }}>
                    <span>Browse Gloves &amp; Kit</span>
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </div>
                </div>

              </div>
            </div>
          </section>

          {/* Official Workshop Identity Section with Facebook Background and Link */}
          <BrandStory
            theme={activeTheme}
            onNavigateToCategory={handleNavigate}
          />

          {/* Customer Reviews Section */}
          <section className="py-10 sm:py-16 border-b" style={{ borderColor: activeTheme.border }}>
            <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 space-y-6 sm:space-y-10">
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 sm:gap-4">
                <div>
                  <span className="text-[11px] sm:text-xs font-semibold uppercase tracking-widest text-[#b89428]">
                    Verified Buyers &amp; Athletes
                  </span>
                  <h3 className="font-display text-xl sm:text-2xl font-bold mt-1 text-zinc-900 leading-tight">
                    Trusted Nationwide Across Pakistan
                  </h3>
                </div>
                <div className="flex items-center gap-2 text-xs text-zinc-600">
                  <span className="flex items-center text-amber-500">
                    ★★★★★
                  </span>
                  <span className="font-semibold text-zinc-900">4.9 / 5</span>
                  <span>· Verified customer feedback</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 sm:gap-6">
                {REVIEWS.map((rev) => (
                  <div
                    key={rev.id}
                    className="p-4 sm:p-6 rounded-2xl border flex flex-col justify-between gap-3 sm:gap-4 shadow-2xs"
                    style={{
                      backgroundColor: activeTheme.cardBg,
                      borderColor: activeTheme.border,
                    }}
                  >
                    <div className="space-y-2 sm:space-y-3">
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center text-amber-500">
                          {'★'.repeat(rev.rating)}
                        </div>
                        <span className="text-[10px] sm:text-[11px] text-zinc-400">{rev.date}</span>
                      </div>
                      <p className="text-xs leading-relaxed italic text-zinc-800">
                        "{rev.comment}"
                      </p>
                    </div>

                    <div className="pt-2.5 sm:pt-3 border-t flex items-center justify-between text-xs" style={{ borderColor: activeTheme.border }}>
                      <div>
                        <span className="font-bold block text-zinc-900">{rev.author}</span>
                        <span className="text-[10px] sm:text-[11px] text-zinc-500">{rev.city} · Verified</span>
                      </div>
                      <span className="text-[9px] sm:text-[10px] px-2 py-0.5 rounded font-mono font-medium" style={{ backgroundColor: activeTheme.badgeBg, color: activeTheme.accent }}>
                        {rev.product}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </main>
      ) : currentPage === 'cart' ? (
        /* Standalone Dedicated Cart & Checkout Page View */
        <main className="flex-1">
          <CartPage
            items={cartItems}
            onUpdateQuantity={handleUpdateQuantity}
            onRemoveItem={handleRemoveItem}
            onClearCart={handleClearCart}
            onNavigate={handleNavigate}
            theme={activeTheme}
          />
        </main>
      ) : (
        /* Standalone Separate Category Page View */
        <main className="flex-1">
          <CategoryPage
            pageId={currentPage}
            products={PRODUCTS}
            onNavigate={handleNavigate}
            onOpenProduct={setSelectedProduct}
            onAddToCart={handleAddToCart}
            theme={activeTheme}
          />
        </main>
      )}

      {/* Footer with separate page links and official Facebook */}
      <Footer
        theme={activeTheme}
        onNavigate={handleNavigate}
        onOpenLookup={() => setIsLookupOpen(true)}
      />

      {/* Mobile App-Style Bottom Tab Bar (Fixed for quick thumb reach) */}
      <nav 
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t flex items-center justify-around py-1.5 px-2 shadow-2xl safe-area-pb"
        style={{ borderColor: activeTheme.border }}
      >
        <button
          onClick={() => handleNavigate('home')}
          className={`flex flex-col items-center justify-center p-1.5 rounded-lg transition-colors cursor-pointer ${
            currentPage === 'home' ? 'text-[#b89428] font-bold' : 'text-zinc-600 hover:text-black'
          }`}
        >
          <Home className="w-5 h-5" />
          <span className="text-[10px] mt-0.5">Home</span>
        </button>

        <button
          onClick={() => handleNavigate('apparel')}
          className={`flex flex-col items-center justify-center p-1.5 rounded-lg transition-colors cursor-pointer ${
            currentPage === 'apparel' ? 'text-[#b89428] font-bold' : 'text-zinc-600 hover:text-black'
          }`}
        >
          <Shirt className="w-5 h-5" />
          <span className="text-[10px] mt-0.5">Apparel</span>
        </button>

        <button
          onClick={() => handleNavigate('bats')}
          className={`flex flex-col items-center justify-center p-1.5 rounded-lg transition-colors cursor-pointer ${
            currentPage === 'bats' ? 'text-[#b89428] font-bold' : 'text-zinc-600 hover:text-black'
          }`}
        >
          <Trophy className="w-5 h-5" />
          <span className="text-[10px] mt-0.5">Cricket</span>
        </button>

        <button
          onClick={() => handleNavigate('cart')}
          className={`flex flex-col items-center justify-center p-1.5 rounded-lg transition-colors cursor-pointer relative ${
            currentPage === 'cart' ? 'text-[#b89428] font-bold' : 'text-zinc-600 hover:text-black'
          }`}
        >
          <div className="relative">
            <ShoppingCart className="w-5 h-5" />
            {totalCartQuantity > 0 && (
              <span className="absolute -top-1.5 -right-2 w-4 h-4 rounded-full bg-[#d4af37] text-zinc-950 text-[10px] font-extrabold flex items-center justify-center shadow-xs">
                {totalCartQuantity}
              </span>
            )}
          </div>
          <span className="text-[10px] mt-0.5">Cart</span>
        </button>

        <a
          href="https://wa.me/923082073415?text=Hi%20AK%20Sports%2C%20I%20have%20an%20inquiry%20regarding%20products"
          target="_blank"
          rel="noreferrer"
          className="flex flex-col items-center justify-center p-1.5 rounded-lg text-emerald-600 hover:text-emerald-700 transition-colors"
        >
          <MessageCircle className="w-5 h-5" />
          <span className="text-[10px] mt-0.5">WhatsApp</span>
        </a>
      </nav>

      {/* Product Detail Modal */}
      <ProductModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
        onAddToCart={handleAddToCart}
        theme={activeTheme}
      />

      {/* Slide-over Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cartItems}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
        onClearCart={handleClearCart}
        theme={activeTheme}
      />

      {/* Customer Order Lookup & Tracking Modal */}
      <OrderLookupModal
        isOpen={isLookupOpen}
        onClose={() => setIsLookupOpen(false)}
        theme={activeTheme}
      />
    </div>
  );
}
