-- 1. NEW TABLE: Roles lookup
CREATE TABLE roles (
    id SERIAL PRIMARY KEY,
    role_name VARCHAR(30) UNIQUE NOT NULL -- 'Employee', 'Inventory Manager', 'Admin'
);

-- 2. UPDATED TABLE: Users (linked to roles table)
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    pin_hash VARCHAR(255) NOT NULL,
    role_id INT REFERENCES roles(id) ON DELETE RESTRICT, -- Changed to Foreign Key
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. NEW TABLE: Inventory Categories lookup
CREATE TABLE categories (
    id SERIAL PRIMARY KEY,
    category_name VARCHAR(50) UNIQUE NOT NULL -- 'Canned Goods', 'Produce', 'Dairy', etc.
);

-- 4. UPDATED TABLE: Inventory (linked to categories table)
CREATE TABLE inventory (
    id SERIAL PRIMARY KEY,
    item_name VARCHAR(150) NOT NULL,
    amount INT NOT NULL CHECK (amount >= 0),
    category_id INT REFERENCES categories(id) ON DELETE RESTRICT, -- Changed to Foreign Key
    expiration_date DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. UNCHANGED TABLE: Orders
CREATE TABLE orders (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id) ON DELETE RESTRICT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 6. UNCHANGED TABLE: Order Items
CREATE TABLE order_items (
    id SERIAL PRIMARY KEY,
    order_id INT REFERENCES orders(id) ON DELETE CASCADE,
    item_id INT REFERENCES inventory(id) ON DELETE RESTRICT,
    quantity_taken INT NOT NULL CHECK (quantity_taken > 0)
);

-- 7. UNCHANGED TABLE: Audit Logs
CREATE TABLE audit_logs (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id) ON DELETE SET NULL, 
    user_role VARCHAR(30) NOT NULL,                      
    action_type VARCHAR(50) NOT NULL,                    
    target_table VARCHAR(50) NOT NULL,                   
    record_id INT NOT NULL,                              
    old_value JSONB DEFAULT NULL,                        
    new_value JSONB NOT NULL,                            
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);