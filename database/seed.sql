-- ==========================================================
-- 1. ROLES (Solo 2 son necesarios, pero agrego variedad)
-- ==========================================================
INSERT INTO public.roles (role_name, description) VALUES 
('Administrator', 'Full system access and user management'),
('Manager', 'Court and booking management'),
('Staff', 'Front desk and customer service'),
('Support', 'System maintenance and logs'),
('Analyst', 'View reports and billing data');

-- ==========================================================
-- 2. USUARIOS (Password_hash simplificado para pruebas)
-- ==========================================================
INSERT INTO public.users (username, password_hash, full_name, role_id, status) VALUES 
('admin_alex', 'hash_123', 'Alex Táchira', 1, 'Activated'),
('manager_jose', 'hash_123', 'José Rodriguez', 2, 'Activated'),
('staff_maria', 'hash_123', 'María Pérez', 3, 'Activated'),
('staff_luis', 'hash_123', 'Luis García', 3, 'Activated'),
('admin_backup', 'hash_123', 'Backup Admin', 1, 'Disabled');

-- ==========================================================
-- 3. CLIENTES (Customers)
-- ==========================================================
INSERT INTO public.customers (full_name, phone, email) VALUES 
('Juan Méndez', '0414-1234567', 'juan@email.com'),
('Ana Colmenares', '0424-7654321', 'ana@email.com'),
('Pedro Briceño', '0412-9876543', 'pedro@email.com'),
('Carla Sánchez', '0416-1112233', 'carla@email.com'),
('Roberto Mora', '0426-4445566', 'roberto@email.com');

-- ==========================================================
-- 4. CANCHAS (Courts)
-- ==========================================================
INSERT INTO public.courts (court_name, status) VALUES 
('Main Soccer Field', 'Available'),
('Futsal Court 1', 'Occupied'),
('Tennis Court A', 'Available'),
('Basketball Court 1', 'Maintenance'),
('Padel Court 1', 'Available');

-- ==========================================================
-- 5. MÉTODOS DE PAGO
-- ==========================================================
INSERT INTO public.payment_methods (method_name) VALUES 
('Cash'),
('Zelle'),
('Pago Móvil'),
('Debit Card'),
('Bank Transfer');

-- ==========================================================
-- 6. PRODUCTOS (Venta en cafetín/tienda)
-- ==========================================================
INSERT INTO public.products (product_name, price, stock) VALUES 
('Mineral Water 500ml', 1.50, 50),
('Gatorade Blue', 2.50, 30),
('Tennis Balls (3 pack)', 12.00, 10),
('Energy Bar', 1.00, 100),
('Soccer Socks', 8.00, 15);

-- ==========================================================
-- 7. RESERVAS (Bookings)
-- ==========================================================
INSERT INTO public.bookings (customer_id, court_id, user_id, booking_date, start_time, end_time, status) VALUES 
(1, 1, 3, CURRENT_DATE, '18:00:00', '19:00:00', 'Paid'),
(2, 3, 3, CURRENT_DATE, '09:00:00', '10:00:00', 'Pending'),
(3, 2, 4, CURRENT_DATE + 1, '20:00:00', '21:00:00', 'Paid'),
(4, 5, 4, CURRENT_DATE + 1, '17:00:00', '18:30:00', 'Cancelled'),
(5, 1, 3, CURRENT_DATE + 2, '19:00:00', '20:00:00', 'Pending');

-- ==========================================================
-- 8. FACTURACIÓN (Billings)
-- ==========================================================
INSERT INTO public.billings (booking_id, payment_method_id, total_amount) VALUES 
(1, 3, 25.00),
(3, 1, 15.00);