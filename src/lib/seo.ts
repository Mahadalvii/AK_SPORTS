import { PageId } from '../components/Header';

export interface PageSEOMetadata {
  title: string;
  description: string;
  canonicalPath: string;
  keywords: string[];
  ogType: 'website' | 'article';
  breadcrumbs: { name: string; path: string }[];
}

export const SEO_PAGE_METADATA: Record<PageId, PageSEOMetadata> = {
  home: {
    title: 'AK Sports — Everyday Athletic Wear & Handcrafted Cricket Gear',
    description: 'Shop AK Sports engineered 4-way stretch athletic trousers, 280 GSM combed cotton training tees, and championship handcrafted tape ball bats with Cash on Delivery nationwide in Pakistan.',
    canonicalPath: '/',
    keywords: [
      'AK Sports',
      'athletic wear Pakistan',
      'everyday athletic trousers',
      'tape ball cricket bats',
      'cricket bat factory Pakistan',
      'Bahawalnagar sports store',
      'combed cotton training tee',
      'stretch joggers Pakistan',
      'COD sports store'
    ],
    ogType: 'website',
    breadcrumbs: [
      { name: 'Home', path: '/' }
    ],
  },
  apparel: {
    title: 'Athletic Wear Collection — 4-Way Stretch Trousers & Heavy Tees | AK Sports',
    description: 'Explore AK Sports performance apparel: everyday 4-way stretch athletic flex joggers, 280 GSM combed compact cotton tees, and dry-fit training sets built for gym agility and street style.',
    canonicalPath: '/apparel',
    keywords: [
      'athletic wear',
      'gym trousers Pakistan',
      '4-way flex joggers',
      'heavyweight training tee',
      'dry fit sports kit',
      'activewear Pakistan',
      'men athletic trousers'
    ],
    ogType: 'website',
    breadcrumbs: [
      { name: 'Home', path: '/' },
      { name: 'Athletic Wear', path: '/apparel' }
    ],
  },
  bats: {
    title: 'Tape Ball Cricket Division — Handcrafted Willow Bats | AK Sports',
    description: 'Handcrafted English willow tape ball cricket bats with 48mm–50mm massive edge profiles, feather-light pickup balance, and aerodynamic tournament balls. Cash on Delivery across Pakistan.',
    canonicalPath: '/bats',
    keywords: [
      'tape ball bats',
      'AK Gold Edition bat',
      'handcrafted cricket bats',
      '48mm edge bat',
      'tournament tape balls',
      'best tape ball bat Pakistan',
      'handcrafted cricket willow'
    ],
    ogType: 'website',
    breadcrumbs: [
      { name: 'Home', path: '/' },
      { name: 'Tape Ball Cricket', path: '/bats' }
    ],
  },
  gloves: {
    title: 'Gloves & Protective Gear — Split-Finger Batting Gloves | AK Sports',
    description: 'High-density EVA split-finger batting gloves with perforated sheepskin leather palms for maximum impact absorption, sweat ventilation, and flexible grip.',
    canonicalPath: '/gloves',
    keywords: [
      'batting gloves Pakistan',
      'cricket batting gloves',
      'split finger gloves',
      'protective cricket gear',
      'leather cricket gloves'
    ],
    ogType: 'website',
    breadcrumbs: [
      { name: 'Home', path: '/' },
      { name: 'Gloves & Kit', path: '/gloves' }
    ],
  },
  accessories: {
    title: 'Accessories & Upgrades — Bat Grips & Maintenance | AK Sports',
    description: 'Premium chevron matrix non-slip bat grips, protective gear maintenance, and equipment accessories factory direct.',
    canonicalPath: '/accessories',
    keywords: [
      'cricket accessories',
      'bat grips Pakistan',
      'chevron bat grip',
      'cricket gear care'
    ],
    ogType: 'website',
    breadcrumbs: [
      { name: 'Home', path: '/' },
      { name: 'Accessories', path: '/accessories' }
    ],
  },
  cart: {
    title: 'Shopping Cart & Express COD Checkout | AK Sports',
    description: 'Review your cart and place your Cash on Delivery (COD) order with nationwide dispatch from our Bahawalnagar outlet across Pakistan.',
    canonicalPath: '/cart',
    keywords: ['AK Sports cart', 'COD checkout', 'cash on delivery sports Pakistan'],
    ogType: 'website',
    breadcrumbs: [
      { name: 'Home', path: '/' },
      { name: 'Shopping Cart', path: '/cart' }
    ],
  },
  admin: {
    title: 'Admin Portal & Catalog Management | AK Sports',
    description: 'Secure management console for AK Sports administrator.',
    canonicalPath: '/admin',
    keywords: ['admin'],
    ogType: 'website',
    breadcrumbs: [
      { name: 'Home', path: '/' },
      { name: 'Admin', path: '/admin' }
    ],
  },
};

/**
 * Updates DOM head meta tags, canonical link, and JSON-LD breadcrumbs dynamically on route navigation
 */
export function updatePageSEO(page: PageId, baseUrl = 'https://ak-sports.vercel.app') {
  if (typeof document === 'undefined') return;

  const meta = SEO_PAGE_METADATA[page] || SEO_PAGE_METADATA.home;
  const canonicalUrl = `${baseUrl.replace(/\/+$/, '')}${meta.canonicalPath}`;

  // 1. Document Title
  document.title = meta.title;

  // 2. Helper to set or create a meta tag
  const setMetaTag = (attributeName: string, attributeValue: string, content: string) => {
    let el = document.querySelector(`meta[${attributeName}="${attributeValue}"]`);
    if (!el) {
      el = document.createElement('meta');
      el.setAttribute(attributeName, attributeValue);
      document.head.appendChild(el);
    }
    el.setAttribute('content', content);
  };

  // 3. Primary Meta Tags
  setMetaTag('name', 'description', meta.description);
  setMetaTag('name', 'keywords', meta.keywords.join(', '));
  setMetaTag('name', 'robots', page === 'admin' ? 'noindex, nofollow' : 'index, follow, max-image-preview:large');

  // 4. OpenGraph Tags
  setMetaTag('property', 'og:title', meta.title);
  setMetaTag('property', 'og:description', meta.description);
  setMetaTag('property', 'og:url', canonicalUrl);
  setMetaTag('property', 'og:type', meta.ogType);

  // 5. Twitter Card Tags
  setMetaTag('name', 'twitter:title', meta.title);
  setMetaTag('name', 'twitter:description', meta.description);
  setMetaTag('name', 'twitter:url', canonicalUrl);

  // 6. Canonical Link
  let canonicalEl = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
  if (!canonicalEl) {
    canonicalEl = document.createElement('link');
    canonicalEl.setAttribute('rel', 'canonical');
    document.head.appendChild(canonicalEl);
  }
  canonicalEl.setAttribute('href', canonicalUrl);

  // 7. Dynamic BreadcrumbList JSON-LD Schema
  let breadcrumbScript = document.getElementById('jsonld-breadcrumbs');
  if (!breadcrumbScript) {
    breadcrumbScript = document.createElement('script');
    breadcrumbScript.id = 'jsonld-breadcrumbs';
    breadcrumbScript.setAttribute('type', 'application/ld+json');
    document.head.appendChild(breadcrumbScript);
  }

  const breadcrumbsSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: meta.breadcrumbs.map((b, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: b.name,
      item: `${baseUrl.replace(/\/+$/, '')}${b.path}`,
    })),
  };

  breadcrumbScript.textContent = JSON.stringify(breadcrumbsSchema);
}
