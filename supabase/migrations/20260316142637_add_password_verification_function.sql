/*
  # Add Password Verification Function

  1. New Functions
    - `verify_password` - Verifies a password against the stored hash using pgcrypto

  2. Purpose
    - Allows secure password verification for user login
    - Uses pgcrypto's crypt function to compare passwords
*/

-- Create password verification function
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