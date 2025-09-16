-- Add receipt_url column to employee_payments table for file attachments
ALTER TABLE public.employee_payments 
ADD COLUMN receipt_url TEXT;

-- Create storage bucket for payment receipts
INSERT INTO storage.buckets (id, name, public) 
VALUES ('payment-receipts', 'payment-receipts', false);

-- Create policies for payment receipts storage
CREATE POLICY "Admins and secretaries can view payment receipts" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'payment-receipts' AND (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'secretary')
  )
));

CREATE POLICY "Admins and secretaries can upload payment receipts" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'payment-receipts' AND (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'secretary')
  )
));

CREATE POLICY "Admins and secretaries can update payment receipts" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'payment-receipts' AND (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'secretary')
  )
));

CREATE POLICY "Admins and secretaries can delete payment receipts" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'payment-receipts' AND (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'secretary')
  )
));