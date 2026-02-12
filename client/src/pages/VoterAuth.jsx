import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { ShieldCheck, AlertCircle, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import Button from '../components/Button';
import Card from '../components/Card';
import Loader from '../components/Loader';

const VoterAuth = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const session = state?.session;

  const [rollNumbers, setRollNumbers] = useState([]);
  const [selectedRoll, setSelectedRoll] = useState('');
  const [loading, setLoading] = useState(true);
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!session) {
      navigate('/');
      return;
    }

    const fetchDataset = async () => {
      try {
        const res = await api.get(`/api/datasets/${session.datasetId}`);
        setRollNumbers(res.data.rollNumbers || []);
      } catch (err) {
        console.error(err);
        setError('Failed to load roll numbers.');
      } finally {
        setLoading(false);
      }
    };

    fetchDataset();
  }, [session, navigate]);

  const handleProceed = async () => {
    if (!selectedRoll) return;

    setChecking(true);
    setError('');

    try {
      const res = await api.get(`/api/votes/status?sessionId=${session.sessionId}&rollNumber=${selectedRoll}`);

      if (res.data.hasVoted) {
        setError('You have already responded. Duplicate voting is not allowed.');
      } else {
        navigate('/ballot', { state: { session, rollNumber: selectedRoll, candidates: rollNumbers } });
      }
    } catch (err) {
      setError('Verification failed. Please try again.');
    } finally {
      setChecking(false);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-bg-light dark:bg-gray-900"><Loader /></div>;

  return (
    <div className="min-h-screen bg-bg-light dark:bg-gray-900 flex items-center justify-center p-6">
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="max-w-md w-full">
        <Card className="space-y-6">
          <div className="text-center space-y-2">
            <div className="flex justify-center">
              <ShieldCheck className="w-12 h-12 text-accent" />
            </div>
            <h2 className="text-2xl font-bold text-primary dark:text-white">Identity Verification</h2>
            <p className="text-sm text-gray-500">Session: {session.name}</p>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Select Your Roll Number</label>
              <select
                value={selectedRoll}
                onChange={(e) => setSelectedRoll(e.target.value)}
                className="w-full p-3 rounded-xl border border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-accent outline-none transition-all"
              >
                <option value="">-- Choose Roll Number --</option>
                {rollNumbers.map(roll => (
                  <option key={roll} value={roll}>{roll}</option>
                ))}
              </select>
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl flex gap-3">
              <AlertCircle className="w-5 h-5 text-blue-600 shrink-0" />
              <p className="text-xs text-blue-800 dark:text-blue-300">
                Security Warning: Each roll number can vote only once. Identity is verified against the official class list.
              </p>
            </div>

            {error && (
              <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="p-3 bg-red-50 dark:bg-red-900/20 text-red-600 text-sm rounded-lg border border-red-100 dark:border-red-800">
                {error}
              </motion.div>
            )}

            <Button
              className="w-full flex items-center justify-center gap-2"
              onClick={handleProceed}
              disabled={!selectedRoll || checking}
            >
              {checking ? 'Verifying...' : 'Enter Voting Booth'}
              {!checking && <ArrowRight className="w-4 h-4" />}
            </Button>
          </div>
        </Card>
      </motion.div>
    </div>
  );
};

export default VoterAuth;
