import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Plus, Trash2, Clock, BarChart2, Calendar, Lock, Unlock } from 'lucide-react';
import Button from '../components/Button';
import Card from '../components/Card';
import Input from '../components/Input';
import Modal from '../components/Modal';
import Toast from '../components/Toast';
import Loader from '../components/Loader';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const AdminSessions = () => {
  const [sessions, setSessions] = useState([]);
  const [datasets, setDatasets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [toast, setToast] = useState(null);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    datasetId: '',
    startTime: '',
    endTime: '',
    allowSelfVote: false,
    resultsVisibility: 'hidden'
  });

  const authHeader = { headers: { Authorization: `Bearer ${localStorage.getItem('adminToken')}` } };

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [sessionsRes, datasetsRes] = await Promise.all([
        axios.get(`${API_URL}/api/sessions`, authHeader),
        axios.get(`${API_URL}/api/datasets`, authHeader)
      ]);
      setSessions(sessionsRes.data);
      setDatasets(datasetsRes.data);
    } catch (err) {
      setToast({ message: 'Failed to fetch data', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_URL}/api/sessions`, formData, authHeader);
      setToast({ message: 'Election session created', type: 'success' });
      setIsModalOpen(false);
      setFormData({
        name: '', datasetId: '', startTime: '', endTime: '',
        allowSelfVote: false, resultsVisibility: 'hidden'
      });
      fetchData();
    } catch (err) {
      setToast({ message: err.response?.data?.message || 'Creation failed', type: 'error' });
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure?')) return;
    try {
      await axios.delete(`${API_URL}/api/sessions/${id}`, authHeader);
      setToast({ message: 'Session deleted', type: 'success' });
      fetchData();
    } catch (err) {
      setToast({ message: 'Deletion failed', type: 'error' });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <p className="text-gray-500">Schedule and monitor election sessions.</p>
        <Button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2">
          <Plus className="w-4 h-4" /> New Session
        </Button>
      </div>

      {loading ? <Loader className="py-20" /> : (
        <div className="grid md:grid-cols-2 gap-6">
          {sessions.map((session) => (
            <Card key={session.sessionId} className="relative group">
              <div className="space-y-6">
                <div className="flex justify-between items-start">
                  <div className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${
                    session.status === 'active' ? 'bg-success text-white' : 'bg-gray-200 text-gray-500'
                  }`}>
                    {session.status}
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => navigate(`/admin/analytics/${session.sessionId}`)} className="p-2 hover:bg-accent/10 text-accent rounded-lg transition-colors">
                        <BarChart2 className="w-5 h-5" />
                    </button>
                    <button onClick={() => handleDelete(session.sessionId)} className="p-2 hover:bg-danger/10 text-danger rounded-lg transition-colors">
                        <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                <div className="space-y-1">
                  <h3 className="text-xl font-bold text-primary">{session.name}</h3>
                  <p className="text-sm text-gray-400 flex items-center gap-2">
                    <Database className="w-4 h-4" /> {datasets.find(d => d.datasetId === session.datasetId)?.name || 'Unknown Dataset'}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4 py-4 border-y border-gray-100">
                  <div className="space-y-1">
                    <span className="text-[10px] uppercase font-bold text-gray-400">Starts</span>
                    <p className="text-xs font-medium text-primary flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-accent" /> {new Date(session.startTime).toLocaleString()}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] uppercase font-bold text-gray-400">Ends</span>
                    <p className="text-xs font-medium text-primary flex items-center gap-1">
                      <Clock className="w-3 h-3 text-accent" /> {new Date(session.endTime).toLocaleString()}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1">
                    {session.resultsVisibility === 'public' ? <Unlock className="w-4 h-4 text-success" /> : <Lock className="w-4 h-4 text-danger" />}
                    <span className="font-medium">Results: {session.resultsVisibility}</span>
                  </div>
                  <div className="font-medium text-gray-400">
                    Self-Vote: {session.allowSelfVote ? 'ON' : 'OFF'}
                  </div>
                </div>
              </div>
            </Card>
          ))}
          {sessions.length === 0 && (
            <div className="col-span-full py-20 bg-white rounded-xl border-2 border-dashed border-gray-200 flex flex-col items-center gap-4">
               <Clock className="w-12 h-12 text-gray-300" />
               <p className="text-gray-400 font-medium">No sessions scheduled.</p>
            </div>
          )}
        </div>
      )}

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Schedule New Election">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Session Name"
            placeholder="e.g. CR Election 2026 - Section B"
            value={formData.name}
            onChange={e => setFormData({...formData, name: e.target.value})}
            required
          />
          <div className="space-y-1">
            <label className="block text-sm font-medium text-primary">Select Dataset</label>
            <select
              value={formData.datasetId}
              onChange={e => setFormData({...formData, datasetId: e.target.value})}
              className="w-full px-4 py-2 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-accent"
              required
            >
              <option value="">Choose a class dataset</option>
              {datasets.map(d => <option key={d.datasetId} value={d.datasetId}>{d.name}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Start Time"
              type="datetime-local"
              value={formData.startTime}
              onChange={e => setFormData({...formData, startTime: e.target.value})}
              required
            />
            <Input
              label="End Time"
              type="datetime-local"
              value={formData.endTime}
              onChange={e => setFormData({...formData, endTime: e.target.value})}
              required
            />
          </div>
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
             <div className="space-y-0.5">
               <p className="text-sm font-bold text-primary">Allow Self-Vote</p>
               <p className="text-[10px] text-gray-500">Candidates can vote for themselves</p>
             </div>
             <input
               type="checkbox"
               className="w-5 h-5 accent-accent"
               checked={formData.allowSelfVote}
               onChange={e => setFormData({...formData, allowSelfVote: e.target.checked})}
             />
          </div>
          <div className="space-y-1">
            <label className="block text-sm font-medium text-primary">Results Visibility</label>
            <select
              value={formData.resultsVisibility}
              onChange={e => setFormData({...formData, resultsVisibility: e.target.value})}
              className="w-full px-4 py-2 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-accent"
            >
              <option value="hidden">Hidden until session ends</option>
              <option value="public">Live Public Results</option>
            </select>
          </div>
          <Button type="submit" className="w-full mt-4">Launch Session</Button>
        </form>
      </Modal>

      {toast && <Toast {...toast} onClose={() => setToast(null)} />}
    </div>
  );
};

export default AdminSessions;
