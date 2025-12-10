-- GenZ Beauty Salon Database Schema

-- Tenants table
CREATE TABLE tenants (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Clients table
CREATE TABLE clients (
    id VARCHAR(50) PRIMARY KEY,
    tenant_id VARCHAR(50) REFERENCES tenants(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(50) NOT NULL,
    email VARCHAR(255),
    dob DATE,
    acquisition_source VARCHAR(100),
    preferred_services TEXT[],
    skin_type VARCHAR(50),
    hair_type VARCHAR(50),
    notes TEXT,
    communication_preferences JSONB,
    is_active BOOLEAN DEFAULT true,
    loyalty_points INTEGER DEFAULT 0,
    allergies TEXT[],
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Staff table
CREATE TABLE staff (
    id VARCHAR(50) PRIMARY KEY,
    tenant_id VARCHAR(50) REFERENCES tenants(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(50) NOT NULL,
    role VARCHAR(50) NOT NULL,
    years_of_experience INTEGER,
    commission DECIMAL(5,2),
    profile_image_url TEXT,
    rating DECIMAL(3,2),
    bio TEXT,
    specializations TEXT[],
    is_active BOOLEAN DEFAULT true,
    schedule JSONB,
    identity JSONB,
    salary JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Services table
CREATE TABLE services (
    id VARCHAR(50) PRIMARY KEY,
    tenant_id VARCHAR(50) REFERENCES tenants(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    cost DECIMAL(10,2) NOT NULL,
    duration INTEGER NOT NULL,
    description TEXT,
    professional_use_products JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Service packages table
CREATE TABLE service_packages (
    id VARCHAR(50) PRIMARY KEY,
    tenant_id VARCHAR(50) REFERENCES tenants(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    services JSONB NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Appointments table
CREATE TABLE appointments (
    id VARCHAR(50) PRIMARY KEY,
    tenant_id VARCHAR(50) REFERENCES tenants(id) ON DELETE CASCADE,
    client_id VARCHAR(50) REFERENCES clients(id),
    staff_id VARCHAR(50) REFERENCES staff(id),
    service_ids TEXT[],
    start_time TIMESTAMP NOT NULL,
    end_time TIMESTAMP NOT NULL,
    notes TEXT,
    status VARCHAR(50) NOT NULL,
    payment JSONB,
    rating INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Inventory/Products table
CREATE TABLE products (
    id VARCHAR(50) PRIMARY KEY,
    tenant_id VARCHAR(50) REFERENCES tenants(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    brand VARCHAR(255) NOT NULL,
    sku VARCHAR(100),
    barcode VARCHAR(100),
    description TEXT,
    size VARCHAR(50),
    category VARCHAR(50) NOT NULL,
    stock INTEGER NOT NULL DEFAULT 0,
    reorder_level INTEGER NOT NULL DEFAULT 0,
    price DECIMAL(10,2) NOT NULL,
    cost DECIMAL(10,2) NOT NULL,
    supplier_id VARCHAR(50),
    expiry_date DATE,
    last_ordered_date DATE,
    notes TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Marketing campaigns table
CREATE TABLE marketing_campaigns (
    id VARCHAR(50) PRIMARY KEY,
    tenant_id VARCHAR(50) REFERENCES tenants(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    type VARCHAR(50) NOT NULL,
    audience VARCHAR(255),
    scheduled_at TIMESTAMP,
    status VARCHAR(50) NOT NULL,
    is_automated BOOLEAN DEFAULT false,
    stats JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Suppliers table
CREATE TABLE suppliers (
    id VARCHAR(50) PRIMARY KEY,
    tenant_id VARCHAR(50) REFERENCES tenants(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    contact_person VARCHAR(255),
    phone VARCHAR(50),
    email VARCHAR(255),
    address TEXT,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Purchase orders table
CREATE TABLE purchase_orders (
    id VARCHAR(50) PRIMARY KEY,
    tenant_id VARCHAR(50) REFERENCES tenants(id) ON DELETE CASCADE,
    po_number VARCHAR(100) NOT NULL,
    supplier_id VARCHAR(50) REFERENCES suppliers(id),
    items JSONB NOT NULL,
    order_date TIMESTAMP NOT NULL,
    expected_delivery_date DATE,
    received_date DATE,
    status VARCHAR(50) NOT NULL,
    total_cost DECIMAL(10,2) NOT NULL,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Stock movements table
CREATE TABLE stock_movements (
    id VARCHAR(50) PRIMARY KEY,
    tenant_id VARCHAR(50) REFERENCES tenants(id) ON DELETE CASCADE,
    product_id VARCHAR(50) REFERENCES products(id),
    date TIMESTAMP NOT NULL,
    type VARCHAR(10) NOT NULL,
    quantity INTEGER NOT NULL,
    reason VARCHAR(100) NOT NULL,
    notes TEXT,
    related_po_id VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Notifications table
CREATE TABLE notifications (
    id VARCHAR(50) PRIMARY KEY,
    tenant_id VARCHAR(50) REFERENCES tenants(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL,
    message TEXT NOT NULL,
    related_id VARCHAR(50),
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Loyalty transactions table
CREATE TABLE loyalty_transactions (
    id VARCHAR(50) PRIMARY KEY,
    tenant_id VARCHAR(50) REFERENCES tenants(id) ON DELETE CASCADE,
    client_id VARCHAR(50) REFERENCES clients(id),
    date TIMESTAMP NOT NULL,
    type VARCHAR(50) NOT NULL,
    points INTEGER NOT NULL,
    reason TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Purchased packages table
CREATE TABLE purchased_packages (
    id VARCHAR(50) PRIMARY KEY,
    tenant_id VARCHAR(50) REFERENCES tenants(id) ON DELETE CASCADE,
    client_id VARCHAR(50) REFERENCES clients(id),
    package_id VARCHAR(50) REFERENCES service_packages(id),
    purchase_date TIMESTAMP NOT NULL,
    remaining_services JSONB NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX idx_clients_tenant ON clients(tenant_id);
CREATE INDEX idx_staff_tenant ON staff(tenant_id);
CREATE INDEX idx_appointments_tenant ON appointments(tenant_id);
CREATE INDEX idx_appointments_client ON appointments(client_id);
CREATE INDEX idx_appointments_staff ON appointments(staff_id);
CREATE INDEX idx_products_tenant ON products(tenant_id);
CREATE INDEX idx_notifications_tenant ON notifications(tenant_id);
