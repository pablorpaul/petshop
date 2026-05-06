import { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import Header from '../components/layout/Header';
import Sidebar from '../components/layout/Sidebar';
import { useAuth } from '../hooks/useAuth';

export default function AppShell() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="app-shell">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} onLogout={handleLogout} />
      <div className="app-shell__content">
        <Header user={user} onToggleSidebar={() => setSidebarOpen(true)} onLogout={handleLogout} />
        <main className="page-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
