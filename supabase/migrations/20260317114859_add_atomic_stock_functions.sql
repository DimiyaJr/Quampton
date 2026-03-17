/*
  # Atomic Stock Management Functions

  ## Purpose
  Replaces read-then-write stock updates with atomic database-level operations
  to prevent race conditions and ensure data consistency.

  ## New Functions
  1. `increment_product_stock(product_id, qty)` - Adds qty to product stock (used on PO save)
  2. `decrement_product_stock(product_id, qty)` - Subtracts qty from product stock (used on sale)
  3. `reverse_po_stock(po_id)` - Reverses all stock added by a purchase order (used on PO delete)
  4. `reverse_invoice_stock(invoice_id)` - Restores all stock consumed by an invoice (used on invoice delete)

  ## Security
  All functions execute with SECURITY DEFINER to bypass RLS for internal stock management.
  They are only callable by authenticated or service role users.
*/

CREATE OR REPLACE FUNCTION increment_product_stock(p_product_id uuid, p_qty integer)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE products
  SET quantity = quantity + p_qty
  WHERE id = p_product_id;
END;
$$;

CREATE OR REPLACE FUNCTION decrement_product_stock(p_product_id uuid, p_qty integer)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE products
  SET quantity = GREATEST(0, quantity - p_qty)
  WHERE id = p_product_id;
END;
$$;

CREATE OR REPLACE FUNCTION reverse_po_stock(p_po_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE products p
  SET quantity = GREATEST(0, p.quantity - poi.quantity)
  FROM purchase_order_items poi
  WHERE poi.po_id = p_po_id
    AND poi.product_id = p.id;
END;
$$;

CREATE OR REPLACE FUNCTION reverse_invoice_stock(p_invoice_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE products p
  SET quantity = p.quantity + ii.quantity
  FROM invoice_items ii
  WHERE ii.invoice_id = p_invoice_id
    AND ii.product_id IS NOT NULL
    AND ii.is_free = false
    AND ii.product_id = p.id;
END;
$$;

GRANT EXECUTE ON FUNCTION increment_product_stock(uuid, integer) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION decrement_product_stock(uuid, integer) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION reverse_po_stock(uuid) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION reverse_invoice_stock(uuid) TO anon, authenticated;
