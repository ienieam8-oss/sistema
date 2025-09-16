-- Create profiles table for user data
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  email TEXT NOT NULL,
  full_name TEXT,
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('admin', 'secretary', 'user')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create policies for profiles
CREATE POLICY "Profiles are viewable by everyone" 
ON public.profiles 
FOR SELECT 
USING (true);

CREATE POLICY "Users can update their own profile" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile" 
ON public.profiles 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Create company_settings table
CREATE TABLE public.company_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_name TEXT NOT NULL DEFAULT 'EventPro Eventos',
  address TEXT NOT NULL DEFAULT 'Rua das Flores, 123 - São Paulo, SP',
  phone TEXT NOT NULL DEFAULT '(11) 99999-9999',
  email TEXT NOT NULL DEFAULT 'contato@eventpro.com.br',
  cnpj TEXT NOT NULL DEFAULT '12.345.678/0001-90',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.company_settings ENABLE ROW LEVEL SECURITY;

-- Create policies for company settings (only admin can edit)
CREATE POLICY "Company settings are viewable by everyone" 
ON public.company_settings 
FOR SELECT 
USING (true);

CREATE POLICY "Only admins can update company settings" 
ON public.company_settings 
FOR UPDATE 
USING (EXISTS (
  SELECT 1 FROM public.profiles 
  WHERE user_id = auth.uid() AND role = 'admin'
));

-- Create employees table
CREATE TABLE public.employees (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('fixed', 'freelancer')),
  position TEXT, -- cargo for fixed employees
  fixed_salary DECIMAL(10,2), -- salário fixo
  additional_value DECIMAL(10,2) DEFAULT 0, -- valor adicional
  daily_rate DECIMAL(10,2), -- valor diária for freelancers
  event_name TEXT, -- nome do evento for freelancers
  hire_date DATE, -- data contratação for freelancers
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'completed')),
  events_this_month INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;

-- Create policies for employees
CREATE POLICY "Employees are viewable by authenticated users" 
ON public.employees 
FOR SELECT 
TO authenticated
USING (true);

CREATE POLICY "Only admins and secretaries can manage employees" 
ON public.employees 
FOR ALL 
TO authenticated
USING (EXISTS (
  SELECT 1 FROM public.profiles 
  WHERE user_id = auth.uid() AND role IN ('admin', 'secretary')
));

-- Create equipment table
CREATE TABLE public.equipment (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('som', 'luz', 'video')),
  weight DECIMAL(10,2) NOT NULL, -- peso em kg
  dimensions TEXT NOT NULL, -- dimensões em texto "LxWxH"
  total_quantity INTEGER NOT NULL DEFAULT 1,
  available_quantity INTEGER NOT NULL DEFAULT 1,
  maintenance_quantity INTEGER DEFAULT 0,
  unavailable_quantity INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CHECK (total_quantity = available_quantity + maintenance_quantity + unavailable_quantity)
);

-- Enable RLS
ALTER TABLE public.equipment ENABLE ROW LEVEL SECURITY;

-- Create policies for equipment
CREATE POLICY "Equipment is viewable by authenticated users" 
ON public.equipment 
FOR SELECT 
TO authenticated
USING (true);

CREATE POLICY "Only admins and secretaries can manage equipment" 
ON public.equipment 
FOR ALL 
TO authenticated
USING (EXISTS (
  SELECT 1 FROM public.profiles 
  WHERE user_id = auth.uid() AND role IN ('admin', 'secretary')
));

-- Create equipment_units table for individual equipment tracking
CREATE TABLE public.equipment_units (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  equipment_id UUID NOT NULL REFERENCES public.equipment(id) ON DELETE CASCADE,
  unit_identifier TEXT NOT NULL, -- "Unidade #1", "Unidade #2", etc.
  status TEXT NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'maintenance', 'unavailable', 'in_event', 'rented')),
  current_event_id UUID, -- reference to event when in use
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(equipment_id, unit_identifier)
);

-- Enable RLS
ALTER TABLE public.equipment_units ENABLE ROW LEVEL SECURITY;

-- Create policies for equipment units
CREATE POLICY "Equipment units are viewable by authenticated users" 
ON public.equipment_units 
FOR SELECT 
TO authenticated
USING (true);

CREATE POLICY "Only admins and secretaries can manage equipment units" 
ON public.equipment_units 
FOR ALL 
TO authenticated
USING (EXISTS (
  SELECT 1 FROM public.profiles 
  WHERE user_id = auth.uid() AND role IN ('admin', 'secretary')
));

-- Create events table
CREATE TABLE public.events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_name TEXT NOT NULL,
  event_location TEXT NOT NULL,
  setup_date DATE NOT NULL,
  event_date DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'planned' CHECK (status IN ('planned', 'in_progress', 'completed', 'cancelled')),
  total_cost DECIMAL(10,2) DEFAULT 0,
  notes TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

-- Create policies for events
CREATE POLICY "Events are viewable by authenticated users" 
ON public.events 
FOR SELECT 
TO authenticated
USING (true);

CREATE POLICY "Only admins and secretaries can manage events" 
ON public.events 
FOR ALL 
TO authenticated
USING (EXISTS (
  SELECT 1 FROM public.profiles 
  WHERE user_id = auth.uid() AND role IN ('admin', 'secretary')
));

-- Create event_equipment table for equipment assigned to events
CREATE TABLE public.event_equipment (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  equipment_unit_id UUID NOT NULL REFERENCES public.equipment_units(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(event_id, equipment_unit_id)
);

-- Enable RLS
ALTER TABLE public.event_equipment ENABLE ROW LEVEL SECURITY;

-- Create policies for event equipment
CREATE POLICY "Event equipment is viewable by authenticated users" 
ON public.event_equipment 
FOR SELECT 
TO authenticated
USING (true);

CREATE POLICY "Only admins and secretaries can manage event equipment" 
ON public.event_equipment 
FOR ALL 
TO authenticated
USING (EXISTS (
  SELECT 1 FROM public.profiles 
  WHERE user_id = auth.uid() AND role IN ('admin', 'secretary')
));

-- Insert default company settings
INSERT INTO public.company_settings (company_name, address, phone, email, cnpj) 
VALUES ('EventPro Eventos', 'Rua das Flores, 123 - São Paulo, SP', '(11) 99999-9999', 'contato@eventpro.com.br', '12.345.678/0001-90');

-- Create trigger function for updating timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_company_settings_updated_at
BEFORE UPDATE ON public.company_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_employees_updated_at
BEFORE UPDATE ON public.employees
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_equipment_updated_at
BEFORE UPDATE ON public.equipment
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_equipment_units_updated_at
BEFORE UPDATE ON public.equipment_units
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_events_updated_at
BEFORE UPDATE ON public.events
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user registration
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();