import { useNavigate } from "react-router-dom";
import { LuShieldAlert } from "react-icons/lu";

export const NotFound = () => {
    const navigate = useNavigate();

    const handleRedirect = () => {
        const token = localStorage.getItem("token");
        const role = localStorage.getItem("role");

        // If no token or role exists, go back to login
        if (!token || !role) {
            navigate("/");
            return;
        }

        const cleanRole = role.trim().toLowerCase();

        // Route based on the stored role
        if (cleanRole.includes("admin")) {
            navigate("/admin");
        } else if (cleanRole.includes("inventory")) {
            navigate("/inventory");
        } else if (cleanRole.includes("employee")) {
            navigate("/employee");
        } else {
            navigate("/");
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-[#050811] text-slate-100 px-4">
            <div className="text-center space-y-6 max-w-md">
                {/* Center Icon */}
                <div className="flex justify-center">
                    <div className="p-6 bg-rose-500/10 rounded-full border border-rose-500/20 text-rose-500">
                        <LuShieldAlert size={64} />
                    </div>
                </div>

                {/* Heading */}
                <div className="space-y-2">
                    <h1 className="text-4xl font-extrabold tracking-tight">404</h1>
                    <h2 className="text-xl font-semibold text-slate-300">Page Not Found</h2>
                </div>

                {/* Description */}
                <p className="text-sm text-slate-400 leading-relaxed">
                    The page you are looking for does not exist or you do not have permission to view it.
                </p>

                {/* Action Button */}
                <div className="pt-4">
                    <button
                        onClick={handleRedirect}
                        className="btn w-full bg-blue-600 hover:bg-blue-700 text-white border-none font-medium h-11 min-h-0 rounded-xl transition-all shadow-lg shadow-blue-600/20"
                    >
                        Return to Dashboard
                    </button>
                </div>
            </div>
        </div>
    );
};