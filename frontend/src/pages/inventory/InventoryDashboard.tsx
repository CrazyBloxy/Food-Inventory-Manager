import React, { useState } from "react";
import { MdDeleteForever, MdEdit } from "react-icons/md";

import { AddItemModal } from "./forms/AddItem";
import { EditItemModal } from "./forms/EditItem";

interface FoodItemStructure {
    id: number;
    item_name: string;
    amount: number;
    category: string;
    expiration_date: string;
    created_at: string;
    updated_at: string;
}

export const InventoryDashboard: React.FC = () => {
    const [activeModal, setActiveModal] = useState<"add" | "edit" | null>(null);

    const mockInventory: FoodItemStructure[] = [
        {
            id: 1,
            item_name: "Fresh Whole Milk 1L",
            amount: 24,
            category: "Dairy",
            expiration_date: "2026-10-05",
            created_at: "2026-09-28 01:00:00",
            updated_at: "2026-09-28 01:00:00"
        },
        {
            id: 2,
            item_name: "Raw Chicken Breast kg",
            amount: 0,
            category: "Meat & Poultry",
            expiration_date: "2026-10-02",
            created_at: "2026-09-25 14:20:00",
            updated_at: "2026-09-27 18:30:11"
        }
    ];

    return (
        <div className="w-full">
            <main className="p-8 flex flex-col gap-6 max-w-5xl mx-auto w-full">

                {/* HEADER SECTION */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-100">Food Inventory Manager</h1>
                        <p className="text-xs text-slate-400 mt-1">Track stocks and monitor shelf expirations.</p>
                    </div>

                    <div className="flex items-center gap-3 w-full max-w-md justify-end">
                        <input
                            type="text"
                            placeholder="Search Food Items..."
                            className="input w-full bg-[#0a1224] border border-slate-800 rounded-xl text-sm h-11 text-slate-200 px-4 focus:outline-none"
                        />
                        <button onClick={() => setActiveModal("add")} className="btn btn-primary h-11 min-h-0 rounded-xl font-medium text-sm border-none">
                            + Add Item
                        </button>
                    </div>
                </div>

                {/* SCROLLABLE TABLE CONTAINER */}
                <div className="bg-[#0b1326] rounded-2xl shadow-xl h-125 flex flex-col overflow-hidden">
                    <div className="flex-1 overflow-y-auto scrollbar-thin">
                        <table className="table w-full text-slate-300 table-pin-rows">
                            <thead>
                                <tr className="border-b border-slate-800 bg-[#060b14] text-slate-400 text-xs">
                                    <th className="py-4 px-6">ID</th>
                                    <th className="py-4 px-6">Item Name</th>
                                    <th className="py-4 px-6">Category</th>
                                    <th className="py-4 px-6">Stock Amount</th>
                                    <th className="py-4 px-6">Expiration Date</th>
                                    <th className="py-4 px-6 text-center">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {mockInventory.map((item) => (
                                    <tr key={item.id} className="border-b border-slate-800/50 hover:bg-slate-800/10 transition-colors">
                                        <td className="font-mono text-xs text-blue-400 py-4 px-6">
                                            #{String(item.id).padStart(4, '0')}
                                        </td>
                                        <td className="py-4 px-6 font-medium text-slate-100">
                                            {item.item_name}
                                        </td>
                                        <td className="py-4 px-6 text-xs text-slate-400">
                                            {item.category}
                                        </td>
                                        <td className="py-4 px-6">
                                            <span className={`text-sm font-semibold ${item.amount === 0 ? "text-error" : "text-slate-200"}`}>
                                                {item.amount} units
                                            </span>
                                        </td>
                                        <td className="font-mono text-xs py-4 px-6 text-slate-400">
                                            {item.expiration_date}
                                        </td>
                                        <td className="py-4 px-6 text-center">
                                            <div className="flex items-center justify-center gap-4">
                                                <button
                                                    onClick={() => setActiveModal("edit")}
                                                    className="btn btn-warning hover:scale-105 active:scale-95 transition-transform opacity-80 hover:opacity-100"
                                                    title="Modify Stock"
                                                >
                                                    <MdEdit size={22} />
                                                </button>
                                                <button
                                                    className="btn btn-error hover:scale-105 active:scale-95 transition-transform opacity-80 hover:opacity-100"
                                                    title="Remove Item"
                                                >
                                                    <MdDeleteForever size={22} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </main>
            <AddItemModal isOpen={activeModal === "add"} onClose={() => setActiveModal(null)} />
            <EditItemModal isOpen={activeModal === "edit"} onClose={() => setActiveModal(null)} />
        </div>
    );
};
