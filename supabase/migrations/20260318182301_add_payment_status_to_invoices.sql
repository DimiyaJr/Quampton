/*
  # Add payment_status to invoices table

  ## Summary
  Adds a `payment_status` column to track whether an invoice has been paid.

  ## Changes
  - `invoices` table
    - New column: `payment_status` (text, default 'not_paid')
      - Allowed values: 'not_paid', 'partial', 'paid'
      - All existing invoices default to 'not_paid'

  ## Notes
  - No RLS changes needed; inherits existing table policies
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'invoices' AND column_name = 'payment_status'
  ) THEN
    ALTER TABLE invoices ADD COLUMN payment_status text NOT NULL DEFAULT 'not_paid';
  END IF;
END $$;
