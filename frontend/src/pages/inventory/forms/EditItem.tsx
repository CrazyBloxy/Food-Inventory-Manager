import React, { useState, useEffect } from "react";
import { foodPantryService } from "../../../services/api";
import { LuLock, LuX, LuShieldAlert } from "react-icons/lu";
import type { InventoryItem, Category } from "../../../types";

interface EditInventoryModalProps {
    isOpen: boolean;
    onClose: () => void;
    item: InventoryItem | null;
    categories?: Category[];
    onSuccess?: () => void;
}

export const EditItemModal: React.FC<EditInventoryModalProps> = ({ 
    isOpen, 
    onClose, 
    item, 
    categories = [], 
    onSuccess 
}) => {
    // Form Input State
    const [itemName, setItemName] = useState("");
    const [amount, setAmount] = useState("");
    const [categoryId, setCategoryId] = useState<number | "">("");
    const [expirationDate, setExpirationDate] = useState("");
    const [formError, setFormError] = useState<string | null>(null);

    // 4-PIN Security Modal State
    const [showPinModal, setShowPinModal] = useState(false);
    const [pin, setPin] = useState("");
    const [pinError, setPinError] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);

    // Populate fields when modal opens or item changes
    useEffect(() => {
        if (isOpen && item) {
            setItemName(item.item_name || "");
            setAmount(item.amount !== undefined ? String(item.amount) : "");
            setCategoryId(item.category_id || (item.category?.id ?? ""));
            setExpirationDate(item.expiration_date || "");
            setFormError(null);
            setShowPinModal(false);
            setPin("");
            setPinError(null);
        }
    }, [isOpen, item]);

    if (!isOpen || !item) return null;

    // Step 1: Validate form values and trigger PIN Modal overlay
    const handleInitialSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!itemName.trim() || amount === "" || categoryId === "" || !expirationDate) {
            setFormError("Please fill in all required fields.");
            return;
        }

        setFormError(null);
        setPin("");
        setPinError(null);
        setShowPinModal(true);
    };

    // Step 2: Verify PIN & Execute PUT/PATCH Request to Update Item
    const handleFinalizeEdit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (pin.length !== 4) {
            setPinError("Please enter a valid 4-digit security PIN.");
            return;
        }

        setSubmitting(true);
        setPinError(null);

        const payload = {
            item_name: itemName.trim(),
            amount: Number(amount),
            category_id: Number(categoryId),
            expiration_date: expirationDate,
        };

        try {
            await foodPantryService.updateInventoryItem(item.id, payload, pin);

            if (onSuccess) onSuccess();
            onClose();
        } catch (err: any) {
            console.error("Failed to update inventory item:", err);
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
            <div className="bg-[#0b1326] border border-slate-800 w-full max-w-md rounded-2xl p-6 shadow-2xl flex flex-col gap-4 relative">
                <div>
                    <h3 className="text-lg font-bold text-slate-100">Update Item</h3>
                    <p className="text-xs text-slate-400 mt-0.5">Modify the active registry limits or product metadata tracking.</p>
                </div>

                {formError && (
                    <div className="bg-amber-500/10 border border-amber-500/20 text-amber-400 px-3 py-2 rounded-xl text-xs flex items-center gap-2">
                        <LuShieldAlert size={16} />
                        <span>{formError}</span>
                    </div>
                )}

                <form className="flex flex-col gap-4" onSubmit={handleInitialSubmit}>
                    {/* Item Name */}
                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-semibold uppercase text-slate-400 tracking-wide">Item Name</label>
                        <input 
                            type="text" 
                            placeholder="e.g. Fuji Apples Box" 
                            value={itemName}
                            onChange={(e) => setItemName(e.target.value)}
                            className="input w-full bg-[#0a1224] border border-slate-800 rounded-xl text-sm h-11 text-slate-200 px-4 focus:outline-none focus:border-blue-500" 
                            required 
                        />
                    </div>

                    {/* Stock Amount */}
                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-semibold uppercase text-slate-400 tracking-wide">Adjust Stock Count</label>
                        <input 
                            type="number" 
                            min="0" 
                            placeholder="0" 
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            className="input w-full bg-[#0a1224] border border-slate-800 rounded-xl text-sm h-11 text-slate-200 px-4 focus:outline-none focus:border-blue-500" 
                            required 
                        />
                    </div>

                    {/* Category Dropdown */}
                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-semibold uppercase text-slate-400 tracking-wide">Category</label>
                        <select 
                            value={categoryId}
                            onChange={(e) => setCategoryId(Number(e.target.value))}
                            className="select w-full bg-[#0a1224] border border-slate-800 rounded-xl text-sm h-11 text-slate-200 px-4 focus:outline-none focus:border-blue-500" 
                            required
                        >
                            <option value="" disabled>Select category...</option>
                            {categories.map((cat) => (
                                <option key={cat.id} value={cat.id}>
                                    {cat.category_name}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Expiration Date */}
                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-semibold uppercase text-slate-400 tracking-wide">Expiration Date</label>
                        <input 
                            type="date" 
                            value={expirationDate}
                            onChange={(e) => setExpirationDate(e.target.value)}
                            className="input w-full bg-[#0a1224] border border-slate-800 rounded-xl text-sm h-11 text-slate-200 px-4 focus:outline-none focus:border-blue-500" 
                            required 
                        />
                    </div>

                    {/* Action Controls */}
                    <div className="flex items-center justify-end gap-3 mt-2">
                        <button type="button" onClick={onClose} className="btn h-11 min-h-0 bg-transparent hover:bg-slate-800/50 text-slate-400 border border-slate-800 rounded-xl px-4 text-sm font-medium">
                            Cancel
                        </button>
                        <button type="submit" className="btn h-11 min-h-0 bg-amber-500 text-slate-900 border-none rounded-xl px-5 text-sm font-medium hover:bg-amber-600">
                            Update Batch
                        </button>
                    </div>
                </form>

                {/* 4-PIN VERIFICATION OVERLAY SUB-MODAL */}
                {showPinModal && (
                    <div className="absolute inset-0 z-50 bg-black/80 backdrop-blur-sm rounded-2xl flex items-center justify-center p-4">
                        <div className="bg-[#0b1326] border border-slate-700/80 w-full max-w-sm rounded-2xl p-6 shadow-2xl flex flex-col items-center text-center relative animate-in fade-in zoom-in duration-150">

                            <button
                                onClick={() => setShowPinModal(false)}
                                className="absolute top-4 right-4 text-slate-400 hover:text-slate-200"
                            >
                                <LuX size={18} />
                            </button>

                            <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-full text-amber-400 mb-3">
                                <LuLock size={24} />
                            </div>

                            <h4 className="text-lg font-bold text-slate-100">PIN Verification</h4>
                            <p className="text-xs text-slate-400 mt-1 mb-4">
                                Enter your 4-digit security PIN to authorize updating <span className="text-slate-200 font-semibold">{itemName}</span>.
                            </p>

                            <form onSubmit={handleFinalizeEdit} className="w-full flex flex-col items-center gap-4">
                                <input
                                    type="password"
                                    maxLength={4}
                                    autoFocus
                                    value={pin}
                                    onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))}
                                    placeholder="••••"
                                    className="input text-center tracking-[1em] text-xl font-mono w-40 h-12 bg-[#060b14] border border-slate-700 rounded-xl text-slate-100 focus:outline-none focus:border-amber-500"
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
                                        className="btn flex-1 h-10 min-h-0 bg-amber-500 hover:bg-amber-600 text-slate-900 border-none rounded-xl text-xs font-semibold disabled:opacity-40"
                                    >
                                        {submitting ? "Verifying..." : "Confirm Update"}
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