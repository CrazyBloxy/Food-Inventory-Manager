import React, { useState, useEffect } from "react";
import { AddUserModal } from "./forms/AddUser";


export const AdminDashboard: React.FC = () => {
    const [openPopup, setOpenPopup] = useState<boolean>(false);


    return (
        <div className="w-full">
            <main className="p-8 flex flex-col gap-6 max-w-5xl mx-auto w-full">

                {/* HEADER SECTION */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-100">Admin Dashboard</h1>
                        <p className="text-xs text-slate-400 mt-1">Manage system user entries.</p>
                    </div>

                    {/* SEARCH INPUT & ADD USER BUTTON ROW */}
                    <div className="flex items-center gap-3 w-full max-w-md justify-end">
                        <input
                            type="text"
                            placeholder="Search Users..."
                            className="input w-full bg-[#0a1224] border border-slate-800 rounded-xl text-sm h-11 text-slate-200 px-4 focus:outline-none"
                        />
                        <button onClick={() => setOpenPopup(true)} className="btn btn-primary">
                            + Add User
                        </button>
                    </div>
                </div>

                {/* USER GRID TABLE CONTAINER */}
                <div className="bg-[#0b1326] border border-slate-800/80 rounded-2xl overflow-hidden shadow-xl">
                    <table className="table w-full text-slate-300">
                        <thead>
                            <tr className="border-b border-slate-800 bg-[#060b14] text-slate-400 text-xs">
                                <th className="py-4 px-6">User ID</th>
                                <th className="py-4 px-6">Name</th>
                                <th className="py-4 px-6">Role</th>
                                <th className="py-4 px-6">Status</th>
                                <th className="py-4 px-6 text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr className="border-b border-slate-800/50">
                                <td className="font-mono text-xs text-blue-400 py-4 px-6">Admin-001</td>
                                <td className="py-4 px-6">J. Miller</td>
                                <td className="py-4 px-6">Employee</td>
                                <td className="py-4 px-6 text-emerald-400 text-xs">● Active</td>
                                <td className="py-4 px-6 text-center text-xs space-x-3">
                                    <button className="text-blue-400 hover:underline">Edit</button>
                                    <button className="text-rose-400 hover:underline">Delete</button>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </main>
            <AddUserModal isOpen={openPopup} onClose={() => setOpenPopup(false)} />
        </div>
    );
};