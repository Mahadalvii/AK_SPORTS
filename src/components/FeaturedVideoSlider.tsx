import React, { useState, useEffect } from 'react';
import { Play, Pause, ChevronLeft, ChevronRight, Volume2, VolumeX, Eye, Sparkles, ShoppingCart, X } from 'lucide-react';
import { VideoSlide, Product, ThemeConfig } from '../types';

interface FeaturedVideoSliderProps {
  slides: VideoSlide[];
  onSelectProduct: (product: Product) => void;
  products: Product[];
  onAddToCart: (product: Product) => void;
  theme: ThemeConfig;
}

export const FeaturedVideoSlider: React.FC<FeaturedVideoSliderProps> = ({
  slides,
  onSelectProduct,
  products,
  onAddToCart,
  theme,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlayingVideoModal, setIsPlayingVideoModal] = useState<VideoSlide | null>(null);
  const [isMuted, setIsMuted] = useState(true);

  // Auto slide every 6 seconds if modal is not open
  useEffect(() => {
    if (isPlayingVideoModal) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [slides.length, isPlayingVideoModal]);

  const currentSlide = slides[currentIndex];
  const targetProduct = products.find((p) => p.id === currentSlide.productTargetId);

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % slides.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + slides.length) % slides.length);
  };

  return (
    <div className="w-full space-y-3 sm:space-y-4">
      {/* Header Label */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: theme.accent }} />
          <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider" style={{ color: theme.accent }}>
            Featured Drops &amp; Video Demonstrations
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-[11px] sm:text-xs font-mono" style={{ color: theme.textMuted }}>
            0{currentIndex + 1} / 0{slides.length}
          </span>
          <button
            onClick={handlePrev}
            aria-label="Previous slide"
            className="w-6 h-6 sm:w-7 sm:h-7 rounded-full border flex items-center justify-center transition-colors hover:bg-black/5 cursor-pointer"
            style={{ borderColor: theme.border, color: theme.textPrimary }}
          >
            <ChevronLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </button>
          <button
            onClick={handleNext}
            aria-label="Next slide"
            className="w-6 h-6 sm:w-7 sm:h-7 rounded-full border flex items-center justify-center transition-colors hover:bg-black/5 cursor-pointer"
            style={{ borderColor: theme.border, color: theme.textPrimary }}
          >
            <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </button>
        </div>
      </div>

      {/* Main Slide Card Banner */}
      <div 
        className="relative rounded-2xl border overflow-hidden shadow-sm transition-all duration-500"
        style={{
          backgroundColor: theme.cardBg,
          borderColor: theme.border,
        }}
      >
        <div className="grid grid-cols-1 lg:grid-cols-12 min-h-auto lg:min-h-[420px] items-stretch">
          
          {/* Left / Media Column: Video Thumbnail with Play Button */}
          <div className="lg:col-span-7 relative min-h-[220px] sm:min-h-[280px] lg:min-h-full overflow-hidden group">
            <img
              src={currentSlide.thumbnailUrl}
              alt={currentSlide.title}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            {/* Ambient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent lg:bg-gradient-to-r lg:from-transparent lg:to-black/30" />

            {/* Video Play Button Trigger */}
            <div className="absolute inset-0 flex items-center justify-center p-4">
              <button
                onClick={() => setIsPlayingVideoModal(currentSlide)}
                className="group/btn flex items-center gap-2.5 sm:gap-3 px-3.5 py-2 sm:px-5 sm:py-3 rounded-full bg-white/95 text-zinc-950 backdrop-blur-md shadow-2xl transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer border border-white"
              >
                <div 
                  className="w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-white shadow-sm shrink-0"
                  style={{ backgroundColor: theme.accent }}
                >
                  <Play className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-current ml-0.5" />
                </div>
                <div className="text-left">
                  <span className="text-[11px] sm:text-xs font-bold block leading-none">Watch Demo</span>
                  <span className="text-[9px] sm:text-[10px] text-zinc-600 block mt-0.5">{currentSlide.videoDuration} Reel · {currentSlide.viewsCount}</span>
                </div>
              </button>
            </div>

            {/* Category Tag pill */}
            <div className="absolute top-3 left-3 sm:top-4 sm:left-4">
              <span className="text-[10px] sm:text-[11px] font-bold tracking-wider uppercase px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-md bg-white/90 text-zinc-900 shadow-sm backdrop-blur-md">
                {currentSlide.categoryTag}
              </span>
            </div>
          </div>

          {/* Right Column: Editorial Details & Instant Shop Action */}
          <div className="lg:col-span-5 p-4 sm:p-6 lg:p-8 flex flex-col justify-between space-y-4 sm:space-y-6">
            <div className="space-y-2 sm:space-y-3">
              <div className="flex items-center gap-1.5 text-[11px] sm:text-xs font-semibold" style={{ color: theme.accent }}>
                <Sparkles className="w-3.5 h-3.5" />
                <span>Featured Campaign Drop</span>
              </div>

              <h3 className="font-display text-lg sm:text-2xl lg:text-3xl font-bold tracking-tight leading-tight" style={{ color: theme.textPrimary }}>
                {currentSlide.title}
              </h3>

              <p className="text-xs sm:text-sm leading-relaxed" style={{ color: theme.textMuted }}>
                {currentSlide.subtitle}
              </p>

              {/* Target product mini showcase */}
              {targetProduct && (
                <div 
                  className="p-3 rounded-xl border flex items-center gap-3 transition-colors mt-2"
                  style={{
                    backgroundColor: theme.bg,
                    borderColor: theme.border,
                  }}
                >
                  <img
                    src={targetProduct.image}
                    alt={targetProduct.name}
                    className="w-12 h-12 sm:w-14 sm:h-14 rounded-lg object-cover shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <span className="text-[11px] sm:text-xs block font-semibold truncate" style={{ color: theme.textPrimary }}>
                      {targetProduct.name}
                    </span>
                    <div className="flex items-baseline gap-2 mt-0.5">
                      <span className="font-bold text-xs sm:text-sm tabular-nums" style={{ color: theme.accent }}>
                        Rs. {targetProduct.price.toLocaleString()}
                      </span>
                      {targetProduct.originalPrice && (
                        <span className="text-[10px] sm:text-[11px] line-through tabular-nums" style={{ color: theme.textMuted }}>
                          Rs. {targetProduct.originalPrice.toLocaleString()}
                        </span>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => onAddToCart(targetProduct)}
                    className="p-2 rounded-lg text-xs font-bold transition-transform active:scale-95 cursor-pointer shadow-xs shrink-0"
                    style={{
                      backgroundColor: theme.accent,
                      color: theme.accentText,
                    }}
                    title="Add to Cart"
                  >
                    <ShoppingCart className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>

            {/* Slide Navigation & Shop Button */}
            <div className="pt-3 sm:pt-4 border-t space-y-3" style={{ borderColor: theme.border }}>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                {targetProduct && (
                  <button
                    onClick={() => onSelectProduct(targetProduct)}
                    className="w-full sm:flex-1 py-2.5 sm:py-3 px-4 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-150 cursor-pointer shadow-md text-center active:scale-98"
                    style={{
                      backgroundColor: theme.accent,
                      color: theme.accentText,
                    }}
                  >
                    {currentSlide.buttonLabel}
                  </button>
                )}
                <button
                  onClick={() => setIsPlayingVideoModal(currentSlide)}
                  className="w-full sm:w-auto py-2.5 sm:py-3 px-4 rounded-xl text-xs font-semibold border transition-colors cursor-pointer hover:bg-black/5 text-center"
                  style={{
                    borderColor: theme.border,
                    color: theme.textPrimary,
                  }}
                >
                  Watch Reel
                </button>
              </div>

              {/* Progress Slide Indicators */}
              <div className="flex items-center gap-1.5 pt-1">
                {slides.map((s, idx) => (
                  <button
                    key={s.id}
                    onClick={() => setCurrentIndex(idx)}
                    className="h-1.5 rounded-full transition-all cursor-pointer"
                    style={{
                      width: currentIndex === idx ? '28px' : '8px',
                      backgroundColor: currentIndex === idx ? theme.accent : 'rgba(0,0,0,0.15)',
                    }}
                    title={s.title}
                  />
                ))}
              </div>
            </div>

          </div>

        </div>
      </div>

      {/* Video Demonstration Modal */}
      {isPlayingVideoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
          <div className="w-full max-w-2xl bg-zinc-950 rounded-2xl overflow-hidden shadow-2xl border border-zinc-800 text-white relative">
            
            {/* Header */}
            <div className="p-3 sm:p-4 border-b border-zinc-800 flex items-center justify-between">
              <div>
                <span className="text-[9px] sm:text-[10px] uppercase font-mono tracking-wider text-[#d4af37] block">
                  Official Demonstration Reel
                </span>
                <h4 className="text-xs sm:text-sm font-bold font-display truncate max-w-[240px] sm:max-w-md">
                  {isPlayingVideoModal.videoTitle}
                </h4>
              </div>
              <button
                onClick={() => setIsPlayingVideoModal(null)}
                className="p-1.5 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Video Player Container */}
            <div className="relative aspect-16/9 bg-zinc-900 flex items-center justify-center overflow-hidden">
              <img
                src={isPlayingVideoModal.thumbnailUrl}
                alt="Video playing preview"
                className="w-full h-full object-cover opacity-90 scale-102 filter"
              />

              <div className="absolute inset-0 bg-black/30 flex flex-col justify-between p-4 sm:p-6">
                <div className="flex justify-between items-center text-xs">
                  <span className="px-2 py-0.5 sm:px-2.5 sm:py-1 rounded bg-black/60 font-mono text-[10px] sm:text-[11px] border border-white/10">
                    LIVE DEMO · 4K 60FPS
                  </span>
                  <button 
                    onClick={() => setIsMuted(!isMuted)} 
                    className="p-1.5 sm:p-2 rounded-full bg-black/60 hover:bg-black/90 transition-colors"
                  >
                    {isMuted ? <VolumeX className="w-4 h-4 text-zinc-300" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
                  </button>
                </div>

                {/* Center playback watermark */}
                <div className="text-center space-y-1 sm:space-y-2">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-white/20 backdrop-blur-md mx-auto flex items-center justify-center border border-white/40 shadow-xl">
                    <Play className="w-5 h-5 sm:w-7 sm:h-7 text-white fill-current ml-0.5" />
                  </div>
                  <p className="text-xs text-zinc-200 font-medium">
                    {isPlayingVideoModal.title}
                  </p>
                </div>

                {/* Progress bar */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[10px] font-mono text-zinc-300">
                    <span>0:14</span>
                    <span>{isPlayingVideoModal.videoDuration}</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-white/20 overflow-hidden">
                    <div className="h-full bg-[#d4af37] w-2/5 rounded-full" />
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer with Direct Shop Action */}
            <div className="p-3 sm:p-4 bg-zinc-900/90 border-t border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <p className="text-[11px] sm:text-xs text-zinc-400">
                Crafted in Sialkot with master fabricators. High-durability stitching.
              </p>
              {targetProduct && (
                <button
                  onClick={() => {
                    setIsPlayingVideoModal(null);
                    onSelectProduct(targetProduct);
                  }}
                  className="w-full sm:w-auto px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider bg-[#d4af37] text-zinc-950 hover:bg-[#e5b842] transition-colors cursor-pointer text-center shrink-0"
                >
                  View Product Specs
                </button>
              )}
            </div>

          </div>
        </div>
      )}
    </div>
  );
};
