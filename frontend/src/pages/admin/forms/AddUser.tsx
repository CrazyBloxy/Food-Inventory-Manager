import React, { useState, useEffect } from "react";
import { foodPantryService } from "../../../services/api";
import { LuLock, LuX, LuShieldAlert } from "react-icons/lu";

interface AddUserModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess?: () => void;
}

export const AddUserModal: React.FC<AddUserModalProps> = ({ 
    isOpen, 
    onClose, 
    onSuccess 
}) => {
    // Form Input State
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [userPin, setUserPin] = useState("");
    const [roleId, setRoleId] = useState<number | "">(3); // Default to Employee (3)
    const [formError, setFormError] = useState<string | null>(null);

    // 4-PIN Security Modal State
    const [showPinModal, setShowPinModal] = useState(false);
    const [adminPin, setAdminPin] = useState("");
    const [pinError, setPinError] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);

    // Reset form fields when modal opens/closes
    useEffect(() => {
        if (isOpen) {
            setUsername("");
            setPassword("");
            setUserPin("");
            setRoleId(3);
            setFormError(null);
            setShowPinModal(false);
            setAdminPin("");
            setPinError(null);
        }
    }, [isOpen]);

    if (!isOpen) return null;

    // Step 1: Validate form values and trigger PIN Modal overlay
    const handleInitialSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!username.trim() || !password || !userPin || roleId === "") {
            setFormError("Please fill in all required user fields.");
            return;
        }

        if (userPin.length !== 4) {
            setFormError("User PIN must be a 4-digit code.");
            return;
        }

        setFormError(null);
        setAdminPin("");
        setPinError(null);
        setShowPinModal(true);
    };

    // Step 2: Verify Admin PIN & Execute POST Request to Create User
    const handleFinalizeAdd = async (e: React.FormEvent) => {
        e.preventDefault();
        if (adminPin.length !== 4) {
            setPinError("Please enter a valid 4-digit security PIN.");
            return;
        }

        setSubmitting(true);
        setPinError(null);

        const payload = {
            username: username.trim(),
            password: password,
            pin: userPin,
            role_id: Number(roleId),
        };

        try {
            // Passes the payload and the admin pin header authorization
            await foodPantryService.createUser(payload, adminPin);

            if (onSuccess) onSuccess();
            onClose();
        } catch (err: any) {
            console.error("Failed to create user:", err);
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
                    <h3 className="text-lg font-bold text-slate-100">Add New User</h3>
                    <p className="text-xs text-slate-400 mt-0.5">Register account privileges to the inventory portal database.</p>
                </div>

                {formError && (
                    <div className="bg-amber-500/10 border border-amber-500/20 text-amber-400 px-3 py-2 rounded-xl text-xs flex items-center gap-2">
                        <LuShieldAlert size={16} />
                        <span>{formError}</span>
                    </div>
                )}

                <form className="flex flex-col gap-4" onSubmit={handleInitialSubmit}>
                    {/* Username */}
                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-semibold uppercase text-slate-400 tracking-wide">Username</label>
                        <input 
                            type="text" 
                            placeholder="e.g. John Miller" 
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="input w-full bg-[#0a1224] border border-slate-800 rounded-xl text-sm h-11 text-slate-200 px-4 focus:outline-none focus:border-blue-500" 
                            required 
                        />
                    </div>

                    {/* Password */}
                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-semibold uppercase text-slate-400 tracking-wide">Password</label>
                        <input 
                            type="password" 
                            placeholder="••••••••" 
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="input w-full bg-[#0a1224] border border-slate-800 rounded-xl text-sm h-11 text-slate-200 px-4 focus:outline-none focus:border-blue-500" 
                            required 
                        />
                    </div>

                    {/* User PIN */}
                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-semibold uppercase text-slate-400 tracking-wide">User PIN</label>
                        <input 
                            type="password" 
                            maxLength={4}
                            placeholder="4-digit code" 
                            value={userPin}
                            onChange={(e) => setUserPin(e.target.value.replace(/\D/g, ""))}
                            className="input w-full bg-[#0a1224] border border-slate-800 rounded-xl text-sm h-11 text-slate-200 px-4 focus:outline-none focus:border-blue-500 font-mono tracking-widest" 
                            required 
                        />
                    </div>

                    {/* User Role Permission Dropdown */}
                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-semibold uppercase text-slate-400 tracking-wide">User Role Permission</label>
                        <select 
                            value={roleId}
                            onChange={(e) => setRoleId(Number(e.target.value))}
                            className="select w-full bg-[#0a1224] border border-slate-800 rounded-xl text-sm h-11 text-slate-200 px-4 focus:outline-none focus:border-blue-500" 
                            required
                        >
                            <option value={3}>Employee</option>
                            <option value={2}>Inventory Manager</option>
                            <option value={1}>Admin</option>
                        </select>
                    </div>

                    {/* Action Controls */}
                    <div className="flex items-center justify-end gap-3 mt-2">
                        <button type="button" onClick={onClose} className="btn h-11 min-h-0 bg-transparent hover:bg-slate-800/50 text-slate-400 border border-slate-800 rounded-xl px-4 text-sm font-medium">
                            Cancel
                        </button>
                        <button type="submit" className="btn h-11 min-h-0 bg-blue-600 hover:bg-blue-700 text-white border-none rounded-xl px-5 text-sm font-medium">
                            Add User
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

                            <div className="p-3 bg-blue-600/10 border border-blue-500/20 rounded-full text-blue-400 mb-3">
                                <LuLock size={24} />
                            </div>

                            <h4 className="text-lg font-bold text-slate-100">PIN Verification</h4>
                            <p className="text-xs text-slate-400 mt-1 mb-4">
                                Enter your 4-digit security PIN to authorize adding user <span className="text-slate-200 font-semibold">{username}</span>.
                            </p>

                            <form onSubmit={handleFinalizeAdd} className="w-full flex flex-col items-center gap-4">
                                <input
                                    type="password"
                                    maxLength={4}
                                    autoFocus
                                    value={adminPin}
                                    onChange={(e) => setAdminPin(e.target.value.replace(/\D/g, ""))}
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
                                        disabled={submitting || adminPin.length !== 4}
                                        className="btn flex-1 h-10 min-h-0 bg-blue-600 hover:bg-blue-700 text-white border-none rounded-xl text-xs font-semibold disabled:opacity-40"
                                    >
                                        {submitting ? "Verifying..." : "Confirm & Save"}
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