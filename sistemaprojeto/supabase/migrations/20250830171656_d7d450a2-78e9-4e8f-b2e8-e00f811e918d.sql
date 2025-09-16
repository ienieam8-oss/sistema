-- Create admin account
INSERT INTO auth.users (
  id,
  instance_id,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  role,
  aud,
  confirmation_token,
  email_change_token_new,
  recovery_token,
  raw_app_meta_data,
  raw_user_meta_data,
  is_super_admin
) VALUES (
  gen_random_uuid(),
  '00000000-0000-0000-0000-000000000000',
  'nathanrigolei@hotmail.com',
  crypt('nathan123', gen_salt('bf')),
  now(),
  now(),
  now(),
  'authenticated',
  'authenticated',
  '',
  '',
  '',
  '{"provider": "email", "providers": ["email"]}',
  '{"full_name": "Nathan Admin", "role": "admin"}',
  false
);

-- Create admin profile automatically
INSERT INTO public.profiles (user_id, email, full_name, role)
SELECT 
  u.id,
  u.email,
  'Nathan Admin',
  'admin'
FROM auth.users u 
WHERE u.email = 'nathanrigolei@hotmail.com'
ON CONFLICT (user_id) DO UPDATE SET
  full_name = 'Nathan Admin',
  role = 'admin';