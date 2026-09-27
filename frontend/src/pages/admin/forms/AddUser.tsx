interface AddUserModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const AddUserModal: React.FC<AddUserModalProps> = ({ isOpen, onClose }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
            <div className="bg-[#0b1326] border border-slate-800 w-full max-w-md rounded-2xl p-6 shadow-2xl flex flex-col gap-4">
                <div>
                    <h3 className="text-lg font-bold text-slate-100">Add New System User</h3>
                    <p className="text-xs text-slate-400 mt-0.5">Register account privileges to the inventory portal database.</p>
                </div>

                <form className="flex flex-col gap-4">
                    {/* Username */}
                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-semibold uppercase text-slate-400 tracking-wide">Username</label>
                        <input
                            type="text"
                            placeholder="e.g. jmiller"
                            className="input w-full bg-[#0a1224] border border-slate-800 rounded-xl text-sm h-11 text-slate-200 px-4 focus:outline-none focus:border-blue-500"
                        />
                    </div>

                    {/* Password */}
                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-semibold uppercase text-slate-400 tracking-wide">Password</label>
                        <input
                            type="password"
                            placeholder="••••••••"
                            className="input w-full bg-[#0a1224] border border-slate-800 rounded-xl text-sm h-11 text-slate-200 px-4 focus:outline-none focus:border-blue-500"
                        />
                    </div>

                    {/* PIN */}
                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-semibold uppercase text-slate-400 tracking-wide">Set PIN</label>
                        <input
                            type="password"
                            placeholder="4 to 6 digit security code"
                            className="input w-full bg-[#0a1224] border border-slate-800 rounded-xl text-sm h-11 text-slate-200 px-4 focus:outline-none focus:border-blue-500"
                        />
                    </div>

                    {/* Roles Selector Dropdown */}
                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-semibold uppercase text-slate-400 tracking-wide">User Role Permission</label>
                        <select className="select w-full bg-[#0a1224] border border-slate-800 rounded-xl text-sm h-11 text-slate-200 px-4 focus:outline-none focus:border-blue-500 appearance-none">
                            <option value="Employee">Employee</option>
                            <option value="Inventory Manager">Inventory Manager</option>
                        </select>
                    </div>

                    {/* Form Action Controls */}
                    <div className="flex items-center justify-end gap-3 mt-2">
                        <button onClick={onClose} type="button" className="btn h-11 min-h-0 bg-transparent hover:bg-slate-800/50 text-slate-400 border border-slate-800 rounded-xl px-4 text-sm font-medium">
                            Cancel
                        </button>
                        <button type="submit" className="btn h-11 min-h-0 bg-blue-600 hover:bg-blue-700 text-white border-none rounded-xl px-5 text-sm font-medium">
                            Save User
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}