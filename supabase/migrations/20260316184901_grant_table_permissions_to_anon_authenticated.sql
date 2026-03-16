/*
  # Grant table permissions to anon and authenticated roles

  ## Summary
  RLS policies were in place but the underlying table privileges were missing.
  In Supabase, RLS policies control row-level access but the roles still need
  explicit GRANT permissions to even attempt access.

  This migration grants SELECT, INSERT, UPDATE, DELETE on all application tables
  to both the `anon` and `authenticated` roles so that RLS policies can take effect.

  ## Tables
  - product_categories
  - suppliers
  - customers
  - products
  - users
  - invoices
  - invoice_items
  - purchase_orders
  - purchase_order_items
*/

GRANT USAGE ON SCHEMA public TO anon, authenticated;

GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE product_categories TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE suppliers TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE customers TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE products TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE users TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE invoices TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE invoice_items TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE purchase_orders TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE purchase_order_items TO anon, authenticated;
