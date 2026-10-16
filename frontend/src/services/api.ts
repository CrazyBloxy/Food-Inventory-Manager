import axios from 'axios';

// 1. Reusable network connection pulling from your environment configuration
export const API_URL = import.meta.env.VITE_BACKEND_API;

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export interface Role {
  id: number;
  role_name: string;
}

export interface User {
  id: number;
  username: string;
  role_id: number;
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
  expiration_date: string;
}

// 3. Centralized Service Layer (Clean, single-line functions your UI calls directly)
export const foodPantryService = {
  // Read all seeded user accounts (Admin Workflow)
  getUsers: async (): Promise<User[]> => {
    const response = await api.get("/users");
    return response.data.data;
  },

  // Read dynamic categories for dropdown inputs (Inventory Manager Workflow)
  getCategories: async (): Promise<Category[]> => {
    const response = await api.get("/categories");
    return response.data.data;
  },

  // Read shelf inventory tracking lists (Employee / Manager Workflow)
  getInventory: async (): Promise<InventoryItem[]> => {
    const response = await api.get("/inventory");
    return response.data.data;
  },
};

export default api;