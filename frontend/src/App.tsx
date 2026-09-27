import { Routes, Route, Navigate } from "react-router-dom";

import { LoginForm } from "./pages/LoginForm";
import { AdminDashboard } from "./pages/admin/AdminDashboard";

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
        </Routes>
      </main>
    </div>
  );
};

export default App
