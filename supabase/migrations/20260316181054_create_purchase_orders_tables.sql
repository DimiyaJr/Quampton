/*
  # Create Purchase Orders Tables

  Creates purchase_orders and purchase_order_items tables for managing inventory procurement.

  1. New Tables
    - `purchase_orders`
      - `id` (uuid, primary key)
      - `po_code` (text, unique) - format: PO000001
      - `supplier_id` (uuid) - FK to suppliers
      - `total_cost` (numeric) - total order cost
      - `created_at` (timestamptz)

    - `purchase_order_items`
      - `id` (uuid, primary key)
      - `po_id` (uuid) - FK to purchase_orders (CASCADE delete)
      - `product_id` (uuid) - FK to products
      - `quantity` (integer)
      - `cost` (numeric) - unit cost at time of purchase
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on both tables
    - Authenticated users can read/write

  3. Relationships
    - purchase_orders.supplier_id references suppliers(id)
    - purchase_order_items.po_id references purchase_orders(id) CASCADE
    - purchase_order_items.product_id references products(id)
*/

CREATE TABLE IF NOT EXISTS purchase_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  po_code TEXT UNIQUE NOT NULL,
  supplier_id UUID NOT NULL REFERENCES suppliers(id),
  total_cost NUMERIC(12, 2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE purchase_orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anon can read purchase_orders"
  ON purchase_orders FOR SELECT
  TO anon
  USING (true);

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

CREATE TABLE IF NOT EXISTS purchase_order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  po_id UUID NOT NULL REFERENCES purchase_orders(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id),
  quantity INTEGER NOT NULL DEFAULT 1,
  cost NUMERIC(10, 2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE purchase_order_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anon can read purchase_order_items"
  ON purchase_order_items FOR SELECT
  TO anon
  USING (true);

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
