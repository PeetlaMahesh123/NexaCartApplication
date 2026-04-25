-- Setup Fresh Database After Cleanup
-- Run this in Supabase SQL Editor AFTER running clean-database.sql

-- Step 1: Create sample products for testing (use ON CONFLICT to handle duplicates)
INSERT INTO products (id, name, description, price, image_url)
VALUES 
  ('550e8400-e29b-41d4-a716-446655440000', 'Laptop Pro', 'High-performance laptop for professionals', 99999, 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853'),
  ('550e8400-e29b-41d4-a716-446655440001', 'Wireless Mouse', 'Ergonomic wireless mouse', 1299, 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46'),
  ('550e8400-e29b-41d4-a716-446655440002', 'Mechanical Keyboard', 'RGB mechanical keyboard', 3499, 'https://images.unsplash.com/photo-1598928424272-9e667d6f58b2')
ON CONFLICT (id) DO NOTHING;

-- Step 2: Verify products exist
SELECT id, name, price FROM products ORDER BY id;

-- Step 3: Ensure foreign key constraint exists
ALTER TABLE order_items 
DROP CONSTRAINT IF EXISTS order_items_product_id_fkey;

ALTER TABLE order_items 
ADD CONSTRAINT order_items_product_id_fkey 
FOREIGN KEY (product_id) 
REFERENCES products(id) 
ON DELETE CASCADE;

-- Step 4: Enable RLS on all tables
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- Step 5: Create proper RLS policies
DROP POLICY IF EXISTS "Products are publicly viewable" ON products;
CREATE POLICY "Products are publicly viewable" ON products FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can view their own orders" ON orders;
CREATE POLICY "Users can view their own orders" ON orders FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own orders" ON orders;
CREATE POLICY "Users can insert their own orders" ON orders FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view their own order items" ON order_items;
CREATE POLICY "Users can view their own order items" ON order_items FOR SELECT USING (
  EXISTS (SELECT 1 FROM orders WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid())
);

DROP POLICY IF EXISTS "Users can insert their own order items" ON order_items;
CREATE POLICY "Users can insert their own order items" ON order_items FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM orders WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid())
);

-- ✅ Fresh database setup complete! Products and RLS policies ready.
