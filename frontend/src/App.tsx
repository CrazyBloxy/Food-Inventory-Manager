import { Routes, Route, Navigate } from "react-router-dom";

import { LoginForm } from "./pages/LoginForm";
import { AdminDashboard } from "./pages/admin/AdminDashboard";
import { AuditLogsView_Admin } from "./pages/admin/AuditView_Admin";

import { NavBar } from "./assets/navbar/nav"
function App() {

  return (
    <div className="flex flex-row min-h-screen w-full">
      {/* Navigation Bar */}
      <NavBar />
      <main className="flex-1 w-full overflow-x-hidden">
        <Routes>
          <Route path="/" element={<LoginForm />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/audit" element={<AuditLogsView_Admin />} />
        </Routes>
      </main>
    </div>
  );
};

export default App
