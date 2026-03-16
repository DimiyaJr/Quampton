/*
  # Fix RLS policies for invoices and purchase orders tables

  ## Summary
  Add anon write policies for invoices, invoice_items, purchase_orders,
  and purchase_order_items to match the custom auth architecture used by this app.
*/

DO $$
BEGIN
  -- invoices
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'invoices' AND policyname = 'Anon can insert invoices') THEN
    CREATE POLICY "Anon can insert invoices" ON invoices FOR INSERT TO anon WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'invoices' AND policyname = 'Anon can update invoices') THEN
    CREATE POLICY "Anon can update invoices" ON invoices FOR UPDATE TO anon USING (true) WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'invoices' AND policyname = 'Anon can delete invoices') THEN
    CREATE POLICY "Anon can delete invoices" ON invoices FOR DELETE TO anon USING (true);
  END IF;

  -- invoice_items
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'invoice_items' AND policyname = 'Anon can insert invoice_items') THEN
    CREATE POLICY "Anon can insert invoice_items" ON invoice_items FOR INSERT TO anon WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'invoice_items' AND policyname = 'Anon can update invoice_items') THEN
    CREATE POLICY "Anon can update invoice_items" ON invoice_items FOR UPDATE TO anon USING (true) WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'invoice_items' AND policyname = 'Anon can delete invoice_items') THEN
    CREATE POLICY "Anon can delete invoice_items" ON invoice_items FOR DELETE TO anon USING (true);
  END IF;

  -- purchase_orders
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'purchase_orders' AND policyname = 'Anon can insert purchase_orders') THEN
    CREATE POLICY "Anon can insert purchase_orders" ON purchase_orders FOR INSERT TO anon WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'purchase_orders' AND policyname = 'Anon can update purchase_orders') THEN
    CREATE POLICY "Anon can update purchase_orders" ON purchase_orders FOR UPDATE TO anon USING (true) WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'purchase_orders' AND policyname = 'Anon can delete purchase_orders') THEN
    CREATE POLICY "Anon can delete purchase_orders" ON purchase_orders FOR DELETE TO anon USING (true);
  END IF;

  -- purchase_order_items
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'purchase_order_items' AND policyname = 'Anon can insert purchase_order_items') THEN
    CREATE POLICY "Anon can insert purchase_order_items" ON purchase_order_items FOR INSERT TO anon WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'purchase_order_items' AND policyname = 'Anon can update purchase_order_items') THEN
    CREATE POLICY "Anon can update purchase_order_items" ON purchase_order_items FOR UPDATE TO anon USING (true) WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'purchase_order_items' AND policyname = 'Anon can delete purchase_order_items') THEN
    CREATE POLICY "Anon can delete purchase_order_items" ON purchase_order_items FOR DELETE TO anon USING (true);
  END IF;
END $$;
