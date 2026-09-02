-- supabase/migrations/001_init.sql
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE profiles (
  id uuid REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  email text UNIQUE NOT NULL,
  full_name text,
  phone text,
  role text CHECK (role IN ('customer', 'admin', 'vendor')) DEFAULT 'customer',
  discount_code_used text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE products (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  title text NOT NULL,
  slug text UNIQUE NOT NULL,
  description text NOT NULL,
  editorial_story text,
  price numeric(10,2) NOT NULL,
  compare_at_price numeric(10,2),
  category text CHECK (category IN ('hoodies', 'tees', 'bottoms', 'headwear', 'accessories')) NOT NULL,
  collection text DEFAULT 'Brooklyn Heritage',
  tags text[],
  is_featured boolean DEFAULT false,
  is_drop_active boolean DEFAULT true,
  images text[],
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE product_variants (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id uuid REFERENCES products(id) ON DELETE CASCADE,
  sku text UNIQUE NOT NULL,
  size text CHECK (size IN ('XS', 'S', 'M', 'L', 'XL', '2XL', 'OS')),
  color text,
  color_hex text,
  inventory_quantity integer DEFAULT 0 CHECK (inventory_quantity >= 0),
  vendor_id text DEFAULT 'PRIMARY_NYC_VENDOR',
  vendor_sku text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE orders (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_number serial,
  stripe_session_id text UNIQUE,
  customer_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  customer_email text,
  customer_phone text,
  shipping_address jsonb,
  billing_address jsonb,
  total_amount numeric(10,2) NOT NULL,
  subtotal numeric(10,2) NOT NULL,
  discount_applied numeric(10,2) DEFAULT 0,
  discount_code text,
  status text CHECK (status IN ('pending', 'paid', 'processing', 'fulfilled', 'cancelled')) DEFAULT 'pending',
  vendor_notified boolean DEFAULT false,
  vendor_notified_at timestamptz,
  tracking_number text,
  carrier text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE order_items (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id uuid REFERENCES orders(id) ON DELETE CASCADE,
  variant_id uuid REFERENCES product_variants(id) ON DELETE SET NULL,
  product_title text,
  sku text,
  size text,
  color text,
  quantity integer CHECK (quantity > 0),
  unit_price numeric(10,2) NOT NULL
);

CREATE TABLE discounts (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  code text UNIQUE NOT NULL,
  percentage integer CHECK (percentage >= 1 AND percentage <= 100),
  is_active boolean DEFAULT true,
  max_uses integer DEFAULT 1,
  uses_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Stored procedure with atomic inventory locking
CREATE OR REPLACE FUNCTION decrement_stock(p_variant_id uuid, p_qty integer)
RETURNS boolean
LANGUAGE plpgsql
AS $$
DECLARE
  v_current_inventory integer;
BEGIN
  -- Select for update to lock the row
  SELECT inventory_quantity INTO v_current_inventory
  FROM product_variants
  WHERE id = p_variant_id
  FOR UPDATE;

  IF NOT FOUND OR v_current_inventory < p_qty THEN
    RETURN false;
  END IF;

  UPDATE product_variants
  SET inventory_quantity = inventory_quantity - p_qty
  WHERE id = p_variant_id;

  RETURN true;
END;
$$;

-- Trigger for products updated_at
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_products_modtime
BEFORE UPDATE ON products
FOR EACH ROW EXECUTE FUNCTION update_modified_column();

-- Indexes
CREATE INDEX idx_products_slug ON products(slug);
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_product_variants_product_id ON product_variants(product_id);
CREATE INDEX idx_orders_customer_id ON orders(customer_id);
CREATE INDEX idx_orders_stripe_session_id ON orders(stripe_session_id);

-- Row Level Security (RLS)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE discounts ENABLE ROW LEVEL SECURITY;

-- Products and Variants (public read for active drops, admin all)
CREATE POLICY "Public can view active products"
  ON products FOR SELECT
  USING (is_drop_active = true);

CREATE POLICY "Public can view variants of active products"
  ON product_variants FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM products
      WHERE products.id = product_variants.product_id
      AND products.is_drop_active = true
    )
  );

-- Profiles (user can read/update own, admin all)
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Orders (user can read own, admin all)
CREATE POLICY "Users can view own orders"
  ON orders FOR SELECT
  USING (auth.uid() = customer_id);

CREATE POLICY "Users can view own order items"
  ON order_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_items.order_id
      AND orders.customer_id = auth.uid()
    )
  );

-- Admins can do everything on all tables (using simple role check if authenticated)
-- Note: Assuming auth.jwt() ->> 'role' is not used here but rather the profiles table role,
-- for simplicity in this schema we might rely on a service role key for admin tasks 
-- or write a custom function is_admin(). We'll just define the policies.

CREATE FUNCTION is_admin() RETURNS boolean
LANGUAGE sql SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
$$;

CREATE POLICY "Admin can do all on products" ON products TO authenticated USING (is_admin()) WITH CHECK (is_admin());
CREATE POLICY "Admin can do all on variants" ON product_variants TO authenticated USING (is_admin()) WITH CHECK (is_admin());
CREATE POLICY "Admin can do all on profiles" ON profiles TO authenticated USING (is_admin()) WITH CHECK (is_admin());
CREATE POLICY "Admin can do all on orders" ON orders TO authenticated USING (is_admin()) WITH CHECK (is_admin());
CREATE POLICY "Admin can do all on order items" ON order_items TO authenticated USING (is_admin()) WITH CHECK (is_admin());
CREATE POLICY "Admin can do all on discounts" ON discounts TO authenticated USING (is_admin()) WITH CHECK (is_admin());
