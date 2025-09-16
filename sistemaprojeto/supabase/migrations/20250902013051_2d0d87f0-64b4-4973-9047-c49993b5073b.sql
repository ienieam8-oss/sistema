-- Priority 1: Fix Critical Data Exposure
-- Update company_settings RLS policy to require authentication
DROP POLICY IF EXISTS "Company settings are viewable by everyone" ON public.company_settings;
CREATE POLICY "Company settings are viewable by authenticated users" 
ON public.company_settings 
FOR SELECT 
TO authenticated
USING (true);

-- Update profiles RLS policy to require authentication  
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;
CREATE POLICY "Profiles are viewable by authenticated users" 
ON public.profiles 
FOR SELECT 
TO authenticated
USING (true);

-- Priority 2: Enhance Database Function Security
-- Update handle_new_user function to include proper search_path
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER 
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email, full_name, role)
  VALUES (
    NEW.id, 
    NEW.email, 
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''), 
    COALESCE(NEW.raw_user_meta_data->>'role', 'user')
  );
  RETURN NEW;
END;
$$;

-- Update update_equipment_quantities function to include proper search_path
CREATE OR REPLACE FUNCTION public.update_equipment_quantities()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    equipment_record RECORD;
BEGIN
    FOR equipment_record IN SELECT id FROM public.equipment LOOP
        UPDATE public.equipment
        SET 
            available_quantity = (
                SELECT COUNT(*) FROM public.equipment_units 
                WHERE equipment_id = equipment_record.id AND status = 'available'
            ),
            maintenance_quantity = (
                SELECT COUNT(*) FROM public.equipment_units 
                WHERE equipment_id = equipment_record.id AND status = 'maintenance'
            ),
            unavailable_quantity = (
                SELECT COUNT(*) FROM public.equipment_units 
                WHERE equipment_id = equipment_record.id AND status IN ('unavailable', 'em_evento', 'locacao', 'in_use')
            )
        WHERE id = equipment_record.id;
    END LOOP;
END;
$$;