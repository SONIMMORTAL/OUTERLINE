-- 005: Stripe product catalog sync.
-- Each colorway of a site product is one Stripe product (e.g. "Been Brooklyn Baller Tee Black/Red").
-- Self-contained and safe to re-run.

-- Which Stripe product belongs to which product + color, kept separately for test and live mode.
create table if not exists public.stripe_product_links (
  stripe_product_id text primary key,
  product_id uuid not null references public.products(id) on delete cascade,
  color text not null,
  livemode boolean not null,
  -- The Stripe product as of the last sync (name, price, description, images, active). A webhook only
  -- copies fields that differ from this snapshot, so the site's own writes coming back are ignored.
  synced jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create unique index if not exists stripe_product_links_product_color_mode
  on public.stripe_product_links (product_id, color, livemode);

-- Server-only table (read and written with the secret key), like orders and discounts.
alter table public.stripe_product_links enable row level security;

-- A colorway archived in Stripe is hidden on the site without losing its stock counts.
alter table public.product_variants
  add column if not exists is_active boolean not null default true;
