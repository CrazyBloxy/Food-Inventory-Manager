import React, { useState, useEffect } from "react";
import { LuShieldAlert, LuSearch, LuRefreshCw } from "react-icons/lu";
import { foodPantryService } from "../../services/api";
import type { EmployeeAuditLogStructure } from "../../types";

export const EmployeeAuditLogs: React.FC = () => {
    const [logs, setLogs] = useState<EmployeeAuditLogStructure[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const fetchAuditLogs = async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await foodPantryService.getAuditLogs();
            setLogs(Array.isArray(data) ? data : []);
        } catch (err: any) {
            console.error("Failed to fetch audit logs:", err);
            setError(err.response?.data?.detail || "Could not load audit logs from the server.");
            setLogs([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAuditLogs();
    }, []);

    // Filter logs based on search input
    const filteredLogs = logs.filter((log) =>
        String(log.user_id).includes(searchTerm) ||
        (log.user_role?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
        (log.target_table?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
        (log.action_type?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
        (JSON.stringify(log.new_value)?.toLowerCase() || "").includes(searchTerm.toLowerCase())
    );

    return (
        <div className="w-full">
            <main className="p-8 flex flex-col gap-6 max-w-5xl mx-auto w-full">

                {/* HEADER SECTION */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-100">Order Logs</h1>
                        <p className="text-xs text-slate-400 mt-1">Review recent session history and generated submission metrics logs.</p>
                    </div>

                    <div className="flex items-center gap-3 w-full max-w-md justify-end">
                        <div className="relative w-full">
                            <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-500">
                                <LuSearch size={16} />
                            </span>
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Filter Logs by user, action, or details..."
                                className="input w-full bg-[#0a1224] border border-slate-800 rounded-xl text-sm h-11 text-slate-200 pl-10 pr-4 focus:outline-none focus:border-blue-600 transition-colors"
                            />
                        </div>
                        <button
                            onClick={fetchAuditLogs}
                            className="btn bg-[#0a1224] hover:bg-slate-800 border border-slate-800 text-slate-300 h-11 min-h-0 px-4 rounded-xl"
                            title="Refresh logs"
                        >
                            <LuRefreshCw size={16} className={loading ? "animate-spin" : ""} />
                        </button>
                    </div>
                </div>

                {/* ERROR BANNER IF ANY */}
                {error && (
                    <div className="bg-amber-500/10 border border-amber-500/20 text-amber-400 px-4 py-3 rounded-xl text-xs flex items-center gap-2">
                        <LuShieldAlert size={16} />
                        <span>{error}</span>
                    </div>
                )}

                {/* SCROLLABLE TABLE CONTAINER */}
                <div className="bg-[#0b1326] rounded-2xl shadow-xl h-125 flex flex-col overflow-hidden border border-slate-800/60">
                    <div className="flex-1 overflow-y-auto scrollbar-thin">
                        <table className="table w-full text-slate-300 table-pin-rows">
                            <thead>
                                <tr className="border-b border-slate-800 bg-[#060b14] text-slate-400 text-xs">
                                    <th className="py-4 px-6 bg-[#060b14]">Timestamp</th>
                                    <th className="py-4 px-6 bg-[#060b14]">UserID</th>
                                    <th className="py-4 px-6 bg-[#060b14]">Action</th>
                                    <th className="py-4 px-6 bg-[#060b14]">Target Table</th>
                                    <th className="py-4 px-6 bg-[#060b14]">Record ID</th>
                                    <th className="py-4 px-6 bg-[#060b14]">Submission Details</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr>
                                        <td colSpan={6} className="text-center py-20 text-slate-500">
                                            Loading audit logs...
                                        </td>
                                    </tr>
                                ) : filteredLogs.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="text-center py-20 text-slate-500">
                                            No matching audit logs found.
                                        </td>
                                    </tr>
                                ) : (
                                    filteredLogs.map((log) => (
                                        <tr key={log.id} className="border-b border-slate-800/50 hover:bg-slate-800/10 transition-colors text-sm">
                                            <td className="py-4 px-6 text-xs text-slate-300">
                                                <div className="font-medium text-slate-100">
                                                    {new Date(log.timestamp).toLocaleString('en-US', {
                                                        year: 'numeric',
                                                        month: 'short',
                                                        day: 'numeric',
                                                        hour: '2-digit',
                                                        minute: '2-digit',
                                                        hour12: true
                                                    })}
                                                </div>
                                            </td>
                                            <td className="py-4 px-6 font-medium text-slate-200">
                                                <div className="flex flex-col">
                                                    <span className="text-slate-200 font-semibold font-mono">
                                                        User #{log.user_id}
                                                    </span>
                                                    <span className="text-[11px] font-mono text-slate-400">
                                                        Role: {log.user_role}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="py-4 px-6">
                                                <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400">
                                                    {log.action_type}
                                                </span>
                                            </td>
                                            <td className="font-mono text-xs text-blue-400 py-4 px-6">
                                                {log.target_table}
                                            </td>
                                            <td className="font-mono text-xs text-slate-300 py-4 px-6 font-semibold">
                                                {log.record_id}
                                            </td>
                                            <td
                                                className="py-4 px-6 max-w-xs font-mono text-xs text-slate-400"
                                                title={typeof log.new_value === 'string' ? log.new_value : JSON.stringify(log.new_value)}
                                            >
                                                {(() => {
                                                    let val: any = log.new_value;

                                                    if (typeof val === 'string') {
                                                        try { val = JSON.parse(val); } catch (e) { return log.new_value; }
                                                    }
                                                    if (typeof val === 'string') {
                                                        try { val = JSON.parse(val); } catch (e) { return String(log.new_value); }
                                                    }

                                                    // Display a clean, friendly summary using whatever total count is available
                                                    const count = val?.total_items ?? (Array.isArray(val?.items) ? val.items.length : 'some');

                                                    return (
                                                        <div className="text-slate-200 font-sans text-xs">
                                                            <span className="font-semibold text-blue-400">Placed an order:</span> Taken {count} Inventory Product(s)
                                                        </div>
                                                    );
                                                })()}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

            </main>
        </div>
    );
};