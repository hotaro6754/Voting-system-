import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Trash2, FileUp, Database, AlertCircle } from 'lucide-react';
import Button from '../components/Button';
import Card from '../components/Card';
import Input from '../components/Input';
import Modal from '../components/Modal';
import Toast from '../components/Toast';
import Loader from '../components/Loader';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const AdminDatasets = () => {
  const [datasets, setDatasets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [toast, setToast] = useState(null);
  const [formData, setFormData] = useState({ name: '', description: '', rollNumbersText: '' });

  const authHeader = { headers: { Authorization: `Bearer ${localStorage.getItem('adminToken')}` } };

  useEffect(() => {
    fetchDatasets();
  }, []);

  const fetchDatasets = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/datasets`, authHeader);
      setDatasets(res.data);
    } catch (err) {
      setToast({ message: 'Failed to fetch datasets', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const rollNumbers = formData.rollNumbersText
      .split(/[\n,]+/)
      .map(r => r.trim())
      .filter(r => r.length > 0);

    try {
      await axios.post(`${API_URL}/api/datasets`, { ...formData, rollNumbers }, authHeader);
      setToast({ message: 'Dataset created successfully', type: 'success' });
      setIsModalOpen(false);
      setFormData({ name: '', description: '', rollNumbersText: '' });
      fetchDatasets();
    } catch (err) {
      setToast({ message: err.response?.data?.message || 'Creation failed', type: 'error' });
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure?')) return;
    try {
      await axios.delete(`${API_URL}/api/datasets/${id}`, authHeader);
      setToast({ message: 'Dataset deleted', type: 'success' });
      fetchDatasets();
    } catch (err) {
      setToast({ message: 'Deletion failed', type: 'error' });
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      setFormData({ ...formData, rollNumbersText: event.target.result });
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <p className="text-gray-500">Manage student datasets and roll numbers.</p>
        <Button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2">
          <Plus className="w-4 h-4" /> New Dataset
        </Button>
      </div>

      {loading ? <Loader className="py-20" /> : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {datasets.map((dataset) => (
            <Card key={dataset.datasetId} className="flex flex-col justify-between hover:shadow-2xl transition-all">
              <div className="space-y-4">
                <div className="flex justify-between">
                  <Database className="w-10 h-10 text-accent bg-accent/10 p-2 rounded-lg" />
                  <button onClick={() => handleDelete(dataset.datasetId)} className="text-gray-400 hover:text-danger">
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-primary">{dataset.name}</h3>
                  <p className="text-sm text-gray-500 line-clamp-2">{dataset.description}</p>
                </div>
                <div className="bg-gray-50 p-3 rounded-xl flex items-center justify-between">
                  <span className="text-xs font-bold text-gray-400 uppercase">Student Count</span>
                  <span className="text-sm font-bold text-primary">{dataset.rollNumbers?.length || 0}</span>
                </div>
              </div>
            </Card>
          ))}
          {datasets.length === 0 && (
            <div className="col-span-full py-20 bg-white rounded-xl border-2 border-dashed border-gray-200 flex flex-col items-center gap-4">
               <Database className="w-12 h-12 text-gray-300" />
               <p className="text-gray-400 font-medium">No datasets found. Create your first one!</p>
            </div>
          )}
        </div>
      )}

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Create New Dataset">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Dataset Name"
            placeholder="e.g. CSE-B 2026"
            value={formData.name}
            onChange={e => setFormData({...formData, name: e.target.value})}
            required
          />
          <Input
            label="Description"
            placeholder="Brief details about the class"
            value={formData.description}
            onChange={e => setFormData({...formData, description: e.target.value})}
          />
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="block text-sm font-medium text-primary">Roll Numbers</label>
              <label className="text-xs text-accent font-bold cursor-pointer flex items-center gap-1 hover:underline">
                <FileUp className="w-3 h-3" /> Import TXT/CSV
                <input type="file" className="hidden" accept=".txt,.csv" onChange={handleFileUpload} />
              </label>
            </div>
            <textarea
              className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-accent outline-none min-h-[120px] text-sm"
              placeholder="Paste roll numbers (one per line or comma separated)"
              value={formData.rollNumbersText}
              onChange={e => setFormData({...formData, rollNumbersText: e.target.value})}
              required
            />
          </div>
          <div className="bg-blue-50 p-3 rounded-lg flex gap-2">
            <AlertCircle className="w-4 h-4 text-blue-500 shrink-0" />
            <p className="text-[10px] text-blue-700">Duplicate roll numbers will be automatically filtered.</p>
          </div>
          <Button type="submit" className="w-full">Create Dataset</Button>
        </form>
      </Modal>

      {toast && <Toast {...toast} onClose={() => setToast(null)} />}
    </div>
  );
};

export default AdminDatasets;
