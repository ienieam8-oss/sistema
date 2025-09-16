-- First, update existing data to match new status values
-- Convert 'unavailable' to 'em_evento' (as default mapping)
UPDATE public.equipment_units 
SET status = 'em_evento' 
WHERE status = 'unavailable';

-- Drop the existing constraint
ALTER TABLE public.equipment_units DROP CONSTRAINT IF EXISTS equipment_units_status_check;

-- Add the new constraint with the correct status values
ALTER TABLE public.equipment_units 
ADD CONSTRAINT equipment_units_status_check 
CHECK (status IN ('available', 'em_evento', 'maintenance', 'locacao'));