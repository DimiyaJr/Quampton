/*
  # Update RLS Policies for All Tables

  1. Purpose
    - Make all tables accessible to authenticated users
    - Allow read access for all authenticated users
    - Allow write access for authenticated users
    - Simplify policies for better performance

  2. Tables Updated
    - product_categories
    - products
    - suppliers
    - customers
    - purchase_orders
    - purchase_order_items
    - invoices
    - invoice_items

  3. Security
    - All policies require authentication
    - No public access without login
*/

-- Drop existing restrictive policies and add simple authenticated user policies

-- Product Categories Policies
DROP POLICY IF EXISTS "Enable read access for all users" ON product_categories;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON product_categories;
DROP POLICY IF EXISTS "Enable update for authenticated users only" ON product_categories;
DROP POLICY IF EXISTS "Enable delete for authenticated users only" ON product_categories;

CREATE POLICY "Authenticated users can read product_categories"
  ON product_categories FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert product_categories"
  ON product_categories FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update product_categories"
  ON product_categories FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete product_categories"
  ON product_categories FOR DELETE
  TO authenticated
  USING (true);

-- Products Policies
DROP POLICY IF EXISTS "Enable read access for all users" ON products;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON products;
DROP POLICY IF EXISTS "Enable update for authenticated users only" ON products;
DROP POLICY IF EXISTS "Enable delete for authenticated users only" ON products;

CREATE POLICY "Authenticated users can read products"
  ON products FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert products"
  ON products FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update products"
  ON products FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete products"
  ON products FOR DELETE
  TO authenticated
  USING (true);

-- Suppliers Policies
DROP POLICY IF EXISTS "Enable read access for all users" ON suppliers;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON suppliers;
DROP POLICY IF EXISTS "Enable update for authenticated users only" ON suppliers;
DROP POLICY IF EXISTS "Enable delete for authenticated users only" ON suppliers;

CREATE POLICY "Authenticated users can read suppliers"
  ON suppliers FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert suppliers"
  ON suppliers FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update suppliers"
  ON suppliers FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete suppliers"
  ON suppliers FOR DELETE
  TO authenticated
  USING (true);

-- Customers Policies
DROP POLICY IF EXISTS "Enable read access for all users" ON customers;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON customers;
DROP POLICY IF EXISTS "Enable update for authenticated users only" ON customers;
DROP POLICY IF EXISTS "Enable delete for authenticated users only" ON customers;

CREATE POLICY "Authenticated users can read customers"
  ON customers FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert customers"
  ON customers FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update customers"
  ON customers FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete customers"
  ON customers FOR DELETE
  TO authenticated
  USING (true);

-- Purchase Orders Policies
DROP POLICY IF EXISTS "Enable read access for all users" ON purchase_orders;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON purchase_orders;
DROP POLICY IF EXISTS "Enable update for authenticated users only" ON purchase_orders;
DROP POLICY IF EXISTS "Enable delete for authenticated users only" ON purchase_orders;

CREATE POLICY "Authenticated users can read purchase_orders"
  ON purchase_orders FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert purchase_orders"
  ON purchase_orders FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update purchase_orders"
  ON purchase_orders FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete purchase_orders"
  ON purchase_orders FOR DELETE
  TO authenticated
  USING (true);

-- Purchase Order Items Policies
DROP POLICY IF EXISTS "Enable read access for all users" ON purchase_order_items;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON purchase_order_items;
DROP POLICY IF EXISTS "Enable update for authenticated users only" ON purchase_order_items;
DROP POLICY IF EXISTS "Enable delete for authenticated users only" ON purchase_order_items;

CREATE POLICY "Authenticated users can read purchase_order_items"
  ON purchase_order_items FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert purchase_order_items"
  ON purchase_order_items FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update purchase_order_items"
  ON purchase_order_items FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete purchase_order_items"
  ON purchase_order_items FOR DELETE
  TO authenticated
  USING (true);

-- Invoices Policies
DROP POLICY IF EXISTS "Enable read access for all users" ON invoices;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON invoices;
DROP POLICY IF EXISTS "Enable update for authenticated users only" ON invoices;
DROP POLICY IF EXISTS "Enable delete for authenticated users only" ON invoices;

CREATE POLICY "Authenticated users can read invoices"
  ON invoices FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert invoices"
  ON invoices FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update invoices"
  ON invoices FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete invoices"
  ON invoices FOR DELETE
  TO authenticated
  USING (true);

-- Invoice Items Policies
DROP POLICY IF EXISTS "Enable read access for all users" ON invoice_items;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON invoice_items;
DROP POLICY IF EXISTS "Enable update for authenticated users only" ON invoice_items;
DROP POLICY IF EXISTS "Enable delete for authenticated users only" ON invoice_items;

CREATE POLICY "Authenticated users can read invoice_items"
  ON invoice_items FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert invoice_items"
  ON invoice_items FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update invoice_items"
  ON invoice_items FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete invoice_items"
  ON invoice_items FOR DELETE
  TO authenticated
  USING (true);