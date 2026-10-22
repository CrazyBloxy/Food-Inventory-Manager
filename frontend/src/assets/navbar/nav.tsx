import { useLocation, useNavigate } from "react-router-dom";
import { LuLayoutDashboard, LuHistory, LuLogOut } from "react-icons/lu";

export const NavBar = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const validPrefixes = ["/admin", "/inventory", "/employee"];
    const isValidRoute = validPrefixes.some(prefix => location.pathname.startsWith(prefix));

    // Hide sidebar on the login page ("/") or any undefined 404 page
    if (location.pathname === "/" || !isValidRoute) {
        return null;
    }
    
    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        console.log("User logged out successfully.");
        navigate("/");
    };

    return (
        <aside className="w-64 bg-[#050811] border-r border-slate-800/60 flex flex-col shrink-0 h-screen sticky top-0">
            <div className="p-6 border-b border-slate-800/40 flex items-center gap-3">
                <span className="text-xl bg-blue-500/10 px-3 py-1 rounded">
                    <img
                        src="/box.svg"
                        alt="Logo"
                        className="w-10 h-10 object-contain"
                    />
                </span>
                <span className="text-xs uppercase tracking-widest text-slate-500 font-semibold">Portal</span>
            </div>

            <nav className="flex-1 p-4 space-y-2">
                {/* 1. ADMIN PANEL LINKS */}
                {(location.pathname.startsWith("/admin") || location.pathname.startsWith("/audit")) && (
                    <>
                        <button
                            onClick={() => navigate("/admin")}
                            className={`btn btn-ghost w-full justify-start gap-3 px-4 py-3 h-auto min-h-0 text-sm font-medium rounded-r-lg rounded-l-none hover:bg-blue-500/20 active:scale-[0.98] transition-all ${
                                location.pathname === "/admin"
                                    ? "text-blue-400 bg-blue-500/10 border-l-4 border-blue-500"
                                    : "text-slate-400"
                            }`}
                        >
                            <LuLayoutDashboard size={18} />
                            Admin Dashboard
                        </button>

                        <button
                            onClick={() => navigate("/admin/audit")}
                            className={`btn btn-ghost w-full justify-start gap-3 px-4 py-3 h-auto min-h-0 text-sm font-medium rounded-r-lg rounded-l-none hover:bg-slate-800/40 active:scale-[0.98] transition-all ${
                                location.pathname === "/admin/audit"
                                    ? "text-blue-400 bg-blue-500/10 border-l-4 border-blue-500"
                                    : "text-slate-400"
                            }`}
                        >
                            <LuHistory size={18} />
                            Audit Logs
                        </button>
                    </>
                )}

                {/* 2. INVENTORY MANAGER PANEL LINKS */}
                {location.pathname.startsWith("/inventory") && (
                    <>
                        <button
                            onClick={() => navigate("/inventory")}
                            className={`btn btn-ghost w-full justify-start gap-3 px-4 py-3 h-auto min-h-0 text-sm font-medium rounded-r-lg rounded-l-none hover:bg-blue-500/20 active:scale-[0.98] transition-all ${
                                location.pathname === "/inventory"
                                    ? "text-blue-400 bg-blue-500/10 border-l-4 border-blue-500"
                                    : "text-slate-400"
                            }`}
                        >
                            <LuLayoutDashboard size={18} />
                            Food Inventory
                        </button>

                        <button
                            onClick={() => navigate("/inventory/audit")}
                            className={`btn btn-ghost w-full justify-start gap-3 px-4 py-3 h-auto min-h-0 text-sm font-medium rounded-r-lg rounded-l-none hover:bg-slate-800/40 active:scale-[0.98] transition-all ${
                                location.pathname === "/inventory/audit"
                                    ? "text-blue-400 bg-blue-500/10 border-l-4 border-blue-500"
                                    : "text-slate-400"
                            }`}
                        >
                            <LuHistory size={18} />
                            Inventory Logs
                        </button>
                    </>
                )}

                {/* 3. EMPLOYEE PANEL LINKS */}
                {location.pathname.startsWith("/employee") && (
                    <>
                        <button
                            onClick={() => navigate("/employee")}
                            className={`btn btn-ghost w-full justify-start gap-3 px-4 py-3 h-auto min-h-0 text-sm font-medium rounded-r-lg rounded-l-none hover:bg-blue-500/20 active:scale-[0.98] transition-all ${
                                location.pathname === "/employee"
                                    ? "text-blue-400 bg-blue-500/10 border-l-4 border-blue-500"
                                    : "text-slate-400"
                            }`}
                        >
                            <LuLayoutDashboard size={18} />
                            Dashboard
                        </button>

                        <button
                            onClick={() => navigate("/employee/audit")}
                            className={`btn btn-ghost w-full justify-start gap-3 px-4 py-3 h-auto min-h-0 text-sm font-medium rounded-r-lg rounded-l-none hover:bg-slate-800/40 active:scale-[0.98] transition-all ${
                                location.pathname === "/employee/audit"
                                    ? "text-blue-400 bg-blue-500/10 border-l-4 border-blue-500"
                                    : "text-slate-400"
                            }`}
                        >
                            <LuHistory size={18} />
                            Order Logs
                        </button>
                    </>
                )}
            </nav>

            <div className="p-4 border-t border-slate-800/60 flex items-center justify-between gap-2">
                <div className="truncate">
                    <p className="text-xs font-semibold text-slate-300 truncate">
                        {location.pathname.includes("/admin") ? "System Admin" :
                            location.pathname.includes("/inventory") ? "Inventory Manager" : "Employee Staff"}
                    </p>
                    <p className="text-[10px] text-slate-500 truncate">
                        {location.pathname.includes("/admin") ? "Admin Role" :
                            location.pathname.includes("/inventory") ? "Inventory Role" : "Employee Role"}
                    </p>
                </div>

                {/* Logout Button */}
                <button
                    onClick={handleLogout}
                    className="btn btn-ghost btn-xs h-8 min-h-0 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 active:scale-95 transition-all flex items-center gap-1.5 px-2.5 rounded-lg"
                    title="Logout"
                >
                    <LuLogOut size={15} />
                    <span className="text-xs font-medium tracking-wide">Logout</span>
                </button>
            </div>
        </aside>
    );
};