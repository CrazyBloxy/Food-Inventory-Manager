import { Routes, Route } from "react-router-dom";

// Pages
import { LoginForm } from "./pages/LoginForm";
import { EmployeeDashboard } from "./pages/employee/EmployeeDashboard";
import { EmployeeAuditLogs } from "./pages/employee/EmployeeAuditLogs";
import { InventoryDashboard } from "./pages/inventory/InventoryDashboard";
import { InventoryAuditLogs } from "./pages/inventory/InventoryAuditLogs"
import { AdminDashboard } from "./pages/admin/AdminDashboard";
import { AdminAuditLogs } from "./pages/admin/AdminAuditLogs";

// Components Page
import { PublicRoute } from "./components/PublicRoute";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { NotFound } from "./components/NotFound";

// Navigation Bar
import { NavBar } from "./assets/navbar/nav"
function App() {

  return (
    <div className="flex flex-row min-h-screen w-full">
      {/* Navigation Bar */}
      <NavBar />
      <main className="flex-1 w-full overflow-x-hidden">
        <Routes>
          {/* PUBLIC ROUTE */}
          <Route element={<PublicRoute />}>
            <Route path="/" element={<LoginForm />} />
          </Route>

          {/* ADMIN ROUTES */}
          <Route element={<ProtectedRoute allowedRoles={["Admin"]} />}>
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/audit" element={<AdminAuditLogs />} />
          </Route>

          {/* INVENTORY MANAGER ROUTES */}
          <Route element={<ProtectedRoute allowedRoles={["Inventory Manager"]} />}>
            <Route path="/inventory" element={<InventoryDashboard />} />
            <Route path="/inventory/audit" element={<InventoryAuditLogs />} />
          </Route>

          {/* EMPLOYEE ROUTES */}
          <Route element={<ProtectedRoute allowedRoles={["Employee"]} />}>
            <Route path="/employee" element={<EmployeeDashboard />} />
            <Route path="/employee/audit" element={<EmployeeAuditLogs />} />
          </Route>

          {/* Error 404 Pages */}
          <Route path="/404" element={<NotFound />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
    </div>
  );
};

export default App