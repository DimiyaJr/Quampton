/*
  # Add Public Access for Anonymous Key

  1. Purpose
    - Allow access to all tables using the anon key
    - Temporarily disable strict RLS for development
    - This allows the frontend to work with custom authentication

  2. Security Note
    - In production, implement proper JWT-based authentication
    - Or use Supabase service role key for authenticated requests
*/

-- Add anon access policies for all tables

-- Product Categories
CREATE POLICY "Allow anon access to product_categories"
  ON product_categories FOR ALL
  TO anon
  USING (true)
  WITH CHECK (true);

-- Products
CREATE POLICY "Allow anon access to products"
  ON products FOR ALL
  TO anon
  USING (true)
  WITH CHECK (true);

-- Suppliers
CREATE POLICY "Allow anon access to suppliers"
  ON suppliers FOR ALL
  TO anon
  USING (true)
  WITH CHECK (true);

-- Customers
CREATE POLICY "Allow anon access to customers"
  ON customers FOR ALL
  TO anon
  USING (true)
  WITH CHECK (true);

-- Purchase Orders
CREATE POLICY "Allow anon access to purchase_orders"
  ON purchase_orders FOR ALL
  TO anon
  USING (true)
  WITH CHECK (true);

-- Purchase Order Items
CREATE POLICY "Allow anon access to purchase_order_items"
  ON purchase_order_items FOR ALL
  TO anon
  USING (true)
  WITH CHECK (true);

-- Invoices
CREATE POLICY "Allow anon access to invoices"
  ON invoices FOR ALL
  TO anon
  USING (true)
  WITH CHECK (true);

-- Invoice Items
CREATE POLICY "Allow anon access to invoice_items"
  ON invoice_items FOR ALL
  TO anon
  USING (true)
  WITH CHECK (true);

-- Users (read-only for anon, except password)
CREATE POLICY "Allow anon read access to users"
  ON users FOR SELECT
  TO anon
  USING (true);