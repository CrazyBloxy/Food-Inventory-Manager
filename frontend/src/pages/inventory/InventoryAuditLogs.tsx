import React, { useEffect, useState } from "react";
import { LuShieldAlert, LuRefreshCw } from "react-icons/lu";
import { foodPantryService } from "../../services/api";
import type { UniversalAuditLog } from "../../types";

export const InventoryAuditLogs: React.FC = () => {
    const [logs, setLogs] = useState<UniversalAuditLog[]>([]);
    const [filterText, setFilterText] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Fetch audit logs from the API with loading & error handling
    const fetchAuditLogs = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await foodPantryService.getAuditLogs();
            setLogs(Array.isArray(data) ? data : []);
        } catch (err: any) {
            console.error("Failed to fetch audit logs:", err);
            setError(err.response?.data?.detail || "Unable to load audit logs. Please try again later.");
            setLogs([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAuditLogs();
    }, []);

    const formatTimestamp = (dateStr: string) => {
        try {
            return new Intl.DateTimeFormat("en-US", {
                dateStyle: "medium",
                timeStyle: "medium",
            }).format(new Date(dateStr));
        } catch {
            return dateStr;
        }
    };

    // Render State Delta
    const renderStateDelta = (value: any) => {
        if (!value) return <span className="text-slate-500">—</span>;

        let parsed = value;

        if (typeof value === "string") {
            try {
                parsed = JSON.parse(value);
            } catch {
                return <span className="font-mono text-[11px] text-slate-400">{value}</span>;
            }
        }

        if (typeof parsed === "object" && parsed !== null) {
            if (parsed.items && Array.isArray(parsed.items)) {
                return (
                    <span className="text-slate-200">
                        Taken: {parsed.items.map((i: any) => `${i.name || i.item_name} (x${i.quantity})`).join(", ")}
                    </span>
                );
            }

            if (parsed.total_items !== undefined) {
                return <span className="text-slate-300">Total Items Taken: {parsed.total_items}</span>;
            }

            return (
                <span className="text-slate-300 font-mono text-[11px]">
                    {Object.entries(parsed)
                        .map(([k, v]) => `${k}: ${typeof v === "object" ? JSON.stringify(v) : v}`)
                        .join(", ")}
                </span>
            );
        }

        return <span className="text-slate-300 font-mono text-[11px]">{String(parsed)}</span>;
    };

    // Comprehensive filter logic: search by ID, username, action, table, record ID, or product names inside JSONB
    const filteredLogs = logs.filter((log) => {
        const query = filterText.toLowerCase();
        const logId = String(log.id);
        const username = (log.username || "").toLowerCase();
        const action = log.action_type.toLowerCase();
        const table = log.target_table.toLowerCase();
        const recordId = String(log.record_id);

        const oldValueStr = log.old_value ? JSON.stringify(log.old_value).toLowerCase() : "";
        const newValueStr = log.new_value ? JSON.stringify(log.new_value).toLowerCase() : "";

        return (
            logId.includes(query) ||
            username.includes(query) ||
            action.includes(query) ||
            table.includes(query) ||
            recordId.includes(query) ||
            oldValueStr.includes(query) ||
            newValueStr.includes(query)
        );
    });

    return (
        <div className="w-full">
            <main className="p-8 flex flex-col gap-6 max-w-5xl mx-auto w-full">

                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-100">System Audit Logs</h1>
                        <p className="text-xs text-slate-400 mt-1">
                            Review global system tracking logs and data state changes.
                        </p>
                    </div>

                    <div className="flex items-center gap-3 w-full max-w-md justify-end">
                        <input
                            type="text"
                            placeholder="Filter by ID, product, user, action..."
                            value={filterText}
                            onChange={(e) => setFilterText(e.target.value)}
                            className="input w-full bg-[#0a1224] border border-slate-800 rounded-xl text-sm h-11 text-slate-200 px-4 focus:outline-none focus:border-blue-500 transition-colors"
                        />
                        <button
                            onClick={fetchAuditLogs}
                            className="btn bg-[#0a1224] hover:bg-slate-800 border border-slate-800 text-slate-300 h-11 min-h-0 px-4 rounded-xl flex items-center justify-center shrink-0 transition-colors"
                            title="Refresh logs"
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

                <div className="bg-[#0b1326] rounded-2xl shadow-xl h-125 flex flex-col overflow-hidden border border-slate-800/80">
                    <div className="flex-1 overflow-y-auto scrollbar-thin">
                        {loading ? (
                            <div className="flex justify-center items-center h-full text-slate-400 text-sm">
                                Loading audit logs...
                            </div>
                        ) : filteredLogs.length === 0 ? (
                            <div className="flex justify-center items-center h-full text-slate-500 text-sm">
                                No audit logs found.
                            </div>
                        ) : (
                            <table className="table w-full text-slate-300 table-pin-rows">
                                <thead>
                                    <tr className="border-b border-slate-800 bg-[#060b14] text-slate-400 text-xs">
                                        <th className="py-4 px-6 bg-[#060b14]">ID / Timestamp</th>
                                        <th className="py-4 px-6 bg-[#060b14]">User (ID)</th>
                                        <th className="py-4 px-6 bg-[#060b14]">Action</th>
                                        <th className="py-4 px-6 bg-[#060b14]">Target Table</th>
                                        <th className="py-4 px-6 bg-[#060b14]">Record ID</th>
                                        <th className="py-4 px-6 bg-[#060b14]">State Delta</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredLogs.map((log) => (
                                        <tr
                                            key={log.id}
                                            className="border-b border-slate-800/50 hover:bg-slate-800/10 transition-colors text-sm"
                                        >
                                            <td className="font-mono text-xs text-slate-400 py-4 px-6 whitespace-nowrap">
                                                <div className="text-slate-200 font-semibold">#{log.id}</div>
                                                <div className="text-[11px] text-slate-500">{formatTimestamp(log.timestamp)}</div>
                                            </td>
                                            <td className="py-4 px-6">
                                                <div className="flex flex-col">
                                                    <span className="font-medium text-slate-200">
                                                        {log.username || "System"}
                                                    </span>
                                                    <span className="text-[10px] text-slate-500 font-mono">
                                                        ID: {log.user_id ?? "N/A"}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="py-4 px-6">
                                                <span
                                                    className={`text-[11px] font-bold px-2 py-0.5 rounded-md ${
                                                        log.action_type === "CREATE"
                                                            ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                                                            : log.action_type === "DELETE"
                                                            ? "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                                                            : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                                                    }`}
                                                >
                                                    {log.action_type}
                                                </span>
                                            </td>
                                            <td className="font-mono text-xs text-blue-400 py-4 px-6">
                                                {log.target_table}
                                            </td>
                                            <td className="font-mono text-xs text-slate-300 py-4 px-6 font-semibold">
                                                #{log.record_id}
                                            </td>
                                            <td className="py-4 px-6 max-w-xs text-xs text-slate-300">
                                                <div className="flex flex-col gap-1">
                                                    {log.old_value && (
                                                        <div className="text-[11px] text-slate-500 line-through">
                                                            Old: {renderStateDelta(log.old_value)}
                                                        </div>
                                                    )}
                                                    <div>{renderStateDelta(log.new_value)}</div>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>

            </main>
        </div>
    );
};