-- Adicionar tabela de pagamentos para controle de débitos dos freelancers
CREATE TABLE IF NOT EXISTS public.employee_payments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  payment_date DATE NOT NULL,
  amount NUMERIC NOT NULL DEFAULT 0,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS na tabela de pagamentos
ALTER TABLE public.employee_payments ENABLE ROW LEVEL SECURITY;

-- Política para visualizar pagamentos
CREATE POLICY "Employee payments are viewable by authenticated users" 
ON public.employee_payments 
FOR SELECT 
USING (true);

-- Política para gerenciar pagamentos (apenas admins e secretários)
CREATE POLICY "Only admins and secretaries can manage employee payments" 
ON public.employee_payments 
FOR ALL 
USING (EXISTS ( SELECT 1
   FROM profiles
  WHERE ((profiles.user_id = auth.uid()) AND (profiles.role = ANY (ARRAY['admin'::text, 'secretary'::text])))));

-- Trigger para atualizar updated_at nos pagamentos
CREATE TRIGGER update_employee_payments_updated_at
BEFORE UPDATE ON public.employee_payments
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Remover campo status da tabela employees (não mais necessário)
ALTER TABLE public.employees DROP COLUMN IF EXISTS status;

-- Adicionar campo para configurações de notificações na tabela company_settings
ALTER TABLE public.company_settings ADD COLUMN IF NOT EXISTS notifications_enabled BOOLEAN NOT NULL DEFAULT true;