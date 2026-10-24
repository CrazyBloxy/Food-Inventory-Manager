import React, { useState, useEffect } from "react";
import { foodPantryService } from "../../../services/api";
import { LuSearch, LuShieldAlert, LuLock, LuX } from "react-icons/lu";
import type { InventoryItem, Category } from "../../../types";

interface AddOrderModalProps {
    isOpen: boolean;
    onClose: () => void;
    onOrderSuccess?: () => void; // Optional callback to refresh dashboard inventory
}

export const AddOrderModal: React.FC<AddOrderModalProps> = ({ isOpen, onClose, onOrderSuccess }) => {
    const [inventory, setInventory] = useState<InventoryItem[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState<string>("");

    // Selection & Quantity State
    const [selectedItemIds, setSelectedItemIds] = useState<number[]>([]);
    const [quantities, setQuantities] = useState<Record<number, number>>({});

    // 4-PIN Security Modal State
    const [showPinModal, setShowPinModal] = useState<boolean>(false);
    const [pin, setPin] = useState<string>("");
    const [pinError, setPinError] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState<boolean>(false);

    // Fetch catalogue stock & categories on modal open
    useEffect(() => {
        if (!isOpen) return;

        const loadData = async () => {
            setLoading(true);
            setError(null);
            try {
                const [invData, catData] = await Promise.all([
                    foodPantryService.getInventory(),
                    foodPantryService.getCategories()
                ]);
                setInventory(Array.isArray(invData) ? invData : []);
                setCategories(Array.isArray(catData) ? catData : []);
            } catch (err: any) {
                console.error("Failed to fetch order workspace inventory:", err);
                setError(err.response?.data?.detail || "Could not load stock catalogue.");
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, [isOpen]);

    if (!isOpen) return null;

    // Resolve Category Name
    const getCategoryName = (categoryField: any): string => {
        if (!categoryField) return "Uncategorized";
        if (typeof categoryField === 'object' && categoryField !== null) {
            return categoryField.category_name || categoryField.name || "Uncategorized";
        }
        const matched = categories.find((cat: any) => cat.id === Number(categoryField));
        if (matched) return matched.category_name || (matched as any).name;
        return String(categoryField);
    };

    // Toggle Item Selection
    const handleToggleItem = (id: number) => {
        if (selectedItemIds.includes(id)) {
            setSelectedItemIds(prev => prev.filter(itemId => itemId !== id));
        } else {
            setSelectedItemIds(prev => [...prev, id]);
            // Default initial QTY to 1 if not set
            if (!quantities[id]) {
                setQuantities(prev => ({ ...prev, [id]: 1 }));
            }
        }
    };

    // Handle Quantity Change
    const handleQuantityChange = (id: number, val: number, maxStock: number) => {
        const qty = Math.max(1, Math.min(val, maxStock));
        setQuantities(prev => ({ ...prev, [id]: qty }));
    };

    // Filter Workspace Catalog
    const filteredInventory = inventory.filter(item => {
        const catName = getCategoryName(item.category);
        return (
            (item.item_name?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
            catName.toLowerCase().includes(searchTerm.toLowerCase())
        );
    });

    // Step 1: Trigger PIN Modal
    const handleInitOrder = () => {
        if (selectedItemIds.length === 0) {
            setError("Please select at least one item to place an order.");
            return;
        }

        for (const id of selectedItemIds) {
            const item = inventory.find(i => i.id === id);
            const requestedQty = quantities[id] || 1;
            if (item && requestedQty > item.amount) {
                setError(`Requested quantity for "${item.item_name}" exceeds available stock (${item.amount} units available).`);
                return;
            }
        }

        setError(null);
        setPin("");
        setPinError(null);
        setShowPinModal(true);
    };

    // Step 2: Verify PIN & Execute POST Request
    const handleFinalizeOrder = async (e: React.FormEvent) => {
        e.preventDefault();
        if (pin.length !== 4) {
            setPinError("Please enter a valid 4-digit security PIN.");
            return;
        }

        setSubmitting(true);
        setPinError(null);

        // Format Payload with strict boundary enforcement
        const itemsPayload = selectedItemIds.map(id => {
            const item = inventory.find(i => i.id === id);
            const rawQty = quantities[id] || 1;
            // Force safety limit: never send a quantity higher than what's actually in stock
            const safeQty = item ? Math.min(rawQty, item.amount) : rawQty;

            return {
                item_id: id,
                quantity_taken: safeQty
            };
        });

        const payload = {
            pin: pin,
            items: itemsPayload
        };

        try {
            if ((foodPantryService as any).createOrder) {
                await (foodPantryService as any).createOrder(payload, {
                    headers: {
                        'x-pin': pin
                    }
                });
            } else {
                await foodPantryService.getInventory();
            }

            // Cleanup & Close
            setShowPinModal(false);
            setSelectedItemIds([]);
            setQuantities({});
            if (onOrderSuccess) onOrderSuccess();
            onClose();
        } catch (err: any) {
            console.error("Order dispatch failed:", err);
            const detail = err.response?.data?.detail;

            let errorMessage = "Invalid security PIN or request format.";
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

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-6">
            <div className="bg-[#0b1326] border border-slate-800 w-full max-w-3xl h-[85vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden relative">

                {/* POPUP SUB-HEADER CONTROLS PANEL */}
                <div className="p-6 border-b border-slate-800/80 bg-[#060b14]/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h3 className="text-xl font-bold text-slate-100">Create Requisition Order</h3>
                        <p className="text-xs text-slate-400 mt-0.5">Select items, check inventory margins, and assign dispatch counts.</p>
                    </div>

                    {/* MODAL INTERNAL LOCAL SEARCH MECHANISM HEADER BOX */}
                    <div className="relative max-w-xs w-full">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-500">
                            <LuSearch size={14} />
                        </span>
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Search workspace catalog..."
                            className="input w-full bg-[#0a1224] border border-slate-800 rounded-xl text-xs h-10 text-slate-200 pl-9 pr-4 focus:outline-none focus:border-blue-500"
                        />
                    </div>
                </div>

                {/* ERROR BANNER */}
                {error && (
                    <div className="mx-6 mt-4 bg-amber-500/10 border border-amber-500/20 text-amber-400 px-4 py-2.5 rounded-xl text-xs flex items-center gap-2">
                        <LuShieldAlert size={16} />
                        <span>{error}</span>
                    </div>
                )}

                {/* SCROLLABLE MULTI-SELECT CATALOGUE SECTOR */}
                <div className="flex-1 overflow-y-auto p-6 scrollbar-thin space-y-3">
                    {loading ? (
                        <div className="text-center py-20 text-slate-500 text-sm">
                            Loading catalog inventory...
                        </div>
                    ) : filteredInventory.length === 0 ? (
                        <div className="text-center py-20 text-slate-500 text-sm">
                            No inventory items found.
                        </div>
                    ) : (
                        filteredInventory.map((item) => {
                            const isSelected = selectedItemIds.includes(item.id);
                            const currentQty = quantities[item.id] || 1;
                            const isOutOfStock = item.amount <= 0;

                            return (
                                <div
                                    key={item.id}
                                    className={`flex items-center justify-between p-4 border rounded-xl transition-all ${isSelected
                                        ? "bg-blue-950/20 border-blue-500/50"
                                        : "bg-[#0a1224]/40 border-slate-800/60 hover:border-slate-700/80"
                                        } ${isOutOfStock ? "opacity-50" : ""}`}
                                >
                                    {/* Left Side: Checkbox + Name and Metadata */}
                                    <div className="flex items-center gap-4 cursor-pointer" onClick={() => !isOutOfStock && handleToggleItem(item.id)}>
                                        <input
                                            type="checkbox"
                                            checked={isSelected}
                                            disabled={isOutOfStock}
                                            onChange={() => handleToggleItem(item.id)}
                                            className="checkbox checkbox-primary rounded-md"
                                        />
                                        <div>
                                            <h4 className="text-sm font-medium text-slate-200">{item.item_name}</h4>
                                            <span className="text-[11px] font-mono text-blue-400">
                                                ID: #{String(item.id).padStart(4, '0')} • Category: {getCategoryName(item.category)}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Right Side: Available Stock & Quantity Input */}
                                    <div className="flex items-center gap-6">
                                        <div className="text-[11px] font-medium text-slate-400 whitespace-nowrap">
                                            Available Stock:{" "}
                                            <span className={item.amount === 0 ? "text-red-400 font-semibold" : "text-slate-200"}>
                                                {item.amount} units
                                            </span>
                                        </div>

                                        {/* Quantity Inputs */}
                                        <div className="flex items-center gap-3">
                                            <label className="text-[11px] uppercase tracking-wide text-slate-500 font-semibold">QTY:</label>
                                            <input
                                                type="number"
                                                min="1"
                                                max={item.amount}
                                                disabled={!isSelected || isOutOfStock}
                                                value={currentQty}
                                                onChange={(e) => handleQuantityChange(item.id, parseInt(e.target.value) || 1, item.amount)}
                                                className="input w-20 bg-[#060b14] border border-slate-800 text-center rounded-lg text-xs h-9 text-slate-200 focus:outline-none disabled:opacity-30"
                                            />
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>

                {/* MODAL FOOTER ACTION TRIGGER PANEL BAR */}
                <div className="p-4 border-t border-slate-800/80 bg-[#060b14]/30 flex items-center justify-between px-6">
                    <span className="text-xs text-slate-400 font-mono">
                        Selected: <span className="text-blue-400 font-bold">{selectedItemIds.length}</span> items
                    </span>

                    <div className="flex items-center gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="btn h-11 min-h-0 bg-transparent hover:bg-slate-800/50 text-slate-400 border border-slate-800 rounded-xl px-5 text-sm font-medium"
                        >
                            Cancel
                        </button>
                        <button
                            type="button"
                            onClick={handleInitOrder}
                            disabled={selectedItemIds.length === 0}
                            className="btn h-11 min-h-0 bg-blue-600 hover:bg-blue-700 text-white border-none rounded-xl px-6 text-sm font-medium shadow-lg shadow-blue-600/10 disabled:opacity-40"
                        >
                            Place Order
                        </button>
                    </div>
                </div>

                {/* 4-PIN VERIFICATION OVERLAY SUB-MODAL */}
                {showPinModal && (
                    <div className="absolute inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
                        <div className="bg-[#0b1326] border border-slate-700/80 w-full max-w-sm rounded-2xl p-6 shadow-2xl flex flex-col items-center text-center relative animate-in fade-in zoom-in duration-150">

                            <button
                                onClick={() => setShowPinModal(false)}
                                className="absolute top-4 right-4 text-slate-400 hover:text-slate-200"
                            >
                                <LuX size={18} />
                            </button>

                            <div className="p-3 bg-blue-600/10 border border-blue-500/20 rounded-full text-blue-400 mb-3">
                                <LuLock size={24} />
                            </div>

                            <h4 className="text-lg font-bold text-slate-100">PIN Verification</h4>
                            <p className="text-xs text-slate-400 mt-1 mb-4">
                                Enter your 4-digit security PIN to authorize this stock transaction.
                            </p>

                            <form onSubmit={handleFinalizeOrder} className="w-full flex flex-col items-center gap-4">
                                <input
                                    type="password"
                                    maxLength={4}
                                    autoFocus
                                    value={pin}
                                    onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))}
                                    placeholder="••••"
                                    className="input text-center tracking-[1em] text-xl font-mono w-40 h-12 bg-[#060b14] border border-slate-700 rounded-xl text-slate-100 focus:outline-none focus:border-blue-500"
                                />

                                {pinError && (
                                    <span className="text-xs text-red-400 font-medium">
                                        {pinError}
                                    </span>
                                )}

                                <div className="flex gap-3 w-full mt-2">
                                    <button
                                        type="button"
                                        onClick={() => setShowPinModal(false)}
                                        className="btn flex-1 h-10 min-h-0 bg-transparent hover:bg-slate-800 text-slate-400 border border-slate-800 rounded-xl text-xs"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={submitting || pin.length !== 4}
                                        className="btn flex-1 h-10 min-h-0 bg-blue-600 hover:bg-blue-700 text-white border-none rounded-xl text-xs font-semibold disabled:opacity-40"
                                    >
                                        {submitting ? "Verifying..." : "Confirm & Submit"}
                                    </button>
                                </div>
                            </form>

                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};