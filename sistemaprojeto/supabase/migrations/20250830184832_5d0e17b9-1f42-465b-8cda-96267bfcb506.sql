-- Remove all constraints that might be blocking
ALTER TABLE public.equipment_units DROP CONSTRAINT IF EXISTS equipment_units_status_check;

-- Update all existing data to use new status values
UPDATE public.equipment_units 
SET status = CASE 
  WHEN status = 'unavailable' THEN 'em_evento'
  WHEN status = 'in_use' THEN 'em_evento'
  ELSE status
END;

-- Add the new constraint
ALTER TABLE public.equipment_units 
ADD CONSTRAINT equipment_units_status_check 
CHECK (status IN ('available', 'em_evento', 'maintenance', 'locacao'));