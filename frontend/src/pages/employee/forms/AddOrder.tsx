import React from "react";

interface AddOrderModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const AddOrderModal: React.FC<AddOrderModalProps> = ({ isOpen, onClose }) => {
    if (!isOpen) return null;

    return (
        /* Full widescreen blur background screen mask layout sheet overlay zone */
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-6">
            <div className="bg-[#0b1326] border border-slate-800 w-full max-w-3xl h-[85vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden">

                {/* POPUP SUB-HEADER CONTROLS PANEL */}
                <div className="p-6 border-b border-slate-800/80 bg-[#060b14]/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h3 className="text-xl font-bold text-slate-100">Compile New Requisition Order</h3>
                        <p className="text-xs text-slate-400 mt-0.5">Select multiple database items, check inventory margins, and assign dispatch counts.</p>
                    </div>

                    {/* MODAL INTERNAL LOCAL SEARCH MECHANISM HEADER BOX */}
                    <input
                        type="text"
                        placeholder="Search workspace catalog..."
                        className="input max-w-xs bg-[#0a1224] border border-slate-800 rounded-xl text-xs h-10 text-slate-200 px-4 focus:outline-none focus:border-blue-500"
                    />
                </div>

                {/* SCROLLABLE MULTI-SELECT CATALOGUE SECTOR */}
                <div className="flex-1 overflow-y-auto p-6 scrollbar-thin space-y-3">

                    {/* ITEM CONFIG ROW BLOCK 1 */}
                    <div className="flex items-center justify-between p-4 bg-[#0a1224]/40 border border-slate-800/60 rounded-xl hover:border-slate-700/80 transition-all">

                        {/* Left Side: Checkbox + Name and Metadata */}
                        <div className="flex items-center gap-4">
                            <input type="checkbox" className="checkbox checkbox-primary rounded-md" />
                            <div>
                                <h4 className="text-sm font-medium text-slate-200">Fresh Whole Milk 1L</h4>
                                <span className="text-[11px] font-mono text-blue-400">ID: #0001 • Category: Dairy</span>
                            </div>
                        </div>

                        {/* Right Side: Flex container holding both Stock and Qty inputs side-by-side */}
                        <div className="flex items-center gap-6">
                            {/* MOVED HERE: Available Stock text pushed to the right side */}
                            <div className="text-[11px] font-medium text-slate-400 whitespace-nowrap">
                                Available Stock: <span className="text-slate-200">24 units</span>
                            </div>

                            {/* Quantity Inputs */}
                            <div className="flex items-center gap-3">
                                <label className="text-[11px] uppercase tracking-wide text-slate-500 font-semibold">QTY:</label>
                                <input
                                    type="number"
                                    min="1"
                                    defaultValue="4"
                                    className="input w-20 bg-[#060b14] border border-slate-800 text-center rounded-lg text-xs h-9 text-slate-200 focus:outline-none"
                                />
                            </div>
                        </div>

                    </div>

                    {/* ITEM CONFIG ROW BLOCK 2 */}
                    <div className="flex items-center justify-between p-4 bg-[#0a1224]/40 border border-slate-800/60 rounded-xl hover:border-slate-700/80 transition-all">

                        {/* Left Side: Checkbox + Name and Metadata */}
                        <div className="flex items-center gap-4">
                            <input type="checkbox" className="checkbox checkbox-primary rounded-md" />
                            <div>
                                <h4 className="text-sm font-medium text-slate-200">Eggplant</h4>
                                <span className="text-[11px] font-mono text-blue-400">ID: #0001 • Category: Vegetable</span>
                            </div>
                        </div>

                        {/* Right Side: Flex container holding both Stock and Qty inputs side-by-side */}
                        <div className="flex items-center gap-6">
                            {/* MOVED HERE: Available Stock text pushed to the right side */}
                            <div className="text-[11px] font-medium text-slate-400 whitespace-nowrap">
                                Available Stock: <span className="text-slate-200">11 units</span>
                            </div>

                            {/* Quantity Inputs */}
                            <div className="flex items-center gap-3">
                                <label className="text-[11px] uppercase tracking-wide text-slate-500 font-semibold">QTY:</label>
                                <input
                                    type="number"
                                    min="1"
                                    defaultValue="4"
                                    className="input w-20 bg-[#060b14] border border-slate-800 text-center rounded-lg text-xs h-9 text-slate-200 focus:outline-none"
                                />
                            </div>
                        </div>

                    </div>

                </div>

                {/* MODAL FOOTER ACTION TRIGGER PANEL BAR */}
                <div className="p-4 border-t border-slate-800/80 bg-[#060b14]/30 flex items-center justify-end gap-3">
                    <button
                        type="button"
                        onClick={onClose}
                        className="btn h-11 min-h-0 bg-transparent hover:bg-slate-800/50 text-slate-400 border border-slate-800 rounded-xl px-5 text-sm font-medium"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        onClick={onClose}
                        className="btn h-11 min-h-0 bg-blue-600 hover:bg-blue-700 text-white border-none rounded-xl px-6 text-sm font-medium shadow-lg shadow-blue-600/10"
                    >
                        Place Order
                    </button>
                </div>

            </div>
        </div>
    );
};
