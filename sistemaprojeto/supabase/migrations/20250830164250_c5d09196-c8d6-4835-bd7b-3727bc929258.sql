-- Insert sample data for testing (fixed version)

-- Insert some sample equipment data
INSERT INTO public.equipment (name, category, weight, dimensions, total_quantity, available_quantity, maintenance_quantity, unavailable_quantity) VALUES
('Mesa de Som Yamaha TF1', 'som', 15.5, '50cm x 35cm x 20cm', 3, 2, 1, 0),
('Caixa de Som JBL PRX815W', 'som', 24.8, '40cm x 65cm x 40cm', 8, 6, 1, 1),
('Moving Head LED Wash 36x10W', 'luz', 8.2, '25cm x 25cm x 35cm', 12, 10, 2, 0),
('Refletor LED Par 64 RGBW', 'luz', 3.5, '20cm x 20cm x 30cm', 20, 18, 1, 1),
('Câmera Sony FX3', 'video', 1.8, '15cm x 10cm x 8cm', 4, 3, 0, 1),
('Tripé Profissional Manfrotto', 'video', 2.1, '8cm x 8cm x 180cm', 6, 5, 1, 0);

-- Insert equipment units manually for testing
DO $$
DECLARE
    eq RECORD;
    i INTEGER;
BEGIN
    FOR eq IN SELECT * FROM public.equipment LOOP
        FOR i IN 1..eq.total_quantity LOOP
            INSERT INTO public.equipment_units (equipment_id, unit_identifier, status) VALUES (
                eq.id,
                'Unidade #' || i,
                CASE 
                    WHEN i <= eq.available_quantity THEN 'available'
                    WHEN i <= eq.available_quantity + eq.maintenance_quantity THEN 'maintenance'
                    ELSE 'unavailable'
                END
            );
        END LOOP;
    END LOOP;
END $$;

-- Insert some sample employees
INSERT INTO public.employees (name, type, position, fixed_salary, additional_value, events_this_month) VALUES
('João Silva', 'fixed', 'Técnico de Som', 3500.00, 850.00, 8),
('Maria Santos', 'fixed', 'Técnica de Iluminação', 3200.00, 720.00, 6),
('Pedro Costa', 'fixed', 'Operador de Vídeo', 3800.00, 950.00, 10);

INSERT INTO public.employees (name, type, daily_rate, event_name, hire_date, status) VALUES
('Ana Oliveira', 'freelancer', 450.00, 'Festival de Verão 2024', '2024-01-10', 'active'),
('Carlos Mendes', 'freelancer', 380.00, 'Casamento Silva', '2024-01-15', 'completed'),
('Luisa Ferreira', 'freelancer', 420.00, 'Evento Corporativo ABC', '2024-01-18', 'active');

-- Insert some sample events
INSERT INTO public.events (client_name, event_location, setup_date, event_date, status, total_cost, notes) VALUES
('Empresa ABC Ltda', 'Centro de Convenções - São Paulo', '2024-02-15', '2024-02-16', 'completed', 25000.00, 'Evento corporativo anual com 500 participantes'),
('Festival de Música', 'Parque Ibirapuera - São Paulo', '2024-03-01', '2024-03-02', 'completed', 45000.00, 'Festival com 3 palcos e 2000 participantes'),
('Casamento João & Maria', 'Buffet Royal - Santos', '2024-03-20', '2024-03-21', 'in_progress', 18000.00, 'Casamento com cerimônia e festa'),
('Lançamento Produto XYZ', 'Hotel Marriott - São Paulo', '2024-04-10', '2024-04-11', 'planned', 35000.00, 'Evento de lançamento para 800 convidados');