-- 003_lock_orders_discounts.sql
-- The live database had public read policies on these tables under names that 002 did not know,
-- so the publishable key could still read coupon codes. The app only touches orders, order items,
-- and discounts from the server with the secret key (which bypasses RLS), so every policy on these
-- tables is removed and RLS stays on: the public key can neither read nor write them.
-- Safe to run more than once.

begin;

alter table orders enable row level security;
alter table order_items enable row level security;
alter table discounts enable row level security;

do $$
declare
  policy record;
begin
  for policy in
    select tablename, policyname
    from pg_policies
    where schemaname = 'public'
      and tablename in ('orders', 'order_items', 'discounts')
  loop
    execute format('drop policy if exists %I on public.%I', policy.policyname, policy.tablename);
  end loop;
end;
$$;

-- Test orders from launch QA were deleted; the next real order is #1001 (or follows the highest existing number).
select setval(
  pg_get_serial_sequence('orders', 'order_number'),
  greatest(1000, (select coalesce(max(order_number), 0) from orders)),
  true
);

commit;

-- Should return no rows.
select tablename, policyname, cmd, roles
from pg_policies
where schemaname = 'public'
  and tablename in ('orders', 'order_items', 'discounts');
