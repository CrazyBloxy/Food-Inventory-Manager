export interface Role {
    id: number;
    role_name: string;
}

export interface User {
    id: number;
    username: string;
    role_id: number;
    role?: Role;
    is_active: boolean;
    created_at: string;
}

export interface Category {
    id: number;
    category_name: string;
}

export interface InventoryItem {
    id: number;
    item_name: string;
    amount: number;
    category_id: number;
    category?: Category;
    expiration_date: string;
}

export interface OrderItemCreate {
    item_id: number;
    quantity_taken: number;
}

export interface OrderCreate {
    items: OrderItemCreate[];
}

export interface OrderItem {
    id: number;
    item_id: number;
    quantity_taken: number;
    item?: InventoryItem;
}

export interface Order {
    id: number;
    user_id: number;
    order_date: string;
    user?: User;
    order_items: OrderItem[];
}

export interface LoginPayload {
    username: string;
    password?: string;
    pin?: string;
}