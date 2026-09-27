import React, { useState } from "react";
import { AddOrderModal } from "./forms/AddOrder";

interface InventoryItem {
    id: number;
    item_name: string;
    amount: number;
    category: string;
    expiration_date: string;
}

export const EmployeeDashboard: React.FC = () => {
    const [openOrderModal, setOpenOrderModal] = useState<boolean>(false);

    // Read-only stock snapshot for the employee view grid
    const mockInventory: InventoryItem[] = [
        { id: 1, item_name: "Fresh Whole Milk 1L", amount: 24, category: "Dairy", expiration_date: "2026-10-05" },
        { id: 2, item_name: "Raw Chicken Breast kg", amount: 0, category: "Meat & Poultry", expiration_date: "2026-10-02" },
        { id: 3, item_name: "Romaine Lettuce Bunch", amount: 8, category: "Produce", expiration_date: "2026-10-01" }
    ];

    return (
        <div className="w-full">
            <main className="p-8 flex flex-col gap-6 max-w-5xl mx-auto w-full">
                
                {/* HEADER ROW */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-100">Store Room Inventory</h1>
                        <p className="text-xs text-slate-400 mt-1">View available kitchen stocks and compile requisition orders.</p>
                    </div>

                    <div className="flex items-center gap-3 w-full max-w-md justify-end">
                        <input
                            type="text"
                            placeholder="Filter Stock..."
                            className="input w-full bg-[#0a1224] border border-slate-800 rounded-xl text-sm h-11 text-slate-200 px-4 focus:outline-none"
                        />
                        <button 
                            onClick={() => setOpenOrderModal(true)} 
                            className="btn btn-primary h-11 min-h-0 rounded-xl font-medium text-sm border-none px-5"
                        >
                           + Create Order
                        </button>
                    </div>
                </div>

                {/* INVENTORY TABLE WORKSPACE */}
                <div className="bg-[#0b1326] rounded-2xl shadow-xl h-125 flex flex-col overflow-hidden">
                    <div className="flex-1 overflow-y-auto scrollbar-thin">
                        <table className="table w-full text-slate-300 table-pin-rows">
                            <thead>
                                <tr className="border-b border-slate-800 bg-[#060b14] text-slate-400 text-xs">
                                    <th className="py-4 px-6">ID</th>
                                    <th className="py-4 px-6">Item Name</th>
                                    <th className="py-4 px-6">Category</th>
                                    <th className="py-4 px-6">Available Stock</th>
                                    <th className="py-4 px-6">Expiration Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {mockInventory.map((item) => (
                                    <tr key={item.id} className="border-b border-slate-800/50 hover:bg-slate-800/10 transition-colors">
                                        <td className="font-mono text-xs text-blue-400 py-4 px-6">#{String(item.id).padStart(4, '0')}</td>
                                        <td className="py-4 px-6 font-medium text-slate-100">{item.item_name}</td>
                                        <td className="py-4 px-6 text-xs text-slate-400">{item.category}</td>
                                        <td className="py-4 px-6">
                                            <span className={`text-sm font-semibold ${item.amount === 0 ? "text-error" : "text-slate-200"}`}>
                                                {item.amount} units
                                            </span>
                                        </td>
                                        <td className="font-mono text-xs py-4 px-6 text-slate-400">{item.expiration_date}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </main>

            {/* FULL SCREEN REQUISITION WORKSPACE */}
            <AddOrderModal isOpen={openOrderModal} onClose={() => setOpenOrderModal(false)} />
        </div>
    );
};
