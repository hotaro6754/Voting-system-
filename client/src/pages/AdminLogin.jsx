import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Lock, User } from 'lucide-react';
import Button from '../components/Button';
import Card from '../components/Card';
import Input from '../components/Input';
import Toast from '../components/Toast';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const AdminLogin = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post(`${API_URL}/api/auth/login`, { username, password });
      localStorage.setItem('adminToken', res.data.token);
      localStorage.setItem('adminUser', JSON.stringify(res.data.user));
      navigate('/admin/sessions');
    } catch (err) {
      setToast({ message: err.response?.data?.message || 'Login failed', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-primary flex items-center justify-center p-6">
      <Card className="max-w-md w-full space-y-8 p-10">
        <div className="text-center space-y-2">
          <div className="flex justify-center">
            <div className="bg-accent/10 p-4 rounded-full">
              <Lock className="w-10 h-10 text-accent" />
            </div>
          </div>
          <h2 className="text-3xl font-bold text-primary">Admin Access</h2>
          <p className="text-gray-500">Please enter your credentials to manage elections.</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <Input
            label="Username"
            type="text"
            icon={<User className="w-4 h-4" />}
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
          <Input
            label="Password"
            type="password"
            icon={<Lock className="w-4 h-4" />}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <Button type="submit" className="w-full h-12 text-lg" disabled={loading}>
            {loading ? 'Authenticating...' : 'Sign In'}
          </Button>
        </form>
      </Card>
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}
    </div>
  );
};

export default AdminLogin;
