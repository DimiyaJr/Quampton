/*
  # Create Invoices Tables

  Creates invoices and invoice_items tables for the POS sales system.

  1. New Tables
    - `invoices`
      - `id` (uuid, primary key)
      - `invoice_code` (text, unique) - format: INV000001
      - `customer_id` (uuid) - FK to customers
      - `post_date` (date) - invoice date
      - `due_date` (date) - payment due date
      - `payment_method` (text) - cash, card, online, cheque, etc.
      - `total_amount` (numeric) - total before discount
      - `discount_amount` (numeric) - total discount
      - `net_total` (numeric) - final total after discount
      - `created_at` (timestamptz)

    - `invoice_items`
      - `id` (uuid, primary key)
      - `invoice_id` (uuid) - FK to invoices (CASCADE delete)
      - `product_id` (uuid) - FK to products (SET NULL on delete)
      - `sku` (text) - stored for reference even if product deleted
      - `product_name` (text) - stored for reference
      - `quantity` (integer)
      - `price` (numeric) - unit price at time of sale
      - `discount` (numeric) - discount percentage
      - `is_free` (boolean) - whether item is a free promotional item
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on both tables
    - Authenticated users can read/write

  3. Relationships
    - invoices.customer_id references customers(id)
    - invoice_items.invoice_id references invoices(id) CASCADE
    - invoice_items.product_id references products(id) SET NULL
*/

CREATE TABLE IF NOT EXISTS invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_code TEXT UNIQUE NOT NULL,
  customer_id UUID NOT NULL REFERENCES customers(id),
  post_date DATE DEFAULT CURRENT_DATE,
  due_date DATE,
  payment_method TEXT DEFAULT 'cash',
  total_amount NUMERIC(12, 2) DEFAULT 0,
  discount_amount NUMERIC(12, 2) DEFAULT 0,
  net_total NUMERIC(12, 2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anon can read invoices"
  ON invoices FOR SELECT
  TO anon
  USING (true);

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

CREATE TABLE IF NOT EXISTS invoice_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  sku TEXT NOT NULL,
  product_name TEXT NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  price NUMERIC(10, 2) DEFAULT 0,
  discount NUMERIC(5, 2) DEFAULT 0,
  is_free BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE invoice_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anon can read invoice_items"
  ON invoice_items FOR SELECT
  TO anon
  USING (true);

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
