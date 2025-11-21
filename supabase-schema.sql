-- Stryker Christmas Store Database Schema
-- Run this SQL in your Supabase SQL Editor to set up the database

-- Products table
CREATE TABLE IF NOT EXISTS products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  thumbnail_url TEXT,
  specs TEXT,
  category TEXT NOT NULL CHECK (category IN ('choice1', 'choice2')),
  requires_color BOOLEAN DEFAULT FALSE,
  requires_size BOOLEAN DEFAULT FALSE,
  available_colors TEXT[], -- Array of color options
  available_sizes TEXT[], -- Array of size options
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Orders table
CREATE TABLE IF NOT EXISTS orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  order_number TEXT UNIQUE NOT NULL,
  shipping_name TEXT NOT NULL,
  shipping_address TEXT NOT NULL,
  shipping_city TEXT NOT NULL,
  shipping_state TEXT NOT NULL,
  shipping_zip TEXT NOT NULL,
  shipping_country TEXT DEFAULT 'USA',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(email) -- Prevent duplicate orders by email
);

-- Order items table
CREATE TABLE IF NOT EXISTS order_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id),
  product_name TEXT NOT NULL, -- Denormalized for easier export
  color TEXT,
  size TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_orders_email ON orders(email);
CREATE INDEX IF NOT EXISTS idx_orders_order_number ON orders(order_number);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);

-- Enable Row Level Security (RLS)
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- Policies for products (public read access)
CREATE POLICY "Products are viewable by everyone"
  ON products FOR SELECT
  USING (true);

-- Policies for orders (users can only see their own orders, but we'll handle this in API)
CREATE POLICY "Orders are insertable by authenticated users"
  ON orders FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Orders are viewable by everyone" -- Admin will use service key
  ON orders FOR SELECT
  USING (true);

-- Policies for order_items
CREATE POLICY "Order items are insertable"
  ON order_items FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Order items are viewable by everyone"
  ON order_items FOR SELECT
  USING (true);

-- Sample products (you can add more via Supabase dashboard or API)
-- Choice 1 Products (Apparel)
INSERT INTO products (name, description, category, requires_color, requires_size, available_colors, available_sizes) VALUES
('Stryker Logo T-Shirt', 'Comfortable cotton t-shirt with Stryker logo', 'choice1', true, true, ARRAY['Red', 'Blue', 'Black', 'White'], ARRAY['S', 'M', 'L', 'XL', 'XXL']),
('Stryker Hoodie', 'Warm and cozy hoodie perfect for the holidays', 'choice1', true, true, ARRAY['Navy', 'Gray', 'Black'], ARRAY['M', 'L', 'XL', 'XXL']),
('Stryker Polo Shirt', 'Professional polo shirt for business casual', 'choice1', true, true, ARRAY['Navy', 'White', 'Gray'], ARRAY['S', 'M', 'L', 'XL']);

-- Choice 2 Products (Kits)
INSERT INTO products (name, description, category, requires_color, requires_size, available_colors, available_sizes) VALUES
('Holiday Gift Kit', 'Complete holiday gift set with multiple items', 'choice2', false, false, NULL, NULL),
('Tech Accessories Kit', 'Collection of tech accessories and gadgets', 'choice2', false, false, NULL, NULL),
('Office Essentials Kit', 'Everything you need for your workspace', 'choice2', true, false, ARRAY['Black', 'Silver'], NULL);

