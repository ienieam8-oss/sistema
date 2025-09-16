-- Create employee_dailies table for tracking freelancer and employee daily services
CREATE TABLE public.employee_dailies (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  event_id UUID REFERENCES public.events(id) ON DELETE SET NULL,
  service_date DATE NOT NULL,
  daily_value NUMERIC NOT NULL DEFAULT 0,
  additional_value NUMERIC DEFAULT 0,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'planned' CHECK (status IN ('planned', 'confirmed', 'completed', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.employee_dailies ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Employee dailies are viewable by authenticated users" 
ON public.employee_dailies 
FOR SELECT 
USING (true);

CREATE POLICY "Only admins and secretaries can manage employee dailies" 
ON public.employee_dailies 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM profiles 
  WHERE user_id = auth.uid() 
  AND role IN ('admin', 'secretary')
));

-- Add trigger for updated_at
CREATE TRIGGER update_employee_dailies_updated_at
BEFORE UPDATE ON public.employee_dailies
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();