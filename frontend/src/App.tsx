import { Routes, Route, Navigate } from "react-router-dom";

import { LoginForm } from "./pages/LoginForm";
import { AdminDashboard } from "./pages/admin/AdminDashboard";

function App() {

  return (
    <>
      <main>
        <Routes>
          <Route path="/" element={<LoginForm />} />
          <Route path="/admin" element={<AdminDashboard />} />
        </Routes>
      </main>
    </>
  );
};

export default App
