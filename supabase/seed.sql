-- supabase/seed.sql

-- Clear existing data
DELETE FROM discounts;
DELETE FROM order_items;
DELETE FROM orders;
DELETE FROM product_variants;
DELETE FROM products;
DELETE FROM profiles;

-- Insert Products
WITH inserted_products AS (
  INSERT INTO products (id, title, slug, description, editorial_story, price, compare_at_price, category, collection, tags, is_featured, is_drop_active, images)
  VALUES 
    (gen_random_uuid(), 'So NY Tee', 'so-ny-tee', '4.3 oz./yd² (US), 7.2 oz./L yd (CA), 100% combed ring-spun cotton, 32 singles. Premium regular fit with 3/4" neckband and side seams.', 'The definitive New York essential tee. Designed for the kinetic energy of SoHo and the five boroughs.', 35.00, null, 'tees', 'So New York', ARRAY['tees', 'so-ny', '100-cotton', 'streetwear', 'featured'], true, true, ARRAY['/blk_so_ny_wht_tee/blk_so_ny_wht_tee/so_ny_wht_tee.jpg', '/blk_so_ny_blk_tee/blk_so_ny_blk_tee.jpg']),
    (gen_random_uuid(), 'Grey Baller Stripe Tee', 'grey-baller-stripe-tee', '4.3 oz./yd² (US), 7.2 oz./L yd (CA), 100% combed ring-spun cotton, 32 singles. Heather Grey is 90/10 cotton/poly.', 'Heritage collegiate stripes meet modern NYC athletic streetwear tailoring.', 35.00, null, 'tees', 'Grey Baller', ARRAY['tees', 'grey-baller', 'stripes'], true, true, ARRAY['/grey_baller_red_stripe_blk_hoodie/grey_baller_red_stripe_blk_tee/grey_baller_red_stripe_blk_tee.jpg']),
    (gen_random_uuid(), 'Been Brooklyn Two-Tone Tee', 'been-brooklyn-two-tone-tee', '4.3 oz./yd² (US), 7.2 oz./L yd (CA), 100% combed ring-spun cotton, 32 singles. Regular fit with side seams.', 'Two-tone block design representing Brooklyn heritage and borough pride.', 35.00, null, 'tees', 'Been Brooklyn', ARRAY['tees', 'been-brooklyn', 'two-tone'], true, true, ARRAY['/been_brooklyn_blk&wht_blk_tee/been_brooklyn_blk&wht_blk_tee/been_brooklyn_blk&wht_blk_tee.jpg', '/been_brooklyn_blk&wht_blk_tee/been_brooklyn_blk&wht_blk_tee/been_brooklyn_blk&wht_blk_tee_bac.jpg']),
    (gen_random_uuid(), 'Been Brooklyn Hoodie', 'been-brooklyn-hoodie', '10 oz./yd² (US) 16.7 oz /L yd (CA), 70/30 ring-spun cotton/polyester blend 3-end fleece with 100% cotton face, 32 singles. Generous fit with fleece lined hood.', 'Forged in Brooklyn. Built with heavyweight 3-end fleece engineered to withstand the concrete jungle.', 55.00, null, 'hoodies', 'Been Brooklyn', ARRAY['hoodies', 'been-brooklyn', 'heavyweight-fleece', 'featured'], true, true, ARRAY['/been_brooklyn_blk_navy_hoodie/been_brooklyn_blk_navy_hoodie/been_brookyn_blk_blue_blk_hoodie.jpg', '/been_brooklyn_blk_navy_hoodie/been_brooklyn_blk_blk_hoodie/been_bk_blk_blk_hoodie_back.jpg']),
    (gen_random_uuid(), 'Pink Doe Sha Hoodie', 'pink-doe-sha-hoodie', '10 oz./yd² (US) 16.7 oz /L yd (CA), 70/30 ring-spun cotton/polyester blend 3-end fleece with 100% cotton face, 32 singles. Generous fit with fleece lined hood.', 'Vibrant staple piece merging iconic NYC drop energy with custom character iconography.', 55.00, null, 'hoodies', 'So New York', ARRAY['hoodies', 'so-ny', 'doe-sha'], true, true, ARRAY['/pink_doe_sha_blk_hoodie/pink_doe_sha_blk_hoodie.jpg', '/pink_doe_sha_blk_hoodie/pink_doe_sha_blk_hoodie_back.jpg']),
    (gen_random_uuid(), 'So NY Hoodie', 'so-ny-hoodie', '10 oz./yd² (US) 16.7 oz /L yd (CA), 70/30 ring-spun cotton/polyester blend 3-end fleece with 100% cotton face, 32 singles.', 'The iconic So NY design, adapted for cooler weather with heavy-gauge 3-end fleece.', 55.00, null, 'hoodies', 'So New York', ARRAY['hoodies', 'so-ny', 'heavyweight'], true, true, ARRAY['/blk_so_ny_blk_hoodie/blk_so_ny_blk_hoodie.jpg', '/blk_so_ny_blk_hoodie/blk_so_ny_blk_hoodie_bac.jpg']),
    
    (gen_random_uuid(), 'Outerline Classic Cap', 'outerline-classic-cap', 'Six-panel canvas cap.', 'The timeless silhouette.', 35.00, null, 'headwear', 'Accessories', ARRAY['headwear'], true, true, ARRAY['/products/outerline-classic-cap-1.jpg']),
    (gen_random_uuid(), 'Borough Beanie', 'borough-beanie', 'Ribbed knit beanie.', 'Essential warmth for NYC winters.', 35.00, null, 'headwear', 'Accessories', ARRAY['headwear'], false, true, ARRAY['/products/borough-beanie-1.jpg']),
    (gen_random_uuid(), 'Uptown Snapback', 'uptown-snapback', 'Structured snapback cap.', 'Bold lines for bold moves.', 45.00, null, 'headwear', 'Accessories', ARRAY['headwear'], false, true, ARRAY['/products/uptown-snapback-1.jpg']),
    (gen_random_uuid(), 'NYC Transit Crossbody', 'nyc-transit-crossbody', 'Water-resistant crossbody bag.', 'Keep your essentials close and secure.', 45.00, null, 'accessories', 'Accessories', ARRAY['accessories'], true, true, ARRAY['/products/nyc-transit-crossbody-1.jpg']),
    (gen_random_uuid(), 'Outerline Emblem Tote', 'outerline-emblem-tote', 'Heavy canvas tote bag.', 'Carry the heritage everywhere.', 45.00, null, 'accessories', 'Accessories', ARRAY['accessories'], false, true, ARRAY['/products/outerline-emblem-tote-1.jpg']),
    (gen_random_uuid(), 'Borough Socks 3-Pack', 'borough-socks-3-pack', 'Cushioned crew socks.', 'Comfort from the ground up.', 25.00, null, 'accessories', 'Accessories', ARRAY['accessories'], false, true, ARRAY['/products/borough-socks-3-pack-1.jpg'])
  RETURNING id, title, category
)
-- Insert Variants
INSERT INTO product_variants (product_id, sku, size, color, color_hex, inventory_quantity)
SELECT 
  p.id,
  CASE p.category
    WHEN 'hoodies' THEN 'HOOD-' || substring(md5(random()::text) from 1 for 4) || '-' || size.val
    WHEN 'tees' THEN 'TEE-' || substring(md5(random()::text) from 1 for 4) || '-' || size.val
    WHEN 'bottoms' THEN 'BTM-' || substring(md5(random()::text) from 1 for 4) || '-' || size.val
    WHEN 'headwear' THEN 'HAT-' || substring(md5(random()::text) from 1 for 4) || '-OS'
    WHEN 'accessories' THEN 'ACC-' || substring(md5(random()::text) from 1 for 4) || '-OS'
  END as sku,
  CASE WHEN p.category IN ('headwear', 'accessories') THEN 'OS' ELSE size.val END as size,
  colors.color_name,
  colors.hex,
  floor(random() * 36 + 15)::int as inventory_quantity
FROM inserted_products p
CROSS JOIN LATERAL (
  SELECT val FROM unnest(ARRAY['S', 'M', 'L', 'XL']) as val
  WHERE p.category IN ('hoodies', 'tees', 'bottoms')
  UNION ALL
  SELECT 'OS' WHERE p.category IN ('headwear', 'accessories')
) as size
CROSS JOIN LATERAL (
  SELECT 'Onyx' as color_name, '#0A0A0A' as hex
  UNION ALL
  SELECT 'Cream', '#EFECE6'
  UNION ALL
  SELECT 'Slate', '#A1A1AA'
  LIMIT (CASE WHEN p.category = 'hoodies' THEN 1 ELSE 1 END) -- simplify to 1 color per variant for seed
) as colors;

-- Insert Discounts
INSERT INTO discounts (code, percentage, is_active, max_uses, uses_count)
VALUES 
  ('WELCOME15', 15, true, 1000, 0),
  ('OUTERLINE20', 20, true, 500, 0),
  ('BROOKLYN10', 10, true, 2000, 0);
