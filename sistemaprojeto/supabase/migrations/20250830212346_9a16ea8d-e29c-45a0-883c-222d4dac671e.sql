-- Create table for event equipment with quantities
CREATE TABLE public.event_equipment_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID NOT NULL,
  equipment_id UUID NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.event_equipment_items ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Event equipment items are viewable by authenticated users" 
ON public.event_equipment_items 
FOR SELECT 
USING (true);

CREATE POLICY "Only admins and secretaries can manage event equipment items" 
ON public.event_equipment_items 
FOR ALL 
USING (EXISTS ( SELECT 1
   FROM profiles
  WHERE ((profiles.user_id = auth.uid()) AND (profiles.role = ANY (ARRAY['admin'::text, 'secretary'::text])))));

-- Add trigger for automatic timestamp updates
CREATE TRIGGER update_event_equipment_items_updated_at
BEFORE UPDATE ON public.event_equipment_items
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();