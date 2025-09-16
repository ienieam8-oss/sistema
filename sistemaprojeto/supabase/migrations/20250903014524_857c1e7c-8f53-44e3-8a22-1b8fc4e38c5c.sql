-- Fix function search path security issue
CREATE OR REPLACE FUNCTION public.validate_user_role()
RETURNS TRIGGER AS $$
BEGIN
  -- Only allow 'user' role for new signups, admins can change roles later
  IF TG_OP = 'INSERT' AND NEW.role NOT IN ('user') THEN
    -- Check if the inserting user is an admin
    IF NOT EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE user_id = auth.uid() AND role = 'admin'
    ) THEN
      NEW.role = 'user';
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;