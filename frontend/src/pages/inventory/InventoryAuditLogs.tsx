import React, { useEffect, useState } from "react";
import { foodPantryService } from "../../services/api";
import type { UniversalAuditLog } from "../../types";

export const InventoryAuditLogs: React.FC = () => {
    const [logs, setLogs] = useState<UniversalAuditLog[]>([]);
    const [filterText, setFilterText] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Fetch audit logs from the API
    useEffect(() => {
        const fetchLogs = async () => {
            try {
                setLoading(true);
                setError(null);
                const data = await foodPantryService.getAuditLogs();
                setLogs(data);
            } catch (err: any) {
                console.error("Failed to fetch audit logs:", err);
                setError("Unable to load audit logs. Please try again later.");
            } finally {
                setLoading(false);
            }
        };

        fetchLogs();
    }, []);

    // Helper to format ISO timestamps cleanly
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

    // Helper to render human-readable State Delta (handling JSONB objects or stringified JSON)
    const renderStateDelta = (value: any) => {
        if (!value) return <span className="text-slate-500">—</span>;

        let parsed = value;

        // If it's a string, try to parse it as JSON
        if (typeof value === "string") {
            try {
                parsed = JSON.parse(value);
            } catch {
                // If it's just plain text, return it inside a span
                return <span className="font-mono text-[11px] text-slate-400">{value}</span>;
            }
        }

        // If it's an object or array (from JSONB or successful parse)
        if (typeof parsed === "object" && parsed !== null) {
            // Handle itemized order list format
            if (parsed.items && Array.isArray(parsed.items)) {
                return (
                    <span className="text-slate-200">
                        Taken: {parsed.items.map((i: any) => `${i.name || i.item_name} (x${i.quantity})`).join(", ")}
                    </span>
                );
            }

            // Handle legacy "total_items" format
            if (parsed.total_items !== undefined) {
                return <span className="text-slate-300">Total Items Taken: {parsed.total_items}</span>;
            }

            // Fallback for general objects (e.g. inventory/user updates)
            return (
                <span className="text-slate-300 font-mono text-[11px]">
                    {Object.entries(parsed)
                        .map(([k, v]) => `${k}: ${typeof v === "object" ? JSON.stringify(v) : v}`)
                        .join(", ")}
                </span>
            );
        }

        // Fallback for primitive values
        return <span className="text-slate-300 font-mono text-[11px]">{String(parsed)}</span>;
    };

    // Filter logic for table contents
    const filteredLogs = logs.filter((log) => {
        const query = filterText.toLowerCase();
        const action = log.action_type.toLowerCase();
        const table = log.target_table.toLowerCase();
        const id = String(log.record_id);
        const logId = String(log.id);
        const recordId = String(log.record_id);
        const oldValueStr = log.old_value ? JSON.stringify(log.old_value).toLowerCase() : "";
        const newValueStr = log.new_value ? JSON.stringify(log.new_value).toLowerCase() : "";

        return (
            logId.includes(query) ||
            action.includes(query) ||
            table.includes(query) ||
            id.includes(query) ||
            recordId.includes(query) ||
            oldValueStr.includes(query) || 
            newValueStr.includes(query)
        );
    });

    return (
        <div className="w-full">
            <main className="p-8 flex flex-col gap-6 max-w-5xl mx-auto w-full">

                {/* HEADER SECTION */}
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
                            placeholder="Filter by user, action, table..."
                            value={filterText}
                            onChange={(e) => setFilterText(e.target.value)}
                            className="input w-full bg-[#0a1224] border border-slate-800 rounded-xl text-sm h-11 text-slate-200 px-4 focus:outline-none focus:border-blue-500 transition-colors"
                        />
                    </div>
                </div>

                {/* SCROLLABLE AUDIT TABLE CONTAINER */}
                <div className="bg-[#0b1326] rounded-2xl shadow-xl h-125 flex flex-col overflow-hidden border border-slate-800/80">
                    <div className="flex-1 overflow-y-auto scrollbar-thin">
                        {loading ? (
                            <div className="flex justify-center items-center h-full text-slate-400 text-sm">
                                Loading audit logs...
                            </div>
                        ) : error ? (
                            <div className="flex justify-center items-center h-full text-rose-400 text-sm p-4">
                                {error}
                            </div>
                        ) : filteredLogs.length === 0 ? (
                            <div className="flex justify-center items-center h-full text-slate-500 text-sm">
                                No audit logs found.
                            </div>
                        ) : (
                            <table className="table w-full text-slate-300 table-pin-rows">
                                <thead>
                                    <tr className="border-b border-slate-800 bg-[#060b14] text-slate-400 text-xs">
                                        <th className="py-4 px-6">Timestamp</th>
                                        <th className="py-4 px-6">User (ID)</th>
                                        <th className="py-4 px-6">Action</th>
                                        <th className="py-4 px-6">Target Table</th>
                                        <th className="py-4 px-6">Record ID</th>
                                        <th className="py-4 px-6">State Delta</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredLogs.map((log) => (
                                        <tr
                                            key={log.id}
                                            className="border-b border-slate-800/50 hover:bg-slate-800/10 transition-colors text-sm"
                                        >
                                            <td className="font-mono text-xs text-slate-400 py-4 px-6 whitespace-nowrap">
                                                {formatTimestamp(log.timestamp)}
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
                                                    className={`text-[11px] font-bold px-2 py-0.5 rounded-md ${log.action_type === "CREATE"
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