import React, { useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Header, { LoginModal } from "./components/Header";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import AssetListPage from "./pages/AssetListPage";
import AssetDetailPage from "./pages/AssetDetailPage";
import UsersPage from "./pages/UsersPage";
import AdminLoginPage from "./pages/AdminLoginPage";
import useAuth from "./auth/useAuth";
import AdminDashboard from "./pages/AdminDashboard";

function Private({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="p-8">Loading…</div>;
  return user ? children : <Navigate to="/login" replace />;
}

function AdminOnly({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="p-8">Loading…</div>;
  return user && user.roles?.includes("admin") ? children : <Navigate to="/login" replace />;
}

export default function App(){
  const { user, login } = useAuth();
  const [loginOpen, setLoginOpen] = useState(false);

  return (
    <div>
      <Header onOpenLogin={()=>setLoginOpen(true)} />
      <main className="container mx-auto p-4">
        <Routes>
          <Route path="/" element={<AssetListPage />} />
          <Route path="/assets/:id" element={<AssetDetailPage />} />
          <Route path="/users" element={<AdminOnly><UsersPage /></AdminOnly>} />
          <Route path="/dashboard" element={<AdminOnly><AdminDashboard /></AdminOnly>} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/admin-login" element={<AdminLoginPage />} />
          <Route path="*" element={<div className="p-4">Not found</div>} />
        </Routes>
      </main>
      <LoginModal open={loginOpen && !user} onClose={()=>setLoginOpen(false)} login={login} />
    </div>
  );
}
