import axios from 'axios';
import type { User, Category, InventoryItem, Order, OrderCreate, LoginPayload } from '../types';

export const API_URL = import.meta.env.VITE_BACKEND_API || "http://127.0.0.1:8000/api/v1";

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem("token") || localStorage.getItem("access_token");
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export const foodPantryService = {
    // --- Authentication ---
    login: async (credentials: LoginPayload) => {
        const params = new URLSearchParams();
        params.append('username', credentials.username);
        if (credentials.password) {
            params.append('password', credentials.password);
        }

        const response = await api.post("/auth/login", params, {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
        });
        return response.data;
    },

    getCurrentUser: async (): Promise<User> => {
        const response = await api.get("/users/me"); // Adjust endpoint if your backend uses something else like "/profile"
        return response.data;
    },

    // --- Users (Admin Workflow) ---
    getUsers: async (): Promise<User[]> => {
        const response = await api.get("/users");
        return response.data.data || response.data;
    },

    createUser: async (userData: { username: string; password?: string; pin?: string; role_id: number }) => {
        const response = await api.post("/users", userData);
        return response.data;
    },

    updateUser: async (userId: number, userData: Partial<User>) => {
        const response = await api.put(`/users/${userId}`, userData);
        return response.data;
    },

    deleteUser: async (userId: number) => {
        const response = await api.delete(`/users/${userId}`);
        return response.data;
    },

    // --- Categories (Inventory Manager Workflow) ---
    getCategories: async (): Promise<Category[]> => {
        const response = await api.get("/inventory/categories");
        return response.data.data || response.data;
    },

    // --- Inventory Management ---
    getInventory: async (): Promise<InventoryItem[]> => {
        const response = await api.get("/inventory");
        return response.data.data || response.data;
    },

    createInventoryItem: async (itemData: { item_name: string; amount: number; category_id: number; expiration_date: string }) => {
        const response = await api.post("/inventory", itemData);
        return response.data;
    },

    updateInventoryItem: async (itemId: number, itemData: Partial<InventoryItem>) => {
        const response = await api.put(`/inventory/${itemId}`, itemData);
        return response.data;
    },

    deleteInventoryItem: async (itemId: number) => {
        const response = await api.delete(`/inventory/${itemId}`);
        return response.data;
    },

    // --- Orders & Distribution (Employee Workflow) ---
    getOrders: async (): Promise<Order[]> => {
        const response = await api.get("/orders");
        return response.data.data || response.data;
    },

    createOrder: async (orderData: OrderCreate): Promise<Order> => {
        const response = await api.post("/orders", orderData);
        return response.data;
    },

    getAuditLogs: async (): Promise<any[]> => {
        const response = await api.get("/audit-logs");
        return response.data.data || response.data;
    }
};

export default api;