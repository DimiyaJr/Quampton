/*
  # Create Customers Table

  Creates the customers table for managing customer records in the POS system.

  1. New Tables
    - `customers`
      - `id` (uuid, primary key)
      - `code` (text, unique) - auto-generated code like CUS000001
      - `name` (text) - customer full name
      - `email` (text) - email address
      - `contact` (text) - phone/contact number
      - `address` (text) - street address
      - `city` (text)
      - `country` (text)
      - `status` (integer) - 1=active, 0=inactive (soft delete)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS
    - Anon and authenticated users can read/write (app-level auth controls access)

  3. Notes
    - Soft deletes via status field
    - Code format: CUS000001, CUS000002, etc.
*/

CREATE TABLE IF NOT EXISTS customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  email TEXT,
  contact TEXT,
  address TEXT,
  city TEXT,
  country TEXT,
  status INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE customers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anon can read customers"
  ON customers FOR SELECT
  TO anon
  USING (true);

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
