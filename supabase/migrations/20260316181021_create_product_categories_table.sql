/*
  # Create Product Categories Table

  Creates the product_categories table for organizing products.

  1. New Tables
    - `product_categories`
      - `id` (uuid, primary key)
      - `name` (text) - category name
      - `status` (integer) - 1=active, 0=inactive
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS
    - Authenticated users can read/write
*/

CREATE TABLE IF NOT EXISTS product_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  status INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE product_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anon can read product_categories"
  ON product_categories FOR SELECT
  TO anon
  USING (true);

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
