import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Plus, Trash2, Database, Users, FileText, Upload } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import AdminLayout from '../components/AdminLayout';
import Button from '../components/Button';
import Card from '../components/Card';
import Modal from '../components/Modal';

const AdminDatasets = () => {
  const [datasets, setDatasets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ name: '', description: '', rollNumbersText: '' });

  useEffect(() => {
    fetchDatasets();
  }, []);

  const fetchDatasets = async () => {
    try {
      const res = await api.get('/api/datasets');
      setDatasets(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const rollNumbers = formData.rollNumbersText.split(/[\n,]+/).map(r => r.trim()).filter(r => r);
    try {
      await api.post('/api/datasets', { ...formData, rollNumbers });
      setIsModalOpen(false);
      fetchDatasets();
      setFormData({ name: '', description: '', rollNumbersText: '' });
    } catch (err) {
      alert('Error creating dataset');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this dataset? All linked session data will remain, but new sessions cannot be created with it.')) {
      try {
        await api.delete(`/api/datasets/${id}`);
        fetchDatasets();
      } catch (err) {
        alert('Error deleting dataset');
      }
    }
  };

  return (
    <AdminLayout title="Dataset Manager" activePage="datasets">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-primary dark:text-white">Student Datasets</h2>
            <p className="text-gray-500">Manage cohorts and roll number lists</p>
          </div>
          <Button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2">
            <Plus className="w-5 h-5" /> Create Dataset
          </Button>
        </div>

        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2].map(i => <div key={i} className="h-40 bg-gray-100 dark:bg-gray-800 animate-pulse rounded-2xl" />)}
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence>
              {datasets.map(dataset => (
                <motion.div key={dataset.datasetId} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <Card className="hover:shadow-lg transition-all h-full flex flex-col justify-between">
                    <div className="space-y-4">
                      <div className="flex justify-between items-start">
                        <div className="bg-primary/5 p-3 rounded-xl">
                          <Database className="w-6 h-6 text-primary" />
                        </div>
                        <button onClick={() => handleDelete(dataset.datasetId)} className="text-gray-400 hover:text-red-500 transition-colors">
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-primary dark:text-white">{dataset.name}</h3>
                        <p className="text-sm text-gray-500 line-clamp-2">{dataset.description}</p>
                      </div>
                    </div>
                    <div className="mt-6 flex items-center justify-between text-sm text-gray-500 font-medium">
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4" /> {dataset.rollNumbers?.length || 0} Students
                      </div>
                      <div className="text-primary font-bold cursor-pointer hover:underline">Edit List</div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="New Dataset Configuration">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Dataset Name</label>
            <input
              type="text" required className="w-full p-3 rounded-xl border dark:bg-gray-800 dark:border-gray-700 dark:text-white"
              value={formData.name}
              onChange={e => setFormData({...formData, name: e.target.value})}
              placeholder="e.g. CSE-B 2026"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Description</label>
            <textarea
              className="w-full p-3 rounded-xl border dark:bg-gray-800 dark:border-gray-700 dark:text-white"
              value={formData.description}
              onChange={e => setFormData({...formData, description: e.target.value})}
              placeholder="Brief description of this student cohort"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium flex justify-between">
              Roll Numbers
              <span className="text-xs text-gray-400">CSV or Newline separated</span>
            </label>
            <textarea
              required className="w-full h-32 p-3 rounded-xl border font-mono text-sm dark:bg-gray-800 dark:border-gray-700 dark:text-white"
              value={formData.rollNumbersText}
              onChange={e => setFormData({...formData, rollNumbersText: e.target.value})}
              placeholder="25KD1A0562&#10;25KD1A0563..."
            />
          </div>
          <Button type="submit" className="w-full py-4 mt-4">Create Dataset</Button>
        </form>
      </Modal>
    </AdminLayout>
  );
};

export default AdminDatasets;
