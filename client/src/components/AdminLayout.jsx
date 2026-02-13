import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { LayoutDashboard, Database, BarChart3, LogOut, Menu, X, ShieldCheck, ShieldAlert } from 'lucide-react';
import ThemeToggle from './ThemeToggle';

const AdminLayout = ({ children, title, activePage }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [dbStatus, setDbStatus] = useState('checking');
  const navigate = useNavigate();

  useEffect(() => {
    const checkStatus = async () => {
      try {
        await api.get('/api/health');
        setDbStatus('connected');
      } catch (err) {
        setDbStatus('error');
      }
    };
    checkStatus();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    navigate('/admin/login');
  };

  const navItems = [
    { id: 'sessions', label: 'Sessions', icon: LayoutDashboard, path: '/admin/sessions' },
    { id: 'datasets', label: 'Datasets', icon: Database, path: '/admin/datasets' },
    { id: 'analytics', label: 'Analytics', icon: BarChart3, path: '/admin/sessions' }, // Points to sessions to select one
  ];

  return (
    <div className="min-h-screen bg-bg-light dark:bg-gray-950 flex transition-colors">
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 transform transition-transform duration-300 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}>
        <div className="h-full flex flex-col">
          <div className="p-6 flex items-center justify-between">
            <h1 className="text-xl font-bold text-primary dark:text-accent">CR Election</h1>
            <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden text-gray-500"><X /></button>
          </div>

          <nav className="flex-1 px-4 space-y-2">
            {navItems.map(item => (
              <Link
                key={item.id}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                  activePage === item.id
                    ? 'bg-primary text-white shadow-lg shadow-primary/20'
                    : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 dark:text-gray-400'
                }`}
              >
                <item.icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </Link>
            ))}
          </nav>

          <div className="p-4 border-t border-gray-200 dark:border-gray-800 space-y-4">
             <div className="flex items-center justify-between px-4 py-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <span className="text-xs text-gray-500">System Status</span>
                {dbStatus === 'connected' ? (
                   <ShieldCheck className="w-4 h-4 text-success" title="API Connected" />
                ) : dbStatus === 'error' ? (
                   <ShieldAlert className="w-4 h-4 text-red-500" title="API Connection Error" />
                ) : (
                   <div className="w-3 h-3 bg-gray-300 rounded-full animate-pulse" />
                )}
             </div>
             <button
                onClick={handleLogout}
                className="flex items-center gap-3 w-full px-4 py-3 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-xl transition-all"
             >
               <LogOut className="w-5 h-5" />
               <span className="font-medium">Sign Out</span>
             </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 lg:ml-64 min-h-screen flex flex-col">
        <header className="h-16 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between px-6 sticky top-0 z-40">
          <div className="flex items-center gap-4">
            <button onClick={() => setIsSidebarOpen(true)} className="lg:hidden text-gray-500"><Menu /></button>
            <h2 className="text-lg font-bold text-primary dark:text-white">{title}</h2>
          </div>
          <ThemeToggle />
        </header>
        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
