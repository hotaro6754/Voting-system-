import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Plus, Trash2, Calendar, Clock, Link2, Users } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import AdminLayout from '../components/AdminLayout';
import Button from '../components/Button';
import Card from '../components/Card';
import Modal from '../components/Modal';

const AdminSessions = () => {
  const [sessions, setSessions] = useState([]);
  const [datasets, setDatasets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    datasetId: '',
    startTime: '',
    endTime: '',
    allowSelfVote: false,
    resultsVisibility: 'hidden'
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [sessionsRes, datasetsRes] = await Promise.all([
        api.get('/api/sessions'),
        api.get('/api/datasets')
      ]);
      setSessions(sessionsRes.data);
      setDatasets(datasetsRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/api/sessions', formData);
      setIsModalOpen(false);
      fetchData();
    } catch (err) {
      alert('Error creating session');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this session?')) {
      try {
        await api.delete(`/api/sessions/${id}`);
        fetchData();
      } catch (err) {
        alert('Error deleting session');
      }
    }
  };

  return (
    <AdminLayout title="Election Sessions" activePage="sessions">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-primary dark:text-white">Active & Past Sessions</h2>
            <p className="text-gray-500">Manage timelines and dataset associations</p>
          </div>
          <Button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2">
            <Plus className="w-5 h-5" /> New Session
          </Button>
        </div>

        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => <div key={i} className="h-48 bg-gray-100 dark:bg-gray-800 animate-pulse rounded-2xl" />)}
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence>
              {sessions.map(session => (
                <motion.div key={session.sessionId} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <Card className="h-full flex flex-col justify-between hover:shadow-xl transition-all">
                    <div className="space-y-4">
                      <div className="flex justify-between items-start">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                          session.status === 'active' ? 'bg-success text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-500'
                        }`}>
                          {session.status}
                        </span>
                        <button onClick={() => handleDelete(session.sessionId)} className="text-gray-400 hover:text-red-500 transition-colors">
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                      <h3 className="text-xl font-bold text-primary dark:text-white">{session.name}</h3>
                      <div className="space-y-2 text-sm text-gray-500">
                        <div className="flex items-center gap-2"><Link2 className="w-4 h-4" /> Dataset: {session.datasetName}</div>
                        <div className="flex items-center gap-2"><Calendar className="w-4 h-4" /> Starts: {new Date(session.startTime).toLocaleString()}</div>
                        <div className="flex items-center gap-2"><Clock className="w-4 h-4" /> Ends: {new Date(session.endTime).toLocaleString()}</div>
                      </div>
                    </div>
                    <div className="mt-6 pt-6 border-t border-gray-100 dark:border-gray-800">
                       <Button variant="outline" className="w-full" onClick={() => window.location.href = `/admin/analytics/${session.sessionId}`}>
                          View Live Stats
                       </Button>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Create Election Session">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Session Name</label>
            <input
              type="text" required
              className="w-full p-3 rounded-xl border dark:bg-gray-800 dark:border-gray-700 dark:text-white"
              value={formData.name}
              onChange={e => setFormData({...formData, name: e.target.value})}
              placeholder="e.g. CR Election 2026 - Final Round"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Associated Dataset</label>
            <select
              required className="w-full p-3 rounded-xl border dark:bg-gray-800 dark:border-gray-700 dark:text-white"
              value={formData.datasetId}
              onChange={e => setFormData({...formData, datasetId: e.target.value})}
            >
              <option value="">Select a dataset</option>
              {datasets.map(d => <option key={d.datasetId} value={d.datasetId}>{d.name}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Start Time</label>
              <input
                type="datetime-local" required
                className="w-full p-3 rounded-xl border dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                value={formData.startTime}
                onChange={e => setFormData({...formData, startTime: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">End Time</label>
              <input
                type="datetime-local" required
                className="w-full p-3 rounded-xl border dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                value={formData.endTime}
                onChange={e => setFormData({...formData, endTime: e.target.value})}
              />
            </div>
          </div>
          <div className="flex items-center gap-4 py-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.allowSelfVote}
                onChange={e => setFormData({...formData, allowSelfVote: e.target.checked})}
              />
              <span className="text-sm">Allow Self Vote</span>
            </label>
          </div>
          <Button type="submit" className="w-full py-4 mt-4">Initialize Session</Button>
        </form>
      </Modal>
    </AdminLayout>
  );
};

export default AdminSessions;
