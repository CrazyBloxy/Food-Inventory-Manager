import React from "react";
import { useLocation } from "react-router-dom";



export const NavBar = () => {
    const location = useLocation();

    if (location.pathname === "/") {
        return null;
    }

    return (
        <aside className="w-64 bg-[#050811] border-r border-slate-800/60 flex flex-col shrink-0 h-screen sticky">
            <div className="p-6 border-b border-slate-800/40 flex items-center gap-3">
                <span className="text-xl font-bold text-blue-500 bg-blue-500/10 px-3 py-1 rounded">FP</span>
                <span className="text-xs uppercase tracking-widest text-slate-500 font-semibold">Food Portal</span>
            </div>

            <nav className="flex-1 p-4 space-y-1.5">
                <button 
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all`}>
                    Dashboard
                </button>
                
                <button className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all`}>
                    Audit Logs
                </button>
            </nav>

            <div className="p-4 border-t border-slate-800/60 bg-slate-950/40 flex items-center justify-between">
                <div>
                    <p className="text-xs font-semibold text-slate-300">System Admin</p>
                    <p className="text-[10px] text-slate-500">Admin Role</p>
                </div>
                <button className="text-xs text-slate-500 hover:text-rose-400 font-medium">
                    Logout
                </button>
            </div>
        </aside>
    );
};