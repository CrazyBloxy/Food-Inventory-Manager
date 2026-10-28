import axios from 'axios';
import type { User, Category, InventoryItem, Order, LoginPayload } from '../types';

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

    createUser: async (userData: { username: string; password?: string; pin?: string; role_id: number }, adminPin: string) => {
        const response = await api.post("/users", userData, {
            headers: {
                'x-pin': adminPin,
            },
        });
        return response.data;
    },

    updateUser: async (userId: number, userData: Partial<User>, pin: string) => {
        const response = await api.put(`/users/${userId}`, userData, {
            headers: {
                'x-pin': pin,
            },
        });
        return response.data;
    },

    deleteUser: async (userId: number, pin: string) => {
        const response = await api.delete(`/users/${userId}`, {
            headers: {
                'x-pin': pin,
            },
        });
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

    createInventoryItem: async (
        itemData: { item_name: string; amount: number; category_id: number; expiration_date: string },
        pin: string
    ) => {
        const response = await api.post("/inventory", itemData, {
            headers: {
                'x-pin': pin,
            },
        });
        return response.data;
    },

    updateInventoryItem: async (itemId: number, itemData: Partial<InventoryItem>, pin: string) => {
        const response = await api.put(`/inventory/${itemId}`, itemData, {
            headers: {
                'x-pin': pin,
            },
        });
        return response.data;
    },

    deleteInventoryItem: async (itemId: number, pin: string) => {
        const response = await api.delete(`/inventory/${itemId}`, {
            headers: {
                'x-pin': pin,
            },
        });
        return response.data;
    },

    // --- Orders & Distribution (Employee Workflow) ---
    getOrders: async (): Promise<Order[]> => {
        const response = await api.get("/orders");
        return response.data.data || response.data;
    },

    createOrder: async (orderPayload: any, config?: any) => {
        const response = await api.post("/orders", orderPayload, config);
        return response.data;
    },

    getAuditLogs: async (): Promise<any[]> => {
        const response = await api.get("/audit-logs");
        return response.data.data || response.data;
    },

    shutdown: async () => {
        const response = await api.post("/shutdown");
        return response.data;
    }
};

export default api;