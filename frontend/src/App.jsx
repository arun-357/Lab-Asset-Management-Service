import React, { useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Header, { LoginModal } from "./components/Header";
import AssetListPage from "./pages/AssetListPage";
import useAuth from "./auth/useAuth";

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
        </Routes>
      </main>
      <LoginModal open={loginOpen && !user} onClose={()=>setLoginOpen(false)} login={login} />
    </div>
  );
}
