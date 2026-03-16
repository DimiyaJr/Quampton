/*
  # Create Suppliers Table

  Creates the suppliers table for managing supplier records.

  1. New Tables
    - `suppliers`
      - `id` (uuid, primary key)
      - `code` (text, unique) - auto-generated code like SUP000001
      - `name` (text) - supplier name
      - `email` (text)
      - `phone` (text) - phone number
      - `address` (text)
      - `city` (text)
      - `country` (text)
      - `status` (integer) - 1=active, 0=inactive (soft delete)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS
    - Authenticated users can read/write

  3. Notes
    - Soft deletes via status field
    - Code format: SUP000001, SUP000002, etc.
*/

CREATE TABLE IF NOT EXISTS suppliers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  address TEXT,
  city TEXT,
  country TEXT,
  status INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anon can read suppliers"
  ON suppliers FOR SELECT
  TO anon
  USING (true);

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
