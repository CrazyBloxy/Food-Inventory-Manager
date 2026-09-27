import React from "react";

interface EditInventoryModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const EditItemModal: React.FC<EditInventoryModalProps> = ({ isOpen, onClose }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
            <div className="bg-[#0b1326] border border-slate-800 w-full max-w-md rounded-2xl p-6 shadow-2xl flex flex-col gap-4">
                <div>
                    <h3 className="text-lg font-bold text-slate-100">Update Stock Levels</h3>
                    <p className="text-xs text-slate-400 mt-0.5">Modify the active registry limits or product metadata tracking.</p>
                </div>

                <form className="flex flex-col gap-4" onSubmit={(e) => { e.preventDefault(); onClose(); }}>
                    {/* Item Name */}
                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-semibold uppercase text-slate-400 tracking-wide">Item Name</label>
                        <input 
                            type="text" 
                            placeholder="e.g. Fuji Apples Box" 
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
                            className="input w-full bg-[#0a1224] border border-slate-800 rounded-xl text-sm h-11 text-slate-200 px-4 focus:outline-none focus:border-blue-500" 
                            required 
                        />
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-semibold uppercase text-slate-400 tracking-wide">Category</label>
                        <input 
                            type="number" 
                            min="0" 
                            placeholder="0" 
                            className="input w-full bg-[#0a1224] border border-slate-800 rounded-xl text-sm h-11 text-slate-200 px-4 focus:outline-none focus:border-blue-500" 
                            required 
                        />
                    </div>

                    {/* Expiration Date */}
                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-semibold uppercase text-slate-400 tracking-wide">Expiration Date</label>
                        <input 
                            type="date" 
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
            </div>
        </div>
    );
};
