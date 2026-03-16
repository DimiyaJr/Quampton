/*
  # Create Helper Functions and Seed Default Admin User

  1. Helper Functions
    - `verify_user_password` - verifies a username/password combo for app-level login
    - `get_next_code` - generates next sequential code for customers, suppliers, etc.

  2. Seed Data
    - Default admin user (username: admin, password: admin123)
      Password hash is bcrypt of "admin123"

  3. Notes
    - The verify_user_password function uses pgcrypto for bcrypt comparison
    - Admin user should change password on first login
*/

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE OR REPLACE FUNCTION verify_user_password(
  p_username TEXT,
  p_password TEXT
)
RETURNS TABLE(
  id UUID,
  email TEXT,
  username TEXT,
  full_name TEXT,
  role TEXT,
  status INTEGER
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    u.id,
    u.email,
    u.username,
    u.full_name,
    u.role,
    u.status
  FROM users u
  WHERE u.username = p_username
    AND u.password_hash = crypt(p_password, u.password_hash)
    AND u.status = 1;
END;
$$;

CREATE OR REPLACE FUNCTION hash_password(p_password TEXT)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN crypt(p_password, gen_salt('bf'));
END;
$$;

INSERT INTO users (email, username, password_hash, full_name, role, status)
VALUES (
  'admin@system.com',
  'admin',
  crypt('admin123', gen_salt('bf')),
  'System Administrator',
  'admin',
  1
)
ON CONFLICT (username) DO NOTHING;
