import React, { useState, useEffect } from "react";
import { foodPantryService } from "../../services/api";
import { LuSearch, LuRefreshCw, LuShieldAlert } from "react-icons/lu";
import type { UniversalAuditLog } from "../../types";

// Function to calculate and isolate only fields that actually changed
const getChangedDelta = (oldVal: any, newVal: any) => {
    try {
        const parsedOld = typeof oldVal === 'string' ? JSON.parse(oldVal) : oldVal;
        const parsedNew = typeof newVal === 'string' ? JSON.parse(newVal) : newVal;

        if (!parsedOld || typeof parsedOld !== 'object') return { oldFormatted: formatObj(parsedOld), newFormatted: formatObj(parsedNew) };
        if (!parsedNew || typeof parsedNew !== 'object') return { oldFormatted: formatObj(parsedOld), newFormatted: formatObj(parsedNew) };

        const diffOld: Record<string, any> = {};
        const diffNew: Record<string, any> = {};

        // Find keys that were added or modified
        for (const [key, val] of Object.entries(parsedNew)) {
            if (JSON.parse(JSON.stringify(parsedOld[key])) !== JSON.parse(JSON.stringify(val))) {
                diffNew[key] = val;
                if (key in parsedOld) {
                    diffOld[key] = parsedOld[key];
                }
            }
        }

        return {
            oldFormatted: Object.keys(diffOld).length > 0 ? formatObj(diffOld) : null,
            newFormatted: Object.keys(diffNew).length > 0 ? formatObj(diffNew) : formatObj(parsedNew)
        };
    } catch {
        return { oldFormatted: formatValue(oldVal), newFormatted: formatValue(newVal) };
    }
};

const formatObj = (obj: any) => {
    if (typeof obj !== 'object' || obj === null) return String(obj);
    return Object.entries(obj)
        .map(([key, value]) => `${key}: ${value}`)
        .join(", ");
};

const formatValue = (val: string | Record<string, any> | null) => {
    if (!val) return null;
    try {
        const obj = typeof val === 'string' ? JSON.parse(val) : val;
        if (typeof obj === 'object' && obj !== null) {
            return formatObj(obj);
        }
        return String(val);
    } catch {
        return String(val).replace(/[{}]/g, '');
    }
};

export const AdminAuditLogs: React.FC = () => {
    const [auditLogs, setAuditLogs] = useState<UniversalAuditLog[]>([]);
    const [usersMap, setUsersMap] = useState<Record<number, string>>({});
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedAction, setSelectedAction] = useState<string>("all");

    // Fetch universal audit logs and user list concurrently to map usernames
    const fetchAuditData = async () => {
        setLoading(true);
        setError(null);
        try {
            const [logsData, usersData] = await Promise.all([
                typeof foodPantryService.getAuditLogs === 'function' ? foodPantryService.getAuditLogs() : [],
                typeof foodPantryService.getUsers === 'function' ? foodPantryService.getUsers() : []
            ]);

            const map: Record<number, string> = {};
            if (Array.isArray(usersData)) {
                usersData.forEach((u: any) => {
                    if (u.id) {
                        map[u.id] = u.username || u.name || `User #${u.id}`;
                    }
                });
            }

            setUsersMap(map);
            const cleanedLogs = Array.isArray(logsData)
                ? logsData.filter((l: any) => l.action_type !== "LOGIN_SUCCESS" && l.action_type !== "STOCK_OVERFLOW")
                : [];
            setAuditLogs(cleanedLogs);
        } catch (err: any) {
            console.error("Failed to fetch audit data:", err);
            setError(err.response?.data?.detail || "Could not load system audit logs or users map from the server.");
            setAuditLogs([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAuditData();
    }, []);

    const getResolvedUsername = (log: UniversalAuditLog): string => {
        if (log.username) return log.username;
        if (log.user_id && usersMap[log.user_id]) return usersMap[log.user_id];
        if (log.user_id) return `User #${log.user_id}`;
        return "System";
    };

    const filteredLogs = auditLogs.filter((log) => {
        const query = searchTerm.toLowerCase();
        const resolvedUsername = getResolvedUsername(log).toLowerCase();

        const matchesSearch =
            resolvedUsername.includes(query) ||
            (log.user_role?.toLowerCase() || "").includes(query) ||
            (log.target_table?.toLowerCase() || "").includes(query) ||
            String(log.record_id || "").includes(query) ||
            (log.timestamp || "").includes(query) ||
            (typeof log.new_value === 'string' ? log.new_value : JSON.stringify(log.new_value || "")).toLowerCase().includes(query);

        const matchesAction =
            selectedAction === "all" || log.action_type === selectedAction;

        return matchesSearch && matchesAction;
    });

    return (
        <div className="w-full">
            <main className="p-8 flex flex-col gap-6 max-w-5xl mx-auto w-full">

                {/* HEADER TITLE SECTION */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-100">System Audit Logs</h1>
                        <p className="text-xs text-slate-400 mt-1">Review universal system tracking logs and data state changes.</p>
                    </div>

                    <div className="flex items-center gap-3 w-full max-w-xl justify-end">
                        {/* Action Type Dropdown Filter */}
                        <select
                            value={selectedAction}
                            onChange={(e) => setSelectedAction(e.target.value)}
                            className="select bg-[#0a1224] border border-slate-800 rounded-xl text-sm h-11 text-slate-300 px-3 focus:outline-none focus:border-blue-500 transition-colors"
                        >
                            <option value="all">All Actions</option>
                            <option value="CREATE">CREATE</option>
                            <option value="UPDATE">UPDATE</option>
                            <option value="DELETE">DELETE</option>
                        </select>

                        {/* Search Input Bar */}
                        <div className="relative w-full">
                            <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-500">
                                <LuSearch size={16} />
                            </span>
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Filter Logs by user, target..."
                                className="input w-full bg-[#0a1224] border border-slate-800 rounded-xl text-sm h-11 text-slate-200 pl-10 pr-4 focus:outline-none focus:border-blue-500 transition-colors"
                            />
                        </div>

                        {/* Refresh Button */}
                        <button
                            onClick={fetchAuditData}
                            className="btn bg-[#0a1224] hover:bg-slate-800 border border-slate-800 text-slate-300 h-11 min-h-0 px-4 rounded-xl flex items-center justify-center shrink-0 transition-colors"
                            title="Refresh audit logs"
                        >
                            <LuRefreshCw size={16} className={loading ? "animate-spin text-blue-400" : ""} />
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

                {/* AUDIT RECORDS TABLE CONTAINER */}
                <div className="bg-[#0b1326] rounded-2xl shadow-xl h-125 flex flex-col overflow-hidden border border-slate-800/80">
                    <div className="flex-1 overflow-y-auto scrollbar-thin">
                        <table className="table w-full text-slate-300 table-pin-rows">
                            <thead>
                                <tr className="border-b border-slate-800 bg-[#060b14] text-slate-400 text-xs">
                                    <th className="py-4 px-4 bg-[#060b14]">Timestamp</th>
                                    <th className="py-4 px-4 bg-[#060b14]">Actor (ID)</th>
                                    <th className="py-4 px-6 bg-[#060b14]">Username</th>
                                    <th className="py-4 px-4 bg-[#060b14]">Action</th>
                                    <th className="py-4 px-4 bg-[#060b14]">Target Table</th>
                                    <th className="py-4 px-4 bg-[#060b14]">Record ID</th>
                                    <th className="py-4 px-4 bg-[#060b14]">Optimized Delta Changes</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr>
                                        <td colSpan={7} className="text-center py-20 text-slate-500 text-sm">
                                            Loading system audit records...
                                        </td>
                                    </tr>
                                ) : filteredLogs.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="text-center py-20 text-slate-500 text-sm">
                                            No matching audit logs found.
                                        </td>
                                    </tr>
                                ) : (
                                    filteredLogs.map((log) => {
                                        const { oldFormatted, newFormatted } = getChangedDelta(log.old_value, log.new_value);
                                        return (
                                            <tr key={log.id} className="border-b border-slate-800/50 hover:bg-slate-800/10 transition-colors text-sm">
                                                {/* Timestamp */}
                                                <td className="font-mono text-xs text-slate-400 py-4 px-4 whitespace-nowrap">
                                                    {log.timestamp}
                                                </td>

                                                {/* Actor Role & ID */}
                                                <td className="py-4 px-4">
                                                    <div className="flex flex-col">
                                                        <span className="font-medium text-slate-200">{log.user_role}</span>
                                                        <span className="text-[10px] text-slate-500 font-mono">ID: {log.user_id ?? "System"}</span>
                                                    </div>
                                                </td>

                                                {/* Resolved Username */}
                                                <td className="py-4 px-6 font-medium text-slate-200">
                                                    {getResolvedUsername(log)}
                                                </td>

                                                <td className="py-4 px-4">
                                                    {(() => {
                                                        const action = (log.action_type || "").toUpperCase();
                                                        const isCreate = action.includes("CREATE") || action.includes("ADD");
                                                        const isUpdate = action.includes("UPDATE") || action.includes("EDIT") || action.includes("PATCH");

                                                        return (
                                                            <span className={`text-[11px] font-bold px-2.5 py-1 rounded-md ${isCreate ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" :
                                                                    isUpdate ? "bg-amber-500/10 text-amber-400 border border-amber-500/20" :
                                                                        "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                                                                }`}>
                                                                {log.action_type}
                                                            </span>
                                                        );
                                                    })()}
                                                </td>

                                                {/* Target Table */}
                                                <td className="font-mono text-xs text-blue-400 py-4 px-4">
                                                    {log.target_table}
                                                </td>

                                                {/* Affected Record ID */}
                                                <td className="font-mono text-xs text-slate-300 py-4 px-4 font-semibold">
                                                    #{log.record_id}
                                                </td>

                                                {/* Optimized Delta State Changes */}
                                                <td className="py-4 px-4 font-mono text-xs">
                                                    <div className="flex flex-col gap-1 max-w-xs wrap-break-words">
                                                        {oldFormatted && (
                                                            <span className="text-rose-400 leading-tight">
                                                                <span className="font-semibold">Old:</span> {oldFormatted}
                                                            </span>
                                                        )}
                                                        {newFormatted && (
                                                            <span className="text-emerald-400 leading-tight">
                                                                <span className="font-semibold">New:</span> {newFormatted}
                                                            </span>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

            </main>
        </div>
    );
};