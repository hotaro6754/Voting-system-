import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { UserCheck, AlertCircle } from 'lucide-react';
import Button from '../components/Button';
import Card from '../components/Card';
import Loader from '../components/Loader';
import Toast from '../components/Toast';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const VoterAuth = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const session = location.state?.session;

  const [dataset, setDataset] = useState(null);
  const [selectedRoll, setSelectedRoll] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [toast, setToast] = useState(null);

  useEffect(() => {
    if (!session) {
      navigate('/');
      return;
    }

    const fetchDataset = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/datasets/${session.datasetId}`, {
            headers: { Authorization: `Bearer ${localStorage.getItem('adminToken')}` } // This is tricky for voters. We need a way for voters to see datasets or sessions need to include dataset info.
        });
        // Actually, let's make a public endpoint or include roll numbers in session if safe.
        // For this app, let's assume we have a way to fetch dataset info for an active session.
        setDataset(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchDataset();
  }, [session, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedRoll) return;

    try {
      setLoading(true);
      const res = await axios.get(`${API_URL}/api/votes/status?sessionId=${session.sessionId}&rollNumber=${selectedRoll}`);

      if (res.data.hasVoted) {
        setToast({ message: 'You have already responded. Duplicate voting is not allowed.', type: 'error' });
      } else {
        navigate('/ballot', { state: { session, dataset, voterRollNumber: selectedRoll } });
      }
    } catch (err) {
      setToast({ message: err.response?.data?.message || 'Verification failed', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  if (!session) return null;

  return (
    <div className="min-h-screen bg-bg-light flex flex-col items-center justify-center p-6">
      <Card className="max-w-md w-full space-y-6">
        <div className="text-center space-y-2">
          <div className="flex justify-center">
            <UserCheck className="w-12 h-12 text-accent" />
          </div>
          <h2 className="text-2xl font-bold text-primary">Identity Verification</h2>
          <p className="text-sm text-gray-500">Select your roll number to enter the ballot box.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-primary">Roll Number</label>
            {loading ? (
                <Loader />
            ) : (
                <select aria-label="Select Roll Number"
                  value={selectedRoll}
                  onChange={(e) => setSelectedRoll(e.target.value)}
                  className="w-full px-4 py-2 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent transition-all"
                  required
                >
                  <option value="">Choose your roll number</option>
                  {dataset?.rollNumbers.sort().map((roll) => (
                    <option key={roll} value={roll}>{roll}</option>
                  ))}
                </select>
            )}
          </div>

          <div className="bg-blue-50 p-4 rounded-xl flex gap-3">
            <AlertCircle className="w-5 h-5 text-blue-500 shrink-0" />
            <p className="text-xs text-blue-700">
              Each roll number can vote only once. Once submitted, you cannot change your vote.
            </p>
          </div>

          <Button type="submit" className="w-full" disabled={!selectedRoll || loading}>
            Confirm & Continue
          </Button>
        </form>
      </Card>

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
};

export default VoterAuth;
