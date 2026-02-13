import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { ShieldCheck, AlertCircle, ArrowRight, XCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
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
  const [hasVoted, setHasVoted] = useState(false);
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
        setError('Failed to load authorization list.');
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
    setHasVoted(false);

    try {
      const res = await api.get(`/api/votes/status?sessionId=${session.sessionId}&rollNumber=${selectedRoll}`);

      if (res.data.hasVoted) {
        setHasVoted(true);
        setError('Our records show this roll number has already cast a vote in this session.');
      } else {
        navigate('/ballot', { state: { session, rollNumber: selectedRoll, candidates: rollNumbers } });
      }
    } catch (err) {
      setError('Identity verification service is temporarily unavailable. Please try again.');
    } finally {
      setChecking(false);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-bg-light dark:bg-gray-900"><Loader /></div>;

  return (
    <div className="min-h-screen bg-bg-light dark:bg-gray-900 flex items-center justify-center p-6">
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="max-w-md w-full">
        <Card className="space-y-6 shadow-2xl">
          <div className="text-center space-y-2">
            <div className="flex justify-center">
              <div className="bg-accent/10 p-4 rounded-full">
                <ShieldCheck className="w-12 h-12 text-accent" />
              </div>
            </div>
            <h2 className="text-2xl font-bold text-primary dark:text-white">Identity Verification</h2>
            <p className="text-sm text-gray-500">Election: <span className="font-semibold">{session.name}</span></p>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700 dark:text-gray-300">Select Your Roll Number</label>
              <select
                value={selectedRoll}
                onChange={(e) => {
                  setSelectedRoll(e.target.value);
                  setError('');
                  setHasVoted(false);
                }}
                className="w-full p-4 rounded-xl border-2 border-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:text-white focus:border-accent outline-none transition-all text-lg font-mono"
              >
                <option value="">-- Choose Roll Number --</option>
                {rollNumbers.map(roll => (
                  <option key={roll} value={roll}>{roll}</option>
                ))}
              </select>
            </div>

            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className={`p-4 rounded-xl flex gap-3 border ${hasVoted ? 'bg-orange-50 border-orange-200 text-orange-800' : 'bg-red-50 border-red-200 text-red-800'}`}
                >
                  {hasVoted ? <XCircle className="w-5 h-5 shrink-0" /> : <AlertCircle className="w-5 h-5 shrink-0" />}
                  <p className="text-sm font-medium">{error}</p>
                </motion.div>
              )}
            </AnimatePresence>

            {!error && (
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl flex gap-3">
                <AlertCircle className="w-5 h-5 text-blue-600 shrink-0" />
                <p className="text-xs text-blue-800 dark:text-blue-300">
                  Each student is eligible for one vote. Identity is linked to your roll number for verification only; your specific choice remains anonymous.
                </p>
              </div>
            )}

            <Button
              className="w-full flex items-center justify-center gap-2 py-4 text-lg font-bold"
              onClick={handleProceed}
              disabled={!selectedRoll || checking || hasVoted}
            >
              {checking ? 'Verifying...' : 'Proceed to Ballot'}
              {!checking && <ArrowRight className="w-5 h-5" />}
            </Button>

            {hasVoted && (
               <Button variant="outline" className="w-full" onClick={() => navigate('/')}>
                  Return to Home
               </Button>
            )}
          </div>
        </Card>
      </motion.div>
    </div>
  );
};

export default VoterAuth;
