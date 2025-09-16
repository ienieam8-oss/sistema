-- Add setup_time column to events table
ALTER TABLE public.events 
ADD COLUMN setup_time time;

-- Update equipment_units quantities calculation function
CREATE OR REPLACE FUNCTION public.update_equipment_quantities()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
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