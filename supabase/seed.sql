-- ============================================================================
-- AK SPORTS: DATABASE SEED SCRIPT (Safe Seed: ON CONFLICT DO NOTHING)
-- Image paths point to /images/products/<filename>
-- ============================================================================

-- 1. SEED SETTINGS (Safe: will not overwrite existing edited settings)
INSERT INTO public.settings (id, free_delivery_threshold, delivery_fee, currency, whatsapp_helpline)
VALUES ('store_settings', 3000, 250, 'PKR', '+923000000000')
ON CONFLICT (id) DO NOTHING;

-- 2. SEED PRODUCTS (Safe: will not overwrite existing edited prices or details)
INSERT INTO public.products (
    id, name, category, category_label, price, original_price, rating, reviews_count,
    image_url, tag, description, specs, features, weight, is_featured, is_active
) VALUES
(
    'ak-apparel-pro-trousers',
    'AK Pro Matrix Flex Athletic Trousers',
    'apparel',
    'Athletic Wear',
    2650,
    3100,
    4.96,
    184,
    '/images/products/clothing_athletic_trousers_1794058288601.jpg',
    'Bestseller',
    'Our top-rated performance trousers engineered for everyone. Crafted from lightweight 4-way stretch fabric with ergonomic articulated knees, dual gold zip pockets, and a tapered ankle cuff suited for workouts, travel, or casual wear.',
    '[
        {"label": "Fabric Composition", "value": "88% Poly-Nylon / 12% Spandex Flex"},
        {"label": "Fit Profile", "value": "Slim Tapered Athletic Jogger"},
        {"label": "Pockets", "value": "Dual Zippered Deep Phone Pockets"},
        {"label": "Waistband", "value": "Internal Drawcord + Ribbed Stretch"},
        {"label": "Care", "value": "Machine Wash Cold / Quick Dry"},
        {"label": "Origin", "value": "Sialkot Textile Mills, Pakistan"}
    ]'::jsonb,
    '[
        "Ultra-breathable fabric that prevents cling and sweat buildup",
        "Dual gold-accented metal zippers keep phone and keys secure",
        "Ankle cuff ribbing preserves structure without tightness",
        "Subtle heat-sealed gold AK crest on left thigh"
    ]'::jsonb,
    NULL,
    true,
    true
),
(
    'ak-apparel-oversized-tee',
    'AK Forged Athletics Heavy-Cotton Training Tee',
    'apparel',
    'Athletic Wear',
    1850,
    2200,
    4.92,
    129,
    '/images/products/clothing_oversized_tee_1794058288633.jpg',
    'Trending Fit',
    'An everyday essential built from luxurious 280 GSM combed cotton. Boxy drop-shoulder cut offering clean structure, superior breathability, and an embroidered gold shield crest for minimalist luxury.',
    '[
        {"label": "Material", "value": "100% Combed Compact Cotton (280 GSM)"},
        {"label": "Fit Style", "value": "Relaxed Drop-Shoulder Boxy Cut"},
        {"label": "Neckline", "value": "Reinforced 1.25\" Ribbed Crewneck"},
        {"label": "Branding", "value": "High-Density Gold Shield Crest"}
    ]'::jsonb,
    '[
        "Pre-shrunk fabric ensures no distortion after repetitive washes",
        "Thick ribbed collar that holds shape and will not sag",
        "Versatile aesthetic suitable for gym workouts or streetwear"
    ]'::jsonb,
    NULL,
    true,
    true
),
(
    'ak-apparel-stealth-kit',
    'AK Stealth Dry-Fit Jersey & Match Shorts Set',
    'apparel',
    'Athletic Wear',
    2950,
    3400,
    4.90,
    81,
    '/images/products/sports_apparel_jersey_1794057615270.jpg',
    'Complete Set',
    'Two-piece matching athletic kit engineered for match days and intense training. Ultra-light micro-perforated mesh jersey paired with quick-drying athletic shorts featuring gold drawstrings.',
    '[
        {"label": "Set Inclusions", "value": "1x V-Neck Jersey + 1x Lined Short"},
        {"label": "Technology", "value": "AeroDry Moisture Management"},
        {"label": "Shorts Pockets", "value": "Zippered Side Pockets"},
        {"label": "Weight", "value": "Super-light 220g Total"}
    ]'::jsonb,
    '[
        "Gold foil AK crest heat-sealed on chest and left leg",
        "Flatlock anti-friction stitching prevents skin chafing",
        "Laser-cut ventilation zone on the upper spine"
    ]'::jsonb,
    NULL,
    false,
    true
),
(
    'ak-bat-gold-edition',
    'AK Gold Edition Pro Handcrafted Bat',
    'bats',
    'Tape Ball Cricket',
    6800,
    7500,
    4.95,
    148,
    '/images/products/cricket_bat_gold_pro_1794057613027.jpg',
    'Gold Standard',
    'Engineered specifically for heavy tape ball tournaments. Handcrafted in Sialkot with triple-pressed premium English willow, full curved blade profile, and 48mm massive edges for effortless maximum six hitting.',
    '[
        {"label": "Blade Length", "value": "35 Inches Full Blade"},
        {"label": "Edge Thickness", "value": "48mm Massive Contoured"},
        {"label": "Weight Range", "value": "780g - 840g Light Balance"},
        {"label": "Handle Construction", "value": "3-Piece Singapore Cane + Carbon"},
        {"label": "Sweet Spot", "value": "Mid-to-Low Extended"},
        {"label": "Origin", "value": "Sialkot, Pakistan"}
    ]'::jsonb,
    '[
        "Pre-knocked and ready for high-speed tournament play",
        "Dual-layer anti-shock rubberized spiral chevron grip",
        "Aerodynamic curved spine for light pickup and swift wrist snap",
        "Reinforced toe guard with waterproof coating"
    ]'::jsonb,
    '820 grams',
    true,
    true
),
(
    'ak-bat-carbon-shadow',
    'AK Black Shadow Limited Edition Bat',
    'bats',
    'Tape Ball Cricket',
    7400,
    8200,
    4.98,
    110,
    '/images/products/cricket_bat_gold_pro_1794057613027.jpg',
    'Limited Run',
    'Our flagship carbon-infused tape ball monster. Extra scooping along the shoulders yields an astonishingly feathered pickup with a punishing 50mm sweet-spot profile.',
    '[
        {"label": "Blade Length", "value": "35.5 Inches Long Handle"},
        {"label": "Edge Thickness", "value": "50mm Beast Edge"},
        {"label": "Weight Range", "value": "810g Feather Pickup"},
        {"label": "Handle Construction", "value": "4-Piece Cane + Dual Carbon Rods"}
    ]'::jsonb,
    '[
        "Custom laser engraved AK royal crest insignia",
        "Curved duckbill profile for thunderous rebound",
        "Exclusive matte black & gold protective sleeve included"
    ]'::jsonb,
    '810 grams',
    false,
    true
),
(
    'ak-tape-balls-pro',
    'AK Aerodynamic Pro Tournament Balls (Pack of 6)',
    'balls',
    'Tape Ball Cricket',
    1450,
    1650,
    4.88,
    92,
    '/images/products/cricket_tape_balls_1794057613585.jpg',
    'Match Tested',
    'Double-wrapped tournament tape balls calibrated for true bounce, lethal seam stability, and aerodynamic late swing in both floodlight and daytime games.',
    '[
        {"label": "Pack Quantity", "value": "6 Premium Match Balls"},
        {"label": "Seam Type", "value": "Dual-bonded Precision Synthetic"},
        {"label": "Bounce Retention", "value": "40+ Overs tested"},
        {"label": "Core Weight", "value": "115g Calibrated"}
    ]'::jsonb,
    '[
        "High-grade rubber compound core resistant to softening in heat",
        "Aero-grooved seam for consistent outswing and reverse swing",
        "High-visibility bright finish for night cricket visibility"
    ]'::jsonb,
    NULL,
    false,
    true
),
(
    'ak-gloves-pro-gold',
    'AK Royal Pro Split-Finger Batting Gloves',
    'gloves',
    'Gloves & Kit',
    3200,
    3800,
    4.92,
    64,
    '/images/products/cricket_gloves_luxury_1794057613785.jpg',
    'High Impact',
    'Ultra-lightweight multi-section finger protection with high-density EVA foam and genuine perforated sheepskin leather palm for unmatched bat feel and sweat dissipation.',
    '[
        {"label": "Protection System", "value": "Multi-Flex 3D Cut High-Density Foam"},
        {"label": "Palm Material", "value": "Grade-A Premium Sheepskin"},
        {"label": "Wrist Band", "value": "50mm Double-Sided Toweling"},
        {"label": "Thumb Guard", "value": "Three-Piece Curved Shield"}
    ]'::jsonb,
    '[
        "Embossed metallic gold branding accents",
        "Airflow gussets along fingers prevent moisture buildup",
        "Soft-feel cotton back-lining for all-day comfort"
    ]'::jsonb,
    NULL,
    false,
    true
),
(
    'ak-accessories-grip-pack',
    'AK Pro Matrix Chevron Bat Grips (Pack of 3)',
    'kits',
    'Accessories',
    750,
    900,
    4.82,
    56,
    '/images/products/sports_apparel_jersey_1794057615270.jpg',
    NULL,
    'High-traction diamond chevron polymer grips providing maximum control and shock dampening in rainy or humid conditions.',
    '[
        {"label": "Material", "value": "Pure Non-Slip Natural Vulcanized Rubber"},
        {"label": "Pattern", "value": "Directional Matrix Chevron"},
        {"label": "Colors", "value": "Matte Black, Gold Streak, Royal White"}
    ]'::jsonb,
    '[
        "Tear resistant even under extreme hard-hitting tension",
        "Anti-blister cushioned texture"
    ]'::jsonb,
    NULL,
    false,
    true
)
ON CONFLICT (id) DO NOTHING;

-- 3. SEED PRODUCT VARIANTS (Safe: ON CONFLICT DO NOTHING ensures stock is never reset)
INSERT INTO public.product_variants (product_id, size_or_variant, stock)
VALUES
    -- AK Pro Matrix Athletic Trousers (58 Total)
    ('ak-apparel-pro-trousers', 'S (28-30")', 10),
    ('ak-apparel-pro-trousers', 'M (31-33")', 18),
    ('ak-apparel-pro-trousers', 'L (34-36")', 15),
    ('ak-apparel-pro-trousers', 'XL (37-39")', 10),
    ('ak-apparel-pro-trousers', 'XXL (40-42")', 5),

    -- AK Forged Athletics Heavy-Cotton Training Tee (64 Total)
    ('ak-apparel-oversized-tee', 'Small', 14),
    ('ak-apparel-oversized-tee', 'Medium', 22),
    ('ak-apparel-oversized-tee', 'Large', 18),
    ('ak-apparel-oversized-tee', 'Extra Large', 10),

    -- AK Stealth Dry-Fit Set (35 Total)
    ('ak-apparel-stealth-kit', 'S (38")', 6),
    ('ak-apparel-stealth-kit', 'M (40")', 12),
    ('ak-apparel-stealth-kit', 'L (42")', 10),
    ('ak-apparel-stealth-kit', 'XL (44")', 5),
    ('ak-apparel-stealth-kit', 'XXL (46")', 2),

    -- AK Gold Edition Pro Bat (18 Total)
    ('ak-bat-gold-edition', '34.5" Medium (790g)', 4),
    ('ak-bat-gold-edition', '35.0" Standard (820g)', 10),
    ('ak-bat-gold-edition', '35.5" Extended (840g)', 4),

    -- AK Black Shadow Limited Edition Bat (9 Total)
    ('ak-bat-carbon-shadow', '35.0" Standard (800g)', 4),
    ('ak-bat-carbon-shadow', '35.5" Long Handle (820g)', 5),

    -- AK Tournament Balls (45 Total)
    ('ak-tape-balls-pro', 'Standard Pack (6 Balls)', 45),

    -- AK Royal Pro Batting Gloves (22 Total)
    ('ak-gloves-pro-gold', 'Youth', 4),
    ('ak-gloves-pro-gold', 'Adult Standard', 14),
    ('ak-gloves-pro-gold', 'Extra Large', 4),

    -- AK Bat Grips (60 Total)
    ('ak-accessories-grip-pack', 'Pack of 3 Assorted', 60)
ON CONFLICT (product_id, size_or_variant) DO NOTHING;

-- 4. SEED PRODUCT GALLERY IMAGES
INSERT INTO public.product_images (product_id, url, sort_order)
VALUES
    ('ak-apparel-pro-trousers', '/images/products/clothing_athletic_trousers_1794058288601.jpg', 0),
    ('ak-apparel-oversized-tee', '/images/products/clothing_oversized_tee_1794058288633.jpg', 0),
    ('ak-apparel-stealth-kit', '/images/products/sports_apparel_jersey_1794057615270.jpg', 0),
    ('ak-bat-gold-edition', '/images/products/cricket_bat_gold_pro_1794057613027.jpg', 0),
    ('ak-bat-carbon-shadow', '/images/products/cricket_bat_gold_pro_1794057613027.jpg', 0),
    ('ak-tape-balls-pro', '/images/products/cricket_tape_balls_1794057613585.jpg', 0),
    ('ak-gloves-pro-gold', '/images/products/cricket_gloves_luxury_1794057613785.jpg', 0),
    ('ak-accessories-grip-pack', '/images/products/sports_apparel_jersey_1794057615270.jpg', 0)
ON CONFLICT DO NOTHING;
