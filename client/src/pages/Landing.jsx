import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { Shield, Clock, ArrowRight, AlertCircle, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';
import Button from '../components/Button';
import Card from '../components/Card';
import Loader from '../components/Loader';

const Landing = () => {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const fetchSessions = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get('/api/sessions');
      if (Array.isArray(res.data)) {
        setSessions(res.data);
      } else {
        console.error('Expected array but got:', res.data);
        setError('Received invalid data from server.');
      }
    } catch (err) {
      console.error('Fetch sessions error:', err);
      setError(err.response?.data?.message || 'Failed to connect to the election server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-success text-white';
      case 'upcoming': return 'bg-yellow-500 text-white';
      case 'ended': return 'bg-gray-500 text-white';
      default: return 'bg-gray-400';
    }
  };

  return (
    <div className="min-h-screen bg-bg-light dark:bg-gray-900 flex flex-col items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl w-full text-center space-y-8"
      >
        <div className="space-y-4">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="flex justify-center"
          >
             <div className="bg-primary p-4 rounded-full shadow-lg">
                <Shield className="w-12 h-12 text-accent" />
             </div>
          </motion.div>
          <h1 className="text-4xl font-bold text-primary dark:text-white">Class Representative Election 2026</h1>
          <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            A secure, digital voting platform for educational institutions. Cast your vote with confidence and privacy.
          </p>
        </div>

        {loading ? (
          <div className="flex flex-col items-center gap-4 mt-12">
            <Loader />
            <p className="text-sm text-gray-500 animate-pulse">Checking for active elections...</p>
          </div>
        ) : error ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-12 max-w-md mx-auto">
            <Card className="border-red-200 bg-red-50 dark:bg-red-900/10 dark:border-red-800">
               <div className="flex flex-col items-center gap-4 text-center">
                  <AlertCircle className="w-10 h-10 text-red-600" />
                  <div className="space-y-1">
                    <h3 className="font-bold text-red-800 dark:text-red-400">Connection Error</h3>
                    <p className="text-sm text-red-600 dark:text-red-300">{error}</p>
                  </div>
                  <Button variant="outline" size="sm" onClick={fetchSessions} className="mt-2 flex items-center gap-2">
                    <RefreshCw className="w-4 h-4" /> Try Again
                  </Button>
               </div>
            </Card>
            <p className="mt-6 text-xs text-gray-400">
              Admin: Ensure <code>FIREBASE_SERVICE_ACCOUNT</code> is correctly set in environment variables.
            </p>
          </motion.div>
        ) : (
          <div className="mt-12">
            {sessions.length > 0 ? (
              <div className="grid md:grid-cols-2 gap-6 text-left">
                {sessions.map((session, index) => (
                  <motion.div
                    key={session.sessionId}
                    initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card className="flex flex-col h-full justify-between hover:shadow-2xl transition-shadow">
                      <div className="space-y-4">
                        <div className="flex justify-between items-start">
                          <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${getStatusColor(session.status)}`}>
                            {session.status}
                          </span>
                          <Clock className="w-5 h-5 text-gray-400" />
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-primary dark:text-white">{session.name}</h3>
                          <p className="text-sm text-gray-500">Duration: 24 Hours</p>
                        </div>
                      </div>

                      <div className="mt-6">
                        {session.status === 'active' ? (
                          <Button
                            className="w-full flex items-center justify-center gap-2"
                            onClick={() => navigate('/auth', { state: { session } })}
                          >
                            Enter Voting Booth <ArrowRight className="w-4 h-4" />
                          </Button>
                        ) : session.status === 'ended' ? (
                          <Button
                            variant="outline"
                            className="w-full"
                            onClick={() => navigate(`/admin/analytics/${session.sessionId}`)}
                          >
                            View Results
                          </Button>
                        ) : (
                          <Button disabled className="w-full">
                            Starting Soon
                          </Button>
                        )}
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </div>
            ) : (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                <p className="text-gray-500 dark:text-gray-400 italic">No active or upcoming election sessions found.</p>
                <div className="flex justify-center gap-4">
                  <Button variant="outline" size="sm" onClick={() => navigate('/admin/login')}>Admin Portal</Button>
                  <Button variant="ghost" size="sm" onClick={fetchSessions}>Refresh</Button>
                </div>
              </motion.div>
            )}
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default Landing;
