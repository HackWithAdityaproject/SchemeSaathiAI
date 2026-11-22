import { Navigate, Route, Routes } from "react-router-dom";
import HomePage from "./HomePage.jsx";
import { AccountPage, LoginPage, RegisterPage, RequireAuth } from "./auth/AuthPages.jsx";
import SchemesPage from "./SchemesPage.jsx";

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/schemes" element={<SchemesPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/account" element={<RequireAuth><AccountPage /></RequireAuth>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
