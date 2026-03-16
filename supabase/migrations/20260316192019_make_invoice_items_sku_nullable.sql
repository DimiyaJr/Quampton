/*
  # Make invoice_items.sku nullable

  Products do not always have a SKU value (the products.sku column is nullable).
  When a product without a SKU is added to the POS cart and checked out, the insert
  into invoice_items fails because sku is NOT NULL. This migration relaxes that
  constraint so invoices can be saved regardless.

  1. Changes
    - `invoice_items.sku` — changed from NOT NULL to nullable
*/

ALTER TABLE invoice_items ALTER COLUMN sku DROP NOT NULL;
