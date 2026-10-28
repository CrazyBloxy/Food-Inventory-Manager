import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { foodPantryService } from "../services/api";
import { FaUser, FaLock, FaPowerOff } from "react-icons/fa";

export const LoginForm = () => {
    const navigate = useNavigate();
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [isTerminated, setIsTerminated] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        // Clear any stale session data immediately so old roles don't linger on failure
        localStorage.removeItem("token");
        localStorage.removeItem("role");

        try {
            const response = await foodPantryService.login({ username, password });

            // Save the new token
            if (response.access_token) {
                localStorage.setItem("token", response.access_token);
            }

            // Save the new role returned by your login response
            const userRole = response.role_name || response.role?.role_name || response.role || response.user?.role || "Employee";
            localStorage.setItem("role", userRole);

            // Route based on role
            const cleanRole = userRole.toLowerCase();
            if (cleanRole.includes("admin")) {
                navigate("/admin");
            } else if (cleanRole.includes("inventory")) {
                navigate("/inventory");
            } else {
                navigate("/employee");
            }
        } catch (err: any) {
            console.error("Login failed:", err.response?.data || err.message);
            setError(err.response?.data?.detail || "Invalid username or password. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    // Handler to terminate backend server and clean up frontend session
    const handleSystemTermination = async () => {
        if (!window.confirm("Are you sure you want to shut down the system and close the application?")) {
            return;
        }

        try {
            localStorage.clear();
            sessionStorage.clear();
            setIsTerminated(true);

            await foodPantryService.shutdown();
        } catch (err) {
            console.error("Shutdown signal sent", err);
        } finally {
            window.close();
            
            setTimeout(() => {
                window.location.href = "about:blank";
            }, 500);
        }
    };

    if (isTerminated) {
        return (
            <div className="flex flex-col justify-center items-center min-h-screen bg-[#050811] text-slate-100 gap-3">
                <FaPowerOff size={48} className="text-rose-500 animate-pulse" />
                <h1 className="text-2xl font-bold text-white">System Terminated</h1>
                <p className="text-xs text-slate-400">The backend server and frontend session have been closed. You may now close this tab.</p>
            </div>
        );
    }

    return (
        <div className="relative flex justify-center items-center min-h-screen bg-[#050811] text-slate-100">
            {/* TERMINATION BUTTON */}
            <button
                onClick={handleSystemTermination}
                className="absolute top-6 left-6 flex items-center gap-2 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-400 px-4 py-2.5 rounded-xl text-xs font-semibold transition-colors shadow-lg cursor-pointer"
                title="Terminate Backend and Close App"
            >
                <FaPowerOff size={14} />
                <span>Shutdown System</span>
            </button>

            <form onSubmit={handleLogin} className="fieldset bg-[#0b101d] border-slate-800 rounded-box w-80 border p-6 space-y-4 shadow-xl">
                <h2 className="text-xl font-bold text-center mb-2 text-white">Food Inventory Login</h2>

                {error && (
                    <div className="alert alert-error text-sm p-2 rounded-lg text-white bg-rose-500/80 border-none">
                        <span>{error}</span>
                    </div>
                )}

                <fieldset className="fieldset space-y-1">
                    <label className="label text-sm font-medium text-slate-300">Username</label>
                    <div className="relative flex items-center">
                        <span className="absolute left-3 text-slate-300 pointer-events-none z-10">
                            <FaUser size={16} />
                        </span>
                        <input
                            type="text"
                            className="input input-bordered w-full pl-10 bg-slate-900 border-slate-800 text-slate-100 focus:outline-none focus:border-blue-500"
                            placeholder="Username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            disabled={loading}
                            required
                        />
                    </div>
                </fieldset>

                <fieldset className="fieldset space-y-1">
                    <label className="label text-sm font-medium text-slate-300">Password</label>
                    <div className="relative flex items-center">
                        <span className="absolute left-3 text-slate-300 pointer-events-none z-10">
                            <FaLock size={16} />
                        </span>
                        <input
                            type="password"
                            className="input input-bordered w-full pl-10 bg-slate-900 border-slate-800 text-slate-100 focus:outline-none focus:border-blue-500"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            disabled={loading}
                            required
                        />
                    </div>
                </fieldset>

                <button
                    className={`btn btn-neutral w-full mt-4 bg-blue-600 hover:bg-blue-700 border-none text-white ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
                    type="submit"
                    disabled={loading}
                >
                    {loading ? "Logging in..." : "Login"}
                </button>
            </form>
        </div>
    );
};