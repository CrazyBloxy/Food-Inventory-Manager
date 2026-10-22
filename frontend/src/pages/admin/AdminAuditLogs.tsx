import React from "react";

// interface defining your exact PostgreSQL audit_logs database columns
interface AuditLogStructure {
    id: number;
    user_id: number | null;
    username: string;
    user_role: "Admin" | "Inventory Manager" | "Employee";
    action_type: "CREATE" | "UPDATE" | "DELETE" | "LOGIN_SUCCESS" | "STOCK_OVERFLOW";
    target_table: "users" | "inventory" | "orders" | "order_items";
    record_id: number;
    old_value: string | null; // Placeholder string version for basic frontend layout
    new_value: string;
    timestamp: string;
}

export const AdminAuditLogs: React.FC = () => {
    // Basic mock dataset following your exact database structure rules
    const mockLogs: AuditLogStructure[] = [
        {
            id: 1001,
            user_id: 1,
            username: "John Cena",
            user_role: "Admin",
            action_type: "CREATE",
            target_table: "users",
            record_id: 42,
            old_value: null,
            new_value: '{"username": "jmiller", "role": "Employee"}',
            timestamp: "2026-09-28 01:10:22"
        },
        {
            id: 1002,
            user_id: 2,
            username: "Nagisa Furukawa",
            user_role: "Inventory Manager",
            action_type: "UPDATE",
            target_table: "inventory",
            record_id: 504,
            old_value: '{"amount": 15}',
            new_value: '{"amount": 45}',
            timestamp: "2026-09-28 01:05:14"
        },
        {
            id: 1003,
            user_id: 3,
            username: "Monika",
            user_role: "Employee",
            action_type: "CREATE",
            target_table: "orders",
            record_id: 891,
            old_value: null,
            new_value: '{"order_id": 891, "items_count": 4}',
            timestamp: "2026-09-27 23:45:00"
        },
        {
            id: 1004,
            user_id: 1,
            username: "John Doe",
            user_role: "Admin",
            action_type: "DELETE",
            target_table: "users",
            record_id: 19,
            old_value: '{"username": "old_staff"}',
            new_value: '{"status": "purged"}',
            timestamp: "2026-09-27 22:12:05"
        }

    ];

    return (
        <div className="w-full">
            <main className="p-8 flex flex-col gap-6 max-w-5xl mx-auto w-full">

                {/* HEADER TITLE SECTION */}
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

                {/* SCROLLABLE AUDIT RECORDS TABLE CONTAINER */}
                <div className="bg-[#0b1326] rounded-2xl shadow-xl h-125 flex flex-col overflow-hidden">
                    <div className="flex-1 overflow-y-auto scrollbar-thin">

                        <table className="table w-full text-slate-300 table-pin-rows">
                            <thead>
                                <tr className="border-b border-slate-800 bg-[#060b14] text-slate-400 text-xs">
                                    <th className="py-4 px-4">Timestamp</th>
                                    <th className="py-4 px-4">Actor (ID)</th>
                                    <th className="py-4 px-6">Username</th>
                                    <th className="py-4 px-4">Action</th>
                                    <th className="py-4 px-4">Target Table</th>
                                    <th className="py-4 px-4">Record ID</th>
                                    <th className="py-4 px-4">Delta State Changes (JSON)</th>
                                </tr>
                            </thead>
                            <tbody>
                                {mockLogs.map((log) => (
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

                                        <td className="py-4 px-6 font-medium text-slate-200">
                                            {log.username}
                                        </td>

                                        {/* Action Type Badge Indicators */}
                                        <td className="py-4 px-4">
                                            <span className={`text-[11px] font-bold px-2 py-0.5 rounded-md ${log.action_type === "CREATE" ? "bg-emerald-500/10 text-emerald-400" :
                                                log.action_type === "UPDATE" ? "bg-amber-500/10 text-amber-400" :
                                                    "bg-rose-500/10 text-rose-400"
                                                }`}>
                                                {log.action_type}
                                            </span>
                                        </td>

                                        {/* Target Table */}
                                        <td className="font-mono text-xs text-blue-400 py-4 px-4">
                                            {log.target_table}
                                        </td>

                                        {/* Affected Record ID */}
                                        <td className="font-mono text-xs text-slate-300 py-4 px-4 font-semibold">
                                            {log.record_id}
                                        </td>

                                        {/* Simplified raw preview of JSON Changes */}
                                        <td className="py-4 px-4 max-w-xs truncate font-mono text-xs text-slate-400" title={`New: ${log.new_value}`}>
                                            {log.old_value ? `Old: ${log.old_value} → ` : ""} New: {log.new_value}
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
