import { Product, ThemeConfig, VideoSlide } from '../types';

export const THEMES: Record<string, ThemeConfig> = {
  'travertine-gold': {
    id: 'travertine-gold',
    name: 'Minimalist Travertine & Gold (Finalized)',
    tagline: 'Refined clean gallery aesthetic on warm travertine stone with antique gold foil accents.',
    bg: '#f8f7f4',
    cardBg: '#ffffff',
    border: '#e7e4dc',
    accent: '#b89428',
    accentLight: '#d4af37',
    accentText: '#ffffff',
    textPrimary: '#18181b',
    textMuted: '#64635e',
    badgeBg: 'rgba(184, 148, 40, 0.09)',
    mode: 'light',
  },
  'onyx-gold': {
    id: 'onyx-gold',
    name: 'Onyx & Royal Gold',
    tagline: 'Deep dark charcoal with metallic gold, extracted from the original AK Sports Facebook crest.',
    bg: '#0c0c0e',
    cardBg: '#151518',
    border: '#27272a',
    accent: '#d4af37',
    accentLight: '#f3e08b',
    accentText: '#0c0c0e',
    textPrimary: '#f4f4f5',
    textMuted: '#a1a1aa',
    badgeBg: 'rgba(212, 175, 55, 0.12)',
    mode: 'dark',
  },
  'cobalt-gold': {
    id: 'cobalt-gold',
    name: 'Electric Cobalt & Gold',
    tagline: 'Inspired by the electric blue camo pattern on the custom AK GOLD EDITION bat.',
    bg: '#0a0d14',
    cardBg: '#111827',
    border: '#1f293d',
    accent: '#2563eb',
    accentLight: '#60a5fa',
    accentText: '#ffffff',
    textPrimary: '#f8fafc',
    textMuted: '#94a3b8',
    badgeBg: 'rgba(37, 99, 235, 0.12)',
    mode: 'dark',
  },
};

export const FEATURED_VIDEO_SLIDES: VideoSlide[] = [];

export const PRODUCTS: Product[] = [];

export const TRUST_PROMISES = [
  {
    title: 'Everyday Athletic Fabric',
    description: 'Premium four-way stretch joggers and heavy combed cotton tees designed for gym, street, and daily performance.',
    icon: 'Sparkles',
  },
  {
    title: 'Cash on Delivery (COD)',
    description: 'Inspect upon arrival at your doorstep anywhere in Pakistan before paying with cash.',
    icon: 'Banknote',
  },
  {
    title: 'Master Handcrafted Quality',
    description: 'Crafted at our Sialkot factory unit and inspected at our Bahawalnagar main outlet with zero middleman price inflation.',
    icon: 'Hammer',
  },
  {
    title: '1-Click WhatsApp Order',
    description: 'Connect directly with our team for size guidance, custom bat weights, and instant dispatch updates.',
    icon: 'MessageCircle',
  },
];

export const REVIEWS = [
  {
    id: 'rev-1',
    author: 'Zain Ul Abideen',
    city: 'Lahore',
    product: 'AK Pro Athletic Trousers',
    comment: 'The fit on these trousers is outstanding. Deep zippered pockets easily hold an iPhone Pro Max while jogging. Clean gold detailing looks high-end.',
    rating: 5,
    verified: true,
    date: '2 days ago',
  },
  {
    id: 'rev-2',
    author: 'Hamza Tariq',
    city: 'Faisalabad',
    product: 'AK Gold Edition Bat',
    comment: 'The balance on this bat is unreal. 820 grams feels like 780 in hand. Hit 4 sixes in my first over at the tournament. Solid ping sound.',
    rating: 5,
    verified: true,
    date: '4 days ago',
  },
  {
    id: 'rev-3',
    author: 'Saad Malik',
    city: 'Islamabad',
    product: 'AK Forged Heavy Cotton Tee',
    comment: 'Heavy 280 GSM fabric holds its boxy shape after wash. Definitely on par with international athletic streetwear brands at 1/3 the price.',
    rating: 5,
    verified: true,
    date: '1 week ago',
  },
];
