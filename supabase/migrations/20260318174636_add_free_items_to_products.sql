/*
  # Add free_items column to products table

  ## Summary
  Adds a `free_items` JSONB column to the `products` table to store configurable
  free item promotions per product.

  ## Changes
  - `products` table
    - New column: `free_items` (jsonb, nullable, default null)
      - Stores an array of objects: [{ product_id, product_name, sku, quantity }]
      - When a product is added to a POS sale, these free items are auto-added to cart
      - Replaces previous hardcoded promotional logic

  ## Notes
  - Nullable so existing products are unaffected
  - No RLS changes needed; inherits existing table policies
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products' AND column_name = 'free_items'
  ) THEN
    ALTER TABLE products ADD COLUMN free_items jsonb DEFAULT NULL;
  END IF;
END $$;
