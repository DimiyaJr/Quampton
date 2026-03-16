/*
  # Add User Management Functions

  1. New Functions
    - `create_user_with_password` - Creates a new user with encrypted password
    - `update_user_password` - Updates a user's password

  2. Purpose
    - Allows admin users to create new system users
    - Allows admin users to update user passwords
    - Uses pgcrypto for secure password hashing
*/

-- Function to create a new user with password
CREATE OR REPLACE FUNCTION create_user_with_password(
  p_username text,
  p_email text,
  p_password text,
  p_full_name text DEFAULT NULL,
  p_role text DEFAULT 'cashier'
)
RETURNS uuid AS $$
DECLARE
  new_user_id uuid;
BEGIN
  INSERT INTO users (username, email, password_hash, full_name, role, status)
  VALUES (
    p_username,
    p_email,
    crypt(p_password, gen_salt('bf')),
    p_full_name,
    p_role,
    1
  )
  RETURNING id INTO new_user_id;
  
  RETURN new_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update user password
CREATE OR REPLACE FUNCTION update_user_password(
  p_user_id uuid,
  p_new_password text
)
RETURNS boolean AS $$
BEGIN
  UPDATE users
  SET password_hash = crypt(p_new_password, gen_salt('bf')),
      updated_at = now()
  WHERE id = p_user_id;
  
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;