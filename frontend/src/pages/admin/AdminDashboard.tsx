import React, { useState, useEffect } from "react";

import { MdDeleteForever, MdEdit } from "react-icons/md";

import { AddUserModal } from "./forms/AddUser";
import { EditUserModal } from "./forms/EditUser";


export const AdminDashboard: React.FC = () => {
    const [activeModal, setActiveModal] = useState<"add" | "edit" | null>(null);


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
                        <button onClick={() => setActiveModal("add")} className="btn btn-primary">
                            + Add User
                        </button>
                    </div>
                </div>

                {/* USER GRID TABLE CONTAINER */}
                <div className="bg-[#0b1326] rounded-2xl shadow-xl h-125 flex flex-col overflow-hidden">

                    {/* 2. Scrollable wrapper body content section */}
                    <div className="flex-1 overflow-y-auto scrollbar-thin">
                        <table className="table w-full text-slate-300 table-pin-rows">
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
                                    <td className="font-mono text-xs text-blue-400 py-4 px-6">1</td>
                                    <td className="py-4 px-6">J. Miller</td>
                                    <td className="py-4 px-6">Employee</td>
                                    <td className="py-4 px-6 text-emerald-400 text-xs">● Active</td>
                                    <td className="py-4 px-6 text-center">
                                        <div className="flex items-center justify-center gap-4">

                                            {/* Edit Icon Button */}
                                            <button
                                                onClick={() => setActiveModal("edit")}
                                                className="btn btn-warning hover:scale-105 active:scale-95 transition-transform opacity-80 hover:opacity-100"
                                                title="Edit User"
                                            >
                                                <MdEdit size={22} />
                                            </button>

                                            {/* Delete Icon Button */}
                                            <button
                                                className="btn btn-error hover:scale-105 active:scale-95 transition-transform opacity-80 hover:opacity-100"
                                                title="Delete User"
                                            >
                                                <MdDeleteForever size={22} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </main>
            <AddUserModal isOpen={activeModal === "add"} onClose={() => setActiveModal(null)} />
            <EditUserModal isOpen={activeModal === "edit"} onClose={() => setActiveModal(null)} />
        </div>
    );
};