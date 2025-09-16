-- Fix critical data exposure by restricting RLS policies to admin/secretary only
-- Remove overly broad policies that allow anyone to view sensitive data

-- Drop existing overly permissive policies
DROP POLICY IF EXISTS "Employee dailies are viewable by authenticated users" ON public.employee_dailies;
DROP POLICY IF EXISTS "Employee payments are viewable by authenticated users" ON public.employee_payments;
DROP POLICY IF EXISTS "Employees are viewable by authenticated users" ON public.employees;
DROP POLICY IF EXISTS "Events are viewable by authenticated users" ON public.events;
DROP POLICY IF EXISTS "Equipment is viewable by authenticated users" ON public.equipment;
DROP POLICY IF EXISTS "Equipment units are viewable by authenticated users" ON public.equipment_units;
DROP POLICY IF EXISTS "Event equipment is viewable by authenticated users" ON public.event_equipment;
DROP POLICY IF EXISTS "Event equipment items are viewable by authenticated users" ON public.event_equipment_items;

-- Create security definer function to get current user role (fixes infinite recursion)
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS TEXT
LANGUAGE SQL
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT role FROM public.profiles WHERE user_id = auth.uid();
$$;

-- Drop existing problematic profiles policies
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;

-- Create new secure policy for admin profile viewing (user profile policy already exists)
CREATE POLICY "Admins can view all profiles"
ON public.profiles
FOR SELECT 
USING (public.get_current_user_role() = 'admin');

-- Create restrictive policies for sensitive employee data
CREATE POLICY "Only admins and secretaries can view employee dailies"
ON public.employee_dailies
FOR SELECT 
USING (public.get_current_user_role() IN ('admin', 'secretary'));

CREATE POLICY "Only admins and secretaries can view employee payments"
ON public.employee_payments
FOR SELECT 
USING (public.get_current_user_role() IN ('admin', 'secretary'));

CREATE POLICY "Only admins and secretaries can view employees"
ON public.employees
FOR SELECT 
USING (public.get_current_user_role() IN ('admin', 'secretary'));

-- Create restrictive policies for events (business critical data)
CREATE POLICY "Only admins and secretaries can view events"
ON public.events
FOR SELECT 
USING (public.get_current_user_role() IN ('admin', 'secretary'));

-- Create restrictive policies for equipment data
CREATE POLICY "Only admins and secretaries can view equipment"
ON public.equipment
FOR SELECT 
USING (public.get_current_user_role() IN ('admin', 'secretary'));

CREATE POLICY "Only admins and secretaries can view equipment units"
ON public.equipment_units
FOR SELECT 
USING (public.get_current_user_role() IN ('admin', 'secretary'));

CREATE POLICY "Only admins and secretaries can view event equipment"
ON public.event_equipment
FOR SELECT 
USING (public.get_current_user_role() IN ('admin', 'secretary'));

CREATE POLICY "Only admins and secretaries can view event equipment items"
ON public.event_equipment_items
FOR SELECT 
USING (public.get_current_user_role() IN ('admin', 'secretary'));

-- Enhance role validation trigger to prevent privilege escalation
CREATE OR REPLACE FUNCTION public.validate_user_role()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- For INSERT operations, only allow 'user' role unless inserting user is admin
  IF TG_OP = 'INSERT' THEN
    IF NEW.role NOT IN ('user') THEN
      -- Check if the inserting user is an admin
      IF NOT EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE user_id = auth.uid() AND role = 'admin'
      ) THEN
        NEW.role = 'user';
      END IF;
    END IF;
  END IF;
  
  -- For UPDATE operations, only allow role changes by admins
  IF TG_OP = 'UPDATE' THEN
    IF OLD.role != NEW.role THEN
      -- Only admins can change roles
      IF NOT EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE user_id = auth.uid() AND role = 'admin'
      ) THEN
        NEW.role = OLD.role; -- Revert role change
      END IF;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger for role validation
DROP TRIGGER IF EXISTS validate_role_trigger ON public.profiles;
CREATE TRIGGER validate_role_trigger
  BEFORE INSERT OR UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_user_role();