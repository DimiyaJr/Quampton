/*
  # Create Products Table

  Creates the products table for inventory management.

  1. New Tables
    - `products`
      - `id` (uuid, primary key)
      - `sku` (text, unique) - Stock Keeping Unit
      - `name` (text) - product name
      - `category_id` (uuid) - FK to product_categories
      - `quantity` (integer) - current stock quantity
      - `cost` (numeric) - purchase/cost price
      - `price` (numeric) - selling price
      - `image` (text) - base64 image or URL
      - `max_discount` (integer) - max discount percentage allowed
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS
    - Authenticated users can read/write

  3. Relationships
    - category_id references product_categories(id), SET NULL on delete
*/

CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sku TEXT UNIQUE,
  name TEXT NOT NULL,
  category_id UUID REFERENCES product_categories(id) ON DELETE SET NULL,
  quantity INTEGER DEFAULT 0,
  cost NUMERIC(10, 2) DEFAULT 0,
  price NUMERIC(10, 2) DEFAULT 0,
  image TEXT,
  max_discount INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anon can read products"
  ON products FOR SELECT
  TO anon
  USING (true);

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
