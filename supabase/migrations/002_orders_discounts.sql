-- 002_orders_discounts.sql
-- Orders and discount codes move from JSON files (read-only on Vercel) into Postgres.
-- The storefront now reaches these tables only through the server with the secret key, so the
-- public policies that let anyone read every order and create coupon codes are removed.
-- Self-contained (does not assume every object from 001_init.sql exists) and safe to run more than once.

begin;

-- Shared helper: keeps updated_at current on every update.
create or replace function update_modified_column()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- Orders
-- ---------------------------------------------------------------------------
alter table orders add column if not exists customer_name text;
alter table orders add column if not exists payment_method text not null default 'paypal';
alter table orders add column if not exists payment_reference text;
alter table orders add column if not exists paid_at timestamptz;
alter table orders add column if not exists shipping_amount numeric(10,2) not null default 0;
alter table orders add column if not exists tax_amount numeric(10,2) not null default 0;
alter table orders add column if not exists admin_notes text;
alter table orders add column if not exists updated_at timestamptz not null default now();

-- Order numbers must count up automatically, starting at 1001.
do $$
begin
  if pg_get_serial_sequence('orders', 'order_number') is null then
    create sequence if not exists orders_order_number_seq owned by orders.order_number;
    alter table orders alter column order_number set default nextval('orders_order_number_seq');
  end if;
end;
$$;

select setval(
  pg_get_serial_sequence('orders', 'order_number'),
  greatest(1000, (select coalesce(max(order_number), 0) from orders)),
  true
);

create unique index if not exists orders_order_number_key on orders (order_number);
create index if not exists idx_orders_customer_email on orders (lower(customer_email));
create index if not exists idx_orders_created_at on orders (created_at desc);

drop trigger if exists update_orders_modtime on orders;
create trigger update_orders_modtime
  before update on orders
  for each row execute function update_modified_column();

-- Launch products are not database rows yet, so each item keeps a snapshot of what was bought.
alter table order_items add column if not exists product_slug text;
alter table order_items add column if not exists variant_ref text;
alter table order_items add column if not exists image text;
create index if not exists idx_order_items_order_id on order_items (order_id);

-- ---------------------------------------------------------------------------
-- Discounts
-- ---------------------------------------------------------------------------
alter table discounts add column if not exists expires_at timestamptz;
alter table discounts add column if not exists updated_at timestamptz not null default now();
alter table discounts alter column max_uses set default 0; -- 0 = unlimited

-- "THANK YOU", "thankyou", and "THANK-YOU" are the same code.
create or replace function normalize_discount_code(p_code text)
returns text
language sql
immutable
as $$
  select upper(regexp_replace(coalesce(p_code, ''), '[[:space:]_-]', '', 'g'));
$$;

create unique index if not exists discounts_normalized_code_key
  on discounts (normalize_discount_code(code));

drop trigger if exists update_discounts_modtime on discounts;
create trigger update_discounts_modtime
  before update on discounts
  for each row execute function update_modified_column();

-- Claims one use of a code in a single statement, so two shoppers can never exceed a usage limit.
-- Returns no row when the code is unknown, inactive, expired, or used up.
create or replace function redeem_discount(p_code text)
returns setof discounts
language sql
security definer
set search_path = public
as $$
  update discounts
     set uses_count = uses_count + 1
   where normalize_discount_code(code) = normalize_discount_code(p_code)
     and is_active
     and (expires_at is null or expires_at > now())
     and (max_uses <= 0 or uses_count < max_uses)
  returning *;
$$;

-- Gives a use back (order creation failed, or the order was cancelled).
create or replace function release_discount(p_id uuid)
returns void
language sql
security definer
set search_path = public
as $$
  update discounts set uses_count = greatest(uses_count - 1, 0) where id = p_id;
$$;

revoke all on function redeem_discount(text) from public, anon, authenticated;
revoke all on function release_discount(uuid) from public, anon, authenticated;
grant execute on function redeem_discount(text) to service_role;
grant execute on function release_discount(uuid) to service_role;

-- Codes that previously lived in data/discounts.json.
insert into discounts (code, percentage, is_active, max_uses)
select v.code, v.percentage, true, v.max_uses
from (values ('THANK YOU', 15, 5000), ('OUTER15', 15, 1000)) as v(code, percentage, max_uses)
where not exists (
  select 1 from discounts d where normalize_discount_code(d.code) = normalize_discount_code(v.code)
);

-- ---------------------------------------------------------------------------
-- Lock down public access (the server uses the secret key, which bypasses RLS)
-- ---------------------------------------------------------------------------
alter table orders enable row level security;
alter table order_items enable row level security;
alter table discounts enable row level security;

drop policy if exists "Allow storefront to create orders" on orders;
drop policy if exists "Allow storefront to view orders" on orders;
drop policy if exists "Allow storefront to create order items" on order_items;
drop policy if exists "Allow storefront to view order items" on order_items;
drop policy if exists "Allow storefront to create discounts" on discounts;
drop policy if exists "Allow storefront to view discounts" on discounts;

commit;
