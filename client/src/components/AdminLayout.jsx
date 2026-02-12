import React, { useEffect } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, Database, Clock, LogOut, ShieldCheck } from 'lucide-react';
import ThemeToggle from "./ThemeToggle";

const AdminLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      navigate('/admin/login');
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    navigate('/admin/login');
  };

  const navItems = [
    { name: 'Sessions', path: '/admin/sessions', icon: Clock },
    { name: 'Datasets', path: '/admin/datasets', icon: Database },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#050b14] flex transition-colors duration-300">
      {/* Sidebar */}
      <div className="w-64 bg-primary text-white flex flex-col shrink-0">
        <div className="p-6 flex items-center gap-3 border-b border-white/10">
          <ShieldCheck className="w-8 h-8 text-accent" />
          <span className="font-bold text-xl tracking-tight">Admin Portal</span>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                location.pathname.startsWith(item.path)
                  ? 'bg-accent text-white shadow-lg'
                  : 'hover:bg-white/5 text-gray-300'
              }`}
            >
              <item.icon className="w-5 h-5" />
              <span className="font-medium">{item.name}</span>
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-white/10">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 text-gray-400 hover:text-white hover:bg-white/5 rounded-xl transition-all"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden bg-gray-50 dark:bg-[#050b14] transition-colors duration-300">
        <header className="bg-white dark:bg-primary border-b border-gray-200 dark:border-white/10 p-6 flex justify-between items-center">
           <h2 className="text-2xl font-bold text-primary capitalize">
             {location.pathname.split('/').pop()} Management
           </h2>
        <ThemeToggle /></header>
        <main className="flex-1 overflow-y-auto p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
