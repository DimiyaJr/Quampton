/*
  # Recreate create_user_with_password and update_user_password functions

  ## Summary
  These functions were missing from the database, causing 500 errors when creating users.
  Re-applies the user management functions needed by the create-user edge function.

  ## Functions
  - `create_user_with_password` - Inserts a new user with bcrypt-hashed password
  - `update_user_password` - Updates an existing user's password hash
*/

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
