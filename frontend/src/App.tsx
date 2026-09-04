import { Routes, Route, Navigate } from "react-router-dom";
import { HomePage } from "./pages/HomePage";
import { LoginForm } from "./pages/LoginForm";

function App() {

  return (
    <>
      <main>
        <Routes>
          <Route path="/" element={<LoginForm />} />
        </Routes>
      </main>
    </>
  );
};

export default App
