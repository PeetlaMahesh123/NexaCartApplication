-- Clean Database - Delete All Default Data Except Admin/Users
-- Run this in Supabase SQL Editor

-- ⚠️ WARNING: This will permanently delete ALL products, orders, payments, and order data
-- Only admin and user authentication data will be preserved

-- Step 1: Delete all order items (due to foreign key constraints)
DELETE FROM order_items;

-- Step 2: Delete all orders
DELETE FROM orders;

-- Step 3: Delete all payments (if payments table exists)
DELETE FROM payments WHERE EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'payments');

-- Step 4: Delete all products (this is the main cleanup)
DELETE FROM products;

-- Step 5: Delete any categories if they exist
DELETE FROM categories WHERE EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'categories');

-- Step 6: Verify cleanup - show remaining records
SELECT 'Products' as table_name, COUNT(*) as remaining_records FROM products
UNION ALL
SELECT 'Orders', COUNT(*) FROM orders
UNION ALL
SELECT 'Order Items', COUNT(*) FROM order_items
UNION ALL
SELECT 'Payments', COUNT(*) FROM payments WHERE EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'payments')
UNION ALL
SELECT 'Categories', COUNT(*) FROM categories WHERE EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'categories')
UNION ALL
SELECT 'Auth Users', COUNT(*) FROM auth.users;

-- Step 7: Reset auto-increment sequences (if using integer IDs)
-- ALTER SEQUENCE products_id_seq RESTART WITH 1;
-- ALTER SEQUENCE orders_id_seq RESTART WITH 1;
-- ALTER SEQUENCE order_items_id_seq RESTART WITH 1;

-- ✅ Database cleaned! Only admin and user authentication data remains.
-- Admin can now add fresh products through the admin panel.
