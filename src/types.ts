export interface Product {
  id: string;
  name: string;
  category: 'apparel' | 'bats' | 'gloves' | 'balls' | 'kits';
  categoryLabel: string;
  price: number;
  originalPrice?: number;
  rating: number;
  reviewsCount: number;
  image: string;
  tag?: string;
  description: string;
  specs: {
    label: string;
    value: string;
  }[];
  features: string[];
  stock: number;
  sizes?: string[];
  variants?: {
    id?: string;
    size: string;
    stock?: number;
  }[];
  weight?: string;
  isFeatured?: boolean;
  videoUrl?: string | null;
}

export interface VideoSlide {
  id: string;
  title: string;
  subtitle: string;
  categoryTag: string;
  videoDuration: string;
  thumbnailUrl: string;
  videoTitle: string;
  productTargetId?: string;
  buttonLabel: string;
  viewsCount: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
  selectedSize?: string;
}

export type ColorPalette = 'onyx-gold' | 'cobalt-gold' | 'emerald-gold' | 'travertine-gold';

export interface ThemeConfig {
  id: ColorPalette;
  name: string;
  tagline: string;
  bg: string;
  cardBg: string;
  border: string;
  accent: string;
  accentLight: string;
  accentText: string;
  textPrimary: string;
  textMuted: string;
  badgeBg: string;
  mode: 'dark' | 'light';
}
