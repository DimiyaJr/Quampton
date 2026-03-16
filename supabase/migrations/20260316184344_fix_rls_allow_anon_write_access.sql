/*
  # Fix RLS policies to allow anon write access

  ## Summary
  This app uses a custom authentication system (custom users table + custom tokens)
  rather than Supabase Auth. All requests arrive as the `anon` role.
  
  Existing policies only allow `authenticated` role for writes, causing 401 errors.
  This migration adds INSERT, UPDATE, DELETE policies for the `anon` role on all
  relevant tables.

  ## Tables affected
  - product_categories
  - suppliers
  - customers
  - products
  - users
*/

DO $$
BEGIN
  -- product_categories
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'product_categories' AND policyname = 'Anon can insert product_categories') THEN
    CREATE POLICY "Anon can insert product_categories" ON product_categories FOR INSERT TO anon WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'product_categories' AND policyname = 'Anon can update product_categories') THEN
    CREATE POLICY "Anon can update product_categories" ON product_categories FOR UPDATE TO anon USING (true) WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'product_categories' AND policyname = 'Anon can delete product_categories') THEN
    CREATE POLICY "Anon can delete product_categories" ON product_categories FOR DELETE TO anon USING (true);
  END IF;

  -- suppliers
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'suppliers' AND policyname = 'Anon can insert suppliers') THEN
    CREATE POLICY "Anon can insert suppliers" ON suppliers FOR INSERT TO anon WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'suppliers' AND policyname = 'Anon can update suppliers') THEN
    CREATE POLICY "Anon can update suppliers" ON suppliers FOR UPDATE TO anon USING (true) WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'suppliers' AND policyname = 'Anon can delete suppliers') THEN
    CREATE POLICY "Anon can delete suppliers" ON suppliers FOR DELETE TO anon USING (true);
  END IF;

  -- customers
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'customers' AND policyname = 'Anon can insert customers') THEN
    CREATE POLICY "Anon can insert customers" ON customers FOR INSERT TO anon WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'customers' AND policyname = 'Anon can update customers') THEN
    CREATE POLICY "Anon can update customers" ON customers FOR UPDATE TO anon USING (true) WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'customers' AND policyname = 'Anon can delete customers') THEN
    CREATE POLICY "Anon can delete customers" ON customers FOR DELETE TO anon USING (true);
  END IF;

  -- products
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'products' AND policyname = 'Anon can insert products') THEN
    CREATE POLICY "Anon can insert products" ON products FOR INSERT TO anon WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'products' AND policyname = 'Anon can update products') THEN
    CREATE POLICY "Anon can update products" ON products FOR UPDATE TO anon USING (true) WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'products' AND policyname = 'Anon can delete products') THEN
    CREATE POLICY "Anon can delete products" ON products FOR DELETE TO anon USING (true);
  END IF;

  -- users
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'users' AND policyname = 'Anon can insert users') THEN
    CREATE POLICY "Anon can insert users" ON users FOR INSERT TO anon WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'users' AND policyname = 'Anon can update users') THEN
    CREATE POLICY "Anon can update users" ON users FOR UPDATE TO anon USING (true) WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'users' AND policyname = 'Anon can delete users') THEN
    CREATE POLICY "Anon can delete users" ON users FOR DELETE TO anon USING (true);
  END IF;
END $$;
