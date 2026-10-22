import React from "react";

interface AuditLogStructure {
    id: number;
    user_id: number | null;
    username: string;
    action_type: "CREATE" | "UPDATE" | "DELETE";
    target_table: "users" | "inventory" | "orders" | "order_items" | "audit_logs";
    record_id: number;
    old_value: string | null;
    new_value: string;
    timestamp: string;
}

export const InventoryAuditLogs: React.FC = () => {
    // Basic static layout mock data mapping exactly to your table parameters
    const mockLogs: AuditLogStructure[] = [
        {
            id: 1,
            user_id: 1,
            username: "Nagisa Furukawa",
            action_type: "CREATE",
            target_table: "orders",
            record_id: 104,
            old_value: null,
            new_value: '{"order": "Milk"}',
            timestamp: "2026-09-28 01:10:22"
        },
        {
            id: 2,
            user_id: 2,
            username: "Kasane Teto",
            action_type: "UPDATE",
            target_table: "inventory",
            record_id: 54,
            old_value: '{"amount": 12}',
            new_value: '{"amount": 42}',
            timestamp: "2026-09-28 01:05:14"
        }
    ];

    return (
        <div className="w-full">
            <main className="p-8 flex flex-col gap-6 max-w-5xl mx-auto w-full">

                {/* HEADER SECTION */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-100">System Audit Logs</h1>
                        <p className="text-xs text-slate-400 mt-1">Review global system tracking logs and data state changes.</p>
                    </div>

                    <div className="flex items-center gap-3 w-full max-w-md justify-end">
                        <input
                            type="text"
                            placeholder="Filter Logs..."
                            className="input w-full bg-[#0a1224] border border-slate-800 rounded-xl text-sm h-11 text-slate-200 px-4 focus:outline-none"
                        />
                    </div>
                </div>

                {/* SCROLLABLE AUDIT TABLE CONTAINER */}
                <div className="bg-[#0b1326] rounded-2xl shadow-xl h-125 flex flex-col overflow-hidden">
                    <div className="flex-1 overflow-y-auto scrollbar-thin">
                        <table className="table w-full text-slate-300 table-pin-rows">
                            <thead>
                                <tr className="border-b border-slate-800 bg-[#060b14] text-slate-400 text-xs">
                                    <th className="py-4 px-6">Timestamp</th>
                                    <th className="py-4 px-6">User (ID)</th>
                                    <th className="py-4 px-6">Action</th>
                                    <th className="py-4 px-6">Target Table</th>
                                    <th className="py-4 px-6">Record ID</th>
                                    <th className="py-4 px-6">State Delta (JSON)</th>
                                </tr>
                            </thead>
                            <tbody>
                                {mockLogs.map((log) => (
                                    <tr key={log.id} className="border-b border-slate-800/50 hover:bg-slate-800/10 transition-colors text-sm">
                                        <td className="font-mono text-xs text-slate-400 py-4 px-6 whitespace-nowrap">
                                            {log.timestamp}
                                        </td>
                                        <td className="py-4 px-6">
                                            <div className="flex flex-col">
                                                <span className="font-medium text-slate-200">{log.username}</span>
                                                <span className="text-[10px] text-slate-500 font-mono">ID: {log.user_id}</span>
                                            </div>
                                        </td>
                                        <td className="py-4 px-6">
                                            <span className={`text-[11px] font-bold px-2 py-0.5 rounded-md ${
                                                log.action_type === "CREATE" ? "bg-emerald-500/10 text-emerald-400" : "bg-amber-500/10 text-amber-400"
                                            }`}>
                                                {log.action_type}
                                            </span>
                                        </td>
                                        <td className="font-mono text-xs text-blue-400 py-4 px-6">
                                            {log.target_table}
                                        </td>
                                        <td className="font-mono text-xs text-slate-300 py-4 px-6 font-semibold">
                                            {log.record_id}
                                        </td>
                                        <td className="py-4 px-6 max-w-xs truncate font-mono text-xs text-slate-400" title={log.new_value}>
                                            {log.old_value ? `Old: ${log.old_value} → ` : ""}New: {log.new_value}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

            </main>
        </div>
    );
};
