-- 004_inventory_paypal.sql
-- Real inventory and automatic PayPal confirmation.
--   * Stock is reserved when an order is placed and released when it is cancelled or goes unpaid.
--   * PayPal Instant Payment Notifications are logged in payment_events and mark orders paid.
--   * Products, variants, and payment events become server-only (read with the secret key).
-- Self-contained and safe to run more than once.

begin;

-- ---------------------------------------------------------------------------
-- Orders: reservation state and payment deadline
-- ---------------------------------------------------------------------------
alter table orders add column if not exists inventory_reserved boolean not null default false;
alter table orders add column if not exists payment_expires_at timestamptz;
create index if not exists idx_orders_pending_expiry on orders (payment_expires_at) where status = 'pending';
create index if not exists idx_orders_payment_reference on orders (payment_reference);

-- ---------------------------------------------------------------------------
-- Variants: one row per product/color/size, stock never negative
-- ---------------------------------------------------------------------------
create unique index if not exists product_variants_product_color_size_key
  on product_variants (product_id, color, size);
create index if not exists idx_product_variants_product_id on product_variants (product_id);

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'product_variants_inventory_nonnegative') then
    alter table product_variants
      add constraint product_variants_inventory_nonnegative check (inventory_quantity >= 0);
  end if;
end;
$$;

-- ---------------------------------------------------------------------------
-- Payment notification log (verified notifications only; also de-duplicates PayPal retries)
-- ---------------------------------------------------------------------------
create table if not exists payment_events (
  id uuid primary key default gen_random_uuid(),
  provider text not null,
  event_id text not null,
  event_status text not null,
  order_id uuid references orders(id) on delete set null,
  verified boolean not null default false,
  amount numeric(10,2),
  currency text,
  result text,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  unique (provider, event_id, event_status)
);
create index if not exists idx_payment_events_order_id on payment_events (order_id);

-- ---------------------------------------------------------------------------
-- Stock reservation
-- ---------------------------------------------------------------------------

-- Takes stock for every line of an order in one transaction. If any line is short, nothing is taken
-- and the error message is OUT_OF_STOCK:<variant id>. Does nothing if the order already holds stock.
create or replace function reserve_order_stock(p_order_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  line record;
  changed integer;
begin
  perform 1 from orders where id = p_order_id and not inventory_reserved for update;
  if not found then
    return;
  end if;

  for line in
    select variant_id, sum(quantity)::integer as quantity
    from order_items
    where order_id = p_order_id and variant_id is not null
    group by variant_id
    order by variant_id
  loop
    update product_variants
       set inventory_quantity = inventory_quantity - line.quantity
     where id = line.variant_id
       and inventory_quantity >= line.quantity;
    get diagnostics changed = row_count;
    if changed = 0 then
      raise exception 'OUT_OF_STOCK:%', line.variant_id;
    end if;
  end loop;

  update orders set inventory_reserved = true where id = p_order_id;
end;
$$;

-- Returns an order's stock. Does nothing if the order holds none, so it is safe to call twice.
create or replace function release_order_stock(p_order_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  perform 1 from orders where id = p_order_id and inventory_reserved for update;
  if not found then
    return;
  end if;

  update product_variants v
     set inventory_quantity = v.inventory_quantity + l.quantity
    from (
      select variant_id, sum(quantity)::integer as quantity
      from order_items
      where order_id = p_order_id and variant_id is not null
      group by variant_id
    ) l
   where v.id = l.variant_id;

  update orders set inventory_reserved = false where id = p_order_id;
end;
$$;

-- Cancels unpaid orders whose hold has expired, returning their stock and discount uses.
create or replace function expire_unpaid_orders()
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  expired record;
  total integer := 0;
begin
  for expired in
    select id, discount_code
    from orders
    where status = 'pending'
      and payment_expires_at is not null
      and payment_expires_at < now()
    for update skip locked
  loop
    perform release_order_stock(expired.id);
    if expired.discount_code is not null then
      update discounts
         set uses_count = greatest(uses_count - 1, 0)
       where normalize_discount_code(code) = normalize_discount_code(expired.discount_code);
    end if;
    update orders
       set status = 'cancelled',
           admin_notes = concat_ws(E'\n', nullif(admin_notes, ''), 'Auto-cancelled: payment was not received before the hold expired.')
     where id = expired.id;
    total := total + 1;
  end loop;
  return total;
end;
$$;

-- Marks an order paid exactly once. A payment that arrives after the order was cancelled claims its
-- stock and discount use again; if the stock is gone, the order is still marked paid and flagged.
-- Returns: paid | already_paid | paid_out_of_stock | not_found
create or replace function mark_order_paid(p_order_id uuid, p_reference text)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  current_order orders%rowtype;
begin
  select * into current_order from orders where id = p_order_id for update;
  if not found then
    return 'not_found';
  end if;

  if current_order.status in ('paid', 'processing', 'fulfilled') then
    if p_reference is not null then
      update orders set payment_reference = coalesce(payment_reference, p_reference) where id = p_order_id;
    end if;
    return 'already_paid';
  end if;

  if current_order.status = 'cancelled' then
    begin
      perform reserve_order_stock(p_order_id);
    exception when raise_exception then
      update orders
         set status = 'paid',
             paid_at = now(),
             payment_reference = coalesce(p_reference, payment_reference),
             admin_notes = concat_ws(E'\n', nullif(admin_notes, ''), 'Paid after the order was cancelled, but its stock is no longer available. Refund or restock before shipping.')
       where id = p_order_id;
      return 'paid_out_of_stock';
    end;

    if current_order.discount_code is not null then
      update discounts
         set uses_count = uses_count + 1
       where normalize_discount_code(code) = normalize_discount_code(current_order.discount_code);
    end if;
  end if;

  update orders
     set status = 'paid',
         paid_at = coalesce(paid_at, now()),
         payment_reference = coalesce(p_reference, payment_reference)
   where id = p_order_id;
  return 'paid';
end;
$$;

revoke all on function reserve_order_stock(uuid) from public, anon, authenticated;
revoke all on function release_order_stock(uuid) from public, anon, authenticated;
revoke all on function expire_unpaid_orders() from public, anon, authenticated;
revoke all on function mark_order_paid(uuid, text) from public, anon, authenticated;
grant execute on function reserve_order_stock(uuid) to service_role;
grant execute on function release_order_stock(uuid) to service_role;
grant execute on function expire_unpaid_orders() to service_role;
grant execute on function mark_order_paid(uuid, text) to service_role;

-- ---------------------------------------------------------------------------
-- Server-only access for products, variants, and payment events
-- ---------------------------------------------------------------------------
alter table products enable row level security;
alter table product_variants enable row level security;
alter table payment_events enable row level security;

do $$
declare
  policy record;
begin
  for policy in
    select tablename, policyname
    from pg_policies
    where schemaname = 'public'
      and tablename in ('products', 'product_variants', 'payment_events')
  loop
    execute format('drop policy if exists %I on public.%I', policy.policyname, policy.tablename);
  end loop;
end;
$$;

commit;
