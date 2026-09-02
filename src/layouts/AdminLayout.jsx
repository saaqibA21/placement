import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import AdminSidebar from '../components/AdminSidebar';
import Header from '../components/Header';

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: 'var(--canvas-bg)' }}>
      {/* Desktop Sidebar */}
      <div className="hidden md:flex flex-shrink-0 h-full">
        <AdminSidebar />
      </div>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 flex md:hidden">
          <div className="w-[235px] h-full flex-shrink-0">
            <AdminSidebar />
          </div>
          <div className="flex-1 bg-black/50 backdrop-blur-xs" onClick={() => setSidebarOpen(false)} />
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header onMenuToggle={() => setSidebarOpen(!sidebarOpen)} />
        <main className="flex-1 overflow-y-auto" style={{ background: 'var(--canvas-bg)' }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
