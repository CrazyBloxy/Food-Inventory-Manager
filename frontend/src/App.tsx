import { Routes, Route, Navigate } from "react-router-dom";

import { LoginForm } from "./pages/LoginForm";
import { EmployeeDashboard } from "./pages/employee/EmployeeDashboard";
import { AuditLogsView_Employee } from "./pages/employee/AuditView_Employee";
import { InventoryDashboard } from "./pages/inventory/InventoryDashboard";
import { AuditLogsView_Inventory } from "./pages/inventory/AuditView_Inventory"
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
          <Route path="/employee" element={<EmployeeDashboard />} />
          <Route path="/employee/audit" element={<AuditLogsView_Employee />} />
          <Route path="/inventory" element={<InventoryDashboard />} />
          <Route path="/inventory/audit" element={<AuditLogsView_Inventory />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/audit" element={<AuditLogsView_Admin />} />
        </Routes>
      </main>
    </div>
  );
};

export default App
