/*
  # Add Password Verification Function

  1. Purpose
    - Create function to verify user passwords using bcrypt
    - Enable pgcrypto extension for password hashing

  2. Functions
    - verify_password: Verifies a password against stored hash
*/

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE OR REPLACE FUNCTION verify_password(user_id uuid, input_password text)
RETURNS boolean AS $$
DECLARE
  stored_hash text;
BEGIN
  SELECT password_hash INTO stored_hash
  FROM users
  WHERE id = user_id;
  
  IF stored_hash IS NULL THEN
    RETURN false;
  END IF;
  
  RETURN stored_hash = crypt(input_password, stored_hash);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;