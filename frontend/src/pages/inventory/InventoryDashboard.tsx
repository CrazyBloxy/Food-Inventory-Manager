import React, { useState, useEffect } from "react";
import { MdDeleteForever, MdEdit } from "react-icons/md";
import { LuRefreshCw, LuSearch, LuShieldAlert, LuLock, LuX } from "react-icons/lu";
import { foodPantryService } from "../../services/api";
import type { InventoryItem, Category } from "../../types";
import { AddItemModal } from "./forms/AddItem";
import { EditItemModal } from "./forms/EditItem";

export const InventoryDashboard: React.FC = () => {
    const [inventory, setInventory] = useState<InventoryItem[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [activeModal, setActiveModal] = useState<"add" | "edit" | null>(null);
    const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedCategory, setSelectedCategory] = useState<string>("all");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);
    const [showPinModal, setShowPinModal] = useState(false);
    const [itemPendingDelete, setItemPendingDelete] = useState<InventoryItem | null>(null);
    const [pin, setPin] = useState("");
    const [pinError, setPinError] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);

    // Fetch inventory and categories from the backend API service
    const fetchData = async () => {
        try {
            setLoading(true);
            setError(null);

            const [inventoryData, categoriesData] = await Promise.all([
                foodPantryService.getInventory(),
                foodPantryService.getCategories(),
            ]);

            setInventory(Array.isArray(inventoryData) ? inventoryData : []);
            setCategories(Array.isArray(categoriesData) ? categoriesData : []);
        } catch (err: any) {
            console.error("Failed to fetch dashboard data:", err);
            setError(err.response?.data?.detail || "Unable to load inventory items or categories.");
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
    const getCategoryName = (item: InventoryItem) => {
        if (item.category?.category_name) {
            return item.category.category_name;
        }
        const found = categories.find((c) => c.id === item.category_id);
        return found ? found.category_name : `Category #${item.category_id}`;
    };

    // First click activates the "Are you sure?" confirmation state
    const handleDeleteClick = (item: InventoryItem) => {
        setDeleteConfirmId(item.id);
    };

    // Trigger the 4-digit PIN popup modal from the confirmation prompt
    const handleProceedToPin = (item: InventoryItem) => {
        setItemPendingDelete(item);
        setPin("");
        setPinError(null);
        setShowPinModal(true);
        setDeleteConfirmId(null);
    };

    // Verify PIN & Execute 
    const handleFinalizeDelete = async (e: React.FormEvent) => {
        e.preventDefault();
        if (pin.length !== 4) {
            setPinError("Please enter a valid 4-digit security PIN.");
            return;
        }

        if (!itemPendingDelete) return;

        setSubmitting(true);
        setPinError(null);

        try {
            await foodPantryService.deleteInventoryItem(itemPendingDelete.id, pin);
            fetchData();
            setShowPinModal(false);
            setItemPendingDelete(null);
            setPin("");
        } catch (err: any) {
            console.error("Deletion failed:", err);
            const detail = err.response?.data?.detail;
            let errorMessage = "Invalid security PIN or unauthorized.";
            if (typeof detail === 'string') {
                errorMessage = detail;
            } else if (Array.isArray(detail)) {
                errorMessage = detail.map((d: any) => d.msg ? `${d.loc ? d.loc.join('.') + ': ' : ''}${d.msg}` : JSON.stringify(d)).join(" | ");
            } else if (detail && typeof detail === 'object') {
                errorMessage = detail.msg || JSON.stringify(detail);
            }
            setPinError(errorMessage);
        } finally {
            setSubmitting(false);
        }
    };

    // Filter logic for search bar and category dropdown filter
    const filteredInventory = inventory.filter((item) => {
        const query = searchTerm.toLowerCase();
        const catName = getCategoryName(item).toLowerCase();

        const matchesSearch =
            String(item.id).includes(query) ||
            item.item_name.toLowerCase().includes(query) ||
            catName.includes(query);

        const matchesCategory =
            selectedCategory === "all" || String(item.category_id) === selectedCategory;

        return matchesSearch && matchesCategory;
    });

    return (
        <div className="w-full">
            <main className="p-8 flex flex-col gap-6 max-w-5xl mx-auto w-full">

                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-100">Food Inventory Manager</h1>
                        <p className="text-xs text-slate-400 mt-1">Track stocks, manage categories, and monitor shelf expirations.</p>
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
                                placeholder="Search Food Items..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="input w-full bg-[#0a1224] border border-slate-800 rounded-xl text-sm h-11 text-slate-200 pl-10 pr-4 focus:outline-none focus:border-blue-500 transition-colors"
                            />
                        </div>

                        <button
                            onClick={fetchData}
                            className="btn bg-[#0a1224] hover:bg-slate-800 border border-slate-800 text-slate-300 h-11 min-h-0 px-4 rounded-xl flex items-center justify-center shrink-0 transition-colors"
                            title="Refresh data"
                        >
                            <LuRefreshCw size={16} className={loading ? "animate-spin text-blue-400" : ""} />
                        </button>
                        <button
                            onClick={() => setActiveModal("add")}
                            className="btn btn-primary h-11 min-h-0 rounded-xl font-medium text-sm border-none shrink-0"
                        >
                            + Create Item
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

                <div className="bg-[#0b1326] rounded-2xl shadow-xl h-125 flex flex-col overflow-hidden border border-slate-800/80">
                    <div className="flex-1 overflow-y-auto scrollbar-thin">
                        {loading ? (
                            <div className="flex justify-center items-center h-full text-slate-400 text-sm">
                                Loading inventory and categories...
                            </div>
                        ) : filteredInventory.length === 0 ? (
                            <div className="flex justify-center items-center h-full text-slate-500 text-sm">
                                No inventory items found.
                            </div>
                        ) : (
                            <table className="table w-full text-slate-300 table-pin-rows">
                                <thead>
                                    <tr className="border-b border-slate-800 bg-[#060b14] text-slate-400 text-xs">
                                        <th className="py-4 px-6 bg-[#060b14]">ID</th>
                                        <th className="py-4 px-6 bg-[#060b14]">Item Name</th>
                                        <th className="py-4 px-6 bg-[#060b14]">Category</th>
                                        <th className="py-4 px-6 bg-[#060b14]">Stock Amount</th>
                                        <th className="py-4 px-6 bg-[#060b14]">Expiration Date</th>
                                        <th className="py-4 px-6 text-center bg-[#060b14]">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredInventory.map((item) => (
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
                                            <td className="py-4 px-6 text-center">
                                                <div className="flex items-center justify-center gap-3">
                                                    <button
                                                        onClick={() => {
                                                            setSelectedItem(item);
                                                            setActiveModal("edit");
                                                        }}
                                                        className="btn btn-sm bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/20 hover:scale-105 active:scale-95 transition-transform"
                                                        title="Modify Stock"
                                                    >
                                                        <MdEdit size={16} />
                                                    </button>

                                                    {deleteConfirmId === item.id ? (
                                                        <div className="flex items-center gap-1.5 animate-in fade-in duration-150">
                                                            <button
                                                                onClick={() => handleProceedToPin(item)}
                                                                className="btn btn-sm bg-rose-600 hover:bg-rose-700 text-white text-[10px] font-semibold uppercase px-2.5 h-8 min-h-0 border-none"
                                                            >
                                                                Are you sure?
                                                            </button>
                                                            <button
                                                                onClick={() => setDeleteConfirmId(null)}
                                                                className="btn btn-sm bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-medium px-2.5 h-8 min-h-0 border border-slate-700"
                                                            >
                                                                No
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <button
                                                            onClick={() => handleDeleteClick(item)}
                                                            className="btn btn-sm bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 hover:scale-105 active:scale-95 transition-all"
                                                            title="Remove Item"
                                                        >
                                                            <MdDeleteForever size={16} />
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>
            </main>

            {/* 4-PIN VERIFICATION OVERLAY SUB-MODAL */}
            {showPinModal && (
                <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-[#0b1326] border border-slate-700/80 w-full max-w-sm rounded-2xl p-6 shadow-2xl flex flex-col items-center text-center relative animate-in fade-in zoom-in duration-150">

                        <button
                            onClick={() => {
                                setShowPinModal(false);
                                setItemPendingDelete(null);
                            }}
                            className="absolute top-4 right-4 text-slate-400 hover:text-slate-200"
                        >
                            <LuX size={18} />
                        </button>

                        <div className="p-3 bg-rose-600/10 border border-rose-500/20 rounded-full text-rose-400 mb-3">
                            <LuLock size={24} />
                        </div>

                        <h4 className="text-lg font-bold text-slate-100">PIN Verification</h4>
                        <p className="text-xs text-slate-400 mt-1 mb-4">
                            Enter your 4-digit security PIN to authorize the deletion of <span className="text-slate-200 font-semibold">{itemPendingDelete?.item_name}</span>.
                        </p>

                        <form onSubmit={handleFinalizeDelete} className="w-full flex flex-col items-center gap-4">
                            <input
                                type="password"
                                maxLength={4}
                                autoFocus
                                value={pin}
                                onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))}
                                placeholder="••••"
                                className="input text-center tracking-[1em] text-xl font-mono w-40 h-12 bg-[#060b14] border border-slate-700 rounded-xl text-slate-100 focus:outline-none focus:border-rose-500"
                            />

                            {pinError && (
                                <span className="text-xs text-red-400 font-medium">
                                    {pinError}
                                </span>
                            )}

                            <div className="flex gap-3 w-full mt-2">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowPinModal(false);
                                        setItemPendingDelete(null);
                                    }}
                                    className="btn flex-1 h-10 min-h-0 bg-transparent hover:bg-slate-800 text-slate-400 border border-slate-800 rounded-xl text-xs"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={submitting || pin.length !== 4}
                                    className="btn flex-1 h-10 min-h-0 bg-rose-600 hover:bg-rose-700 text-white border-none rounded-xl text-xs font-semibold disabled:opacity-40"
                                >
                                    {submitting ? "Verifying..." : "Confirm Delete"}
                                </button>
                            </div>
                        </form>

                    </div>
                </div>
            )}

            <AddItemModal
                isOpen={activeModal === "add"}
                onClose={() => setActiveModal(null)}
                onSuccess={fetchData}
                categories={categories}
            />
            <EditItemModal
                isOpen={activeModal === "edit"}
                onClose={() => {
                    setActiveModal(null);
                    setSelectedItem(null);
                }}
                item={selectedItem}
                categories={categories}
                onSuccess={fetchData}
            />
        </div>
    );
};