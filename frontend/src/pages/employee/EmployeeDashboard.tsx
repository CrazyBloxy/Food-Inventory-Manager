import React, { useState, useEffect } from "react";
import { AddOrderModal } from "./forms/AddOrder";
import { foodPantryService } from "../../services/api";
import { LuShieldAlert, LuSearch, LuRefreshCw } from "react-icons/lu";
import type { InventoryItem, Category } from "../../types";

export const EmployeeDashboard: React.FC = () => {
    const [inventory, setInventory] = useState<InventoryItem[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedCategory, setSelectedCategory] = useState<string>("all");
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [openOrderModal, setOpenOrderModal] = useState<boolean>(false);

    const fetchData = async () => {
        setLoading(true);
        setError(null);
        try {
            // Fetch inventory items and categories concurrently
            const [inventoryData, categoriesData] = await Promise.all([
                foodPantryService.getInventory(),
                foodPantryService.getCategories()
            ]);

            setInventory(Array.isArray(inventoryData) ? inventoryData : []);
            setCategories(Array.isArray(categoriesData) ? categoriesData : []);
        } catch (err: any) {
            console.error("Failed to fetch dashboard data:", err);
            setError(err.response?.data?.detail || "Could not load inventory or categories from the server.");
            setInventory([]);
            setCategories([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    // Helper to resolve category name from category_id or category relation
    const getCategoryName = (item: InventoryItem): string => {
        if (item.category?.category_name) {
            return item.category.category_name;
        }
        const found = categories.find((c) => c.id === item.category_id);
        return found ? found.category_name : "Uncategorized";
    };

    // Filter stock inventory safely based on search input and category filter dropdown
    const filteredInventory = inventory.filter((item) => {
        const query = searchTerm.toLowerCase();
        const catName = getCategoryName(item).toLowerCase();

        const matchesSearch =
            String(item.id).includes(query) ||
            (item.item_name?.toLowerCase() || "").includes(query) ||
            catName.includes(query) ||
            String(item.amount).includes(query);

        const matchesCategory =
            selectedCategory === "all" || String(item.category_id) === selectedCategory;

        return matchesSearch && matchesCategory;
    });

    return (
        <div className="w-full">
            <main className="p-8 flex flex-col gap-6 max-w-5xl mx-auto w-full">
                
                {/* HEADER ROW */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-100">Store Room Inventory</h1>
                        <p className="text-xs text-slate-400 mt-1">View available kitchen stocks and compile requisition orders.</p>
                    </div>

                    <div className="flex items-center gap-3 w-full max-w-xl justify-end">
                        {/* Category Filter Dropdown */}
                        <select
                            value={selectedCategory}
                            onChange={(e) => setSelectedCategory(e.target.value)}
                            className="select bg-[#0a1224] border border-slate-800 rounded-xl text-sm h-11 text-slate-300 px-3 focus:outline-none focus:border-blue-500 transition-colors"
                        >
                            <option value="all">All Categories</option>
                            {categories.map((cat) => (
                                <option key={cat.id} value={String(cat.id)}>
                                    {cat.category_name}
                                </option>
                            ))}
                        </select>

                        <div className="relative w-full">
                            <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-500">
                                <LuSearch size={16} />
                            </span>
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Filter Stock by name, category..."
                                className="input w-full bg-[#0a1224] border border-slate-800 rounded-xl text-sm h-11 text-slate-200 pl-10 pr-4 focus:outline-none focus:border-blue-500 transition-colors"
                            />
                        </div>

                        <button 
                            onClick={fetchData}
                            className="btn bg-[#0a1224] hover:bg-slate-800 border border-slate-800 text-slate-300 h-11 min-h-0 px-4 rounded-xl flex items-center justify-center shrink-0 transition-colors"
                            title="Refresh stock inventory"
                        >
                            <LuRefreshCw size={16} className={loading ? "animate-spin text-blue-400" : ""} />
                        </button>

                        <button 
                            onClick={() => setOpenOrderModal(true)} 
                            className="btn btn-primary h-11 min-h-0 rounded-xl font-medium text-sm border-none px-5 whitespace-nowrap shrink-0"
                        >
                           + Create Order
                        </button>
                    </div>
                </div>

                {/* ERROR BANNER IF ANY */}
                {error && (
                    <div className="bg-amber-500/10 border border-amber-500/20 text-amber-400 px-4 py-3 rounded-xl text-xs flex items-center gap-2">
                        <LuShieldAlert size={16} />
                        <span>{error}</span>
                    </div>
                )}

                {/* INVENTORY TABLE WORKSPACE */}
                <div className="bg-[#0b1326] rounded-2xl shadow-xl h-125 flex flex-col overflow-hidden border border-slate-800/80">
                    <div className="flex-1 overflow-y-auto scrollbar-thin">
                        <table className="table w-full text-slate-300 table-pin-rows">
                            <thead>
                                <tr className="border-b border-slate-800 bg-[#060b14] text-slate-400 text-xs">
                                    <th className="py-4 px-6 bg-[#060b14]">ID</th>
                                    <th className="py-4 px-6 bg-[#060b14]">Item Name</th>
                                    <th className="py-4 px-6 bg-[#060b14]">Category</th>
                                    <th className="py-4 px-6 bg-[#060b14]">Available Stock</th>
                                    <th className="py-4 px-6 bg-[#060b14]">Expiration Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr>
                                        <td colSpan={5} className="text-center py-20 text-slate-500 text-sm">
                                            Loading inventory stocks...
                                        </td>
                                    </tr>
                                ) : filteredInventory.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="text-center py-20 text-slate-500 text-sm">
                                            No matching inventory items found.
                                        </td>
                                    </tr>
                                ) : (
                                    filteredInventory.map((item) => (
                                        <tr key={item.id} className="border-b border-slate-800/50 hover:bg-slate-800/10 transition-colors">
                                            <td className="font-mono text-xs text-blue-400 py-4 px-6">
                                                #{String(item.id).padStart(4, '0')}
                                            </td>
                                            <td className="py-4 px-6 font-medium text-slate-100">
                                                {item.item_name}
                                            </td>
                                            <td className="py-4 px-6 text-xs text-slate-400">
                                                <span className="bg-slate-800/60 border border-slate-700/50 px-2.5 py-1 rounded-md text-slate-300">
                                                    {getCategoryName(item)}
                                                </span>
                                            </td>
                                            <td className="py-4 px-6">
                                                <span className={`text-sm font-semibold ${item.amount === 0 ? "text-rose-400" : "text-slate-200"}`}>
                                                    {item.amount} units
                                                </span>
                                            </td>
                                            <td className="font-mono text-xs py-4 px-6 text-slate-400">
                                                {item.expiration_date}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </main>

            {/* FULL SCREEN REQUISITION WORKSPACE */}
            <AddOrderModal 
                isOpen={openOrderModal} 
                onClose={() => setOpenOrderModal(false)} 
                onOrderSuccess={fetchData}
            />
        </div>
    );
};