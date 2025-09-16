-- Fix critical data exposure by updating RLS policies

-- Update employee_payments policies to require authentication
DROP POLICY IF EXISTS "Employee payments are viewable by authenticated users" ON public.employee_payments;
CREATE POLICY "Employee payments are viewable by authenticated users" 
ON public.employee_payments 
FOR SELECT 
TO authenticated
USING (true);

-- Update employee_dailies policies to require authentication  
DROP POLICY IF EXISTS "Employee dailies are viewable by authenticated users" ON public.employee_dailies;
CREATE POLICY "Employee dailies are viewable by authenticated users"
ON public.employee_dailies 
FOR SELECT 
TO authenticated
USING (true);

-- Update event_equipment_items policies to require authentication
DROP POLICY IF EXISTS "Event equipment items are viewable by authenticated users" ON public.event_equipment_items;
CREATE POLICY "Event equipment items are viewable by authenticated users"
ON public.event_equipment_items 
FOR SELECT 
TO authenticated
USING (true);

-- Restrict profiles access - users can only see their own profile, admins can see all
DROP POLICY IF EXISTS "Profiles are viewable by authenticated users" ON public.profiles;
CREATE POLICY "Users can view their own profile"
ON public.profiles 
FOR SELECT 
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all profiles"
ON public.profiles 
FOR SELECT 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p 
    WHERE p.user_id = auth.uid() AND p.role = 'admin'
  )
);

-- Restrict company_settings to admin users only
DROP POLICY IF EXISTS "Company settings are viewable by authenticated users" ON public.company_settings;
CREATE POLICY "Only admins can view company settings"
ON public.company_settings 
FOR SELECT 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p 
    WHERE p.user_id = auth.uid() AND p.role = 'admin'
  )
);

-- Add role validation trigger to prevent arbitrary role assignment
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for role validation
DROP TRIGGER IF EXISTS validate_user_role_trigger ON public.profiles;
CREATE TRIGGER validate_user_role_trigger
  BEFORE INSERT OR UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_user_role();