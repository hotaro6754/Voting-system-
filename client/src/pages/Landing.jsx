import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { Shield, ArrowRight, AlertCircle, RefreshCw, BarChart3, Lock } from 'lucide-react';
import { motion } from 'framer-motion';
import Button from '../components/Button';
import Card from '../components/Card';
import Loader from '../components/Loader';
import CountdownTimer from '../components/CountdownTimer';

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
        setError('Received invalid data from server.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to connect to the election server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  const getStatusInfo = (session) => {
    const now = new Date();
    const end = new Date(session.endTime);
    const releaseTime = new Date(end.getTime() + 24 * 60 * 60 * 1000);

    if (session.status === 'active') {
        return { color: 'bg-green-500', label: 'Live Now' };
    } else if (session.status === 'upcoming') {
        return { color: 'bg-yellow-500', label: 'Starting Soon' };
    } else if (session.status === 'ended') {
        if (now < releaseTime) {
            return { color: 'bg-blue-500', label: 'Calculating Results' };
        }
        return { color: 'bg-gray-500', label: 'Concluded' };
    }
    return { color: 'bg-gray-400', label: session.status };
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
             <div className="bg-primary p-5 rounded-full shadow-2xl">
                <Shield className="w-12 h-12 text-accent" />
             </div>
          </motion.div>
          <h1 className="text-4xl md:text-5xl font-black text-primary dark:text-white tracking-tight">
            Class Representative <span className="text-accent">Election 2026</span>
          </h1>
          <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto text-lg">
            Secure, anonymous, and transparent voting platform for our campus.
          </p>
        </div>

        {loading ? (
          <div className="flex flex-col items-center gap-4 mt-12">
            <Loader />
            <p className="text-sm text-gray-500 animate-pulse font-medium">Fetching election status...</p>
          </div>
        ) : error ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-12 max-w-md mx-auto">
            <Card className="border-red-200 bg-red-50 dark:bg-red-900/10 dark:border-red-800 p-8">
               <div className="flex flex-col items-center gap-4 text-center">
                  <AlertCircle className="w-12 h-12 text-red-600" />
                  <div className="space-y-2">
                    <h3 className="font-bold text-xl text-red-800 dark:text-red-400">Connection Failed</h3>
                    <p className="text-sm text-red-600 dark:text-red-300">{error}</p>
                  </div>
                  <Button variant="outline" size="sm" onClick={fetchSessions} className="mt-4 flex items-center gap-2">
                    <RefreshCw className="w-4 h-4" /> Try Again
                  </Button>
               </div>
            </Card>
          </motion.div>
        ) : (
          <div className="mt-12">
            {sessions.length > 0 ? (
              <div className="grid md:grid-cols-2 gap-8 text-left">
                {sessions.map((session, index) => {
                  const statusInfo = getStatusInfo(session);
                  const now = new Date();
                  const end = new Date(session.endTime);
                  const releaseTime = new Date(end.getTime() + 24 * 60 * 60 * 1000);
                  const isLocked = session.status === 'ended' && now < releaseTime;

                  return (
                    <motion.div
                      key={session.sessionId}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Card className="flex flex-col h-full justify-between hover:shadow-2xl transition-all border-none shadow-lg bg-white/80 dark:bg-gray-800/80 backdrop-blur-md">
                        <div className="space-y-6">
                          <div className="flex justify-between items-center">
                            <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest text-white ${statusInfo.color}`}>
                              {statusInfo.label}
                            </span>
                            {session.status === 'active' && (
                                <CountdownTimer
                                    targetDate={session.endTime}
                                    label="Closes In"
                                    onComplete={fetchSessions}
                                />
                            )}
                            {session.status === 'upcoming' && (
                                <CountdownTimer
                                    targetDate={session.startTime}
                                    label="Starts In"
                                    onComplete={fetchSessions}
                                />
                            )}
                          </div>
                          <div>
                            <h3 className="text-2xl font-black text-primary dark:text-white leading-tight">{session.name}</h3>
                            <p className="text-sm text-gray-500 mt-1 font-medium italic">Eligibility: {session.datasetName || 'Class Roll Numbers'}</p>
                          </div>
                        </div>

                        <div className="mt-8">
                          {session.status === 'active' ? (
                            <Button
                              className="w-full flex items-center justify-center gap-2 py-4 text-lg"
                              onClick={() => navigate('/auth', { state: { session } })}
                            >
                              Vote Now <ArrowRight className="w-5 h-5" />
                            </Button>
                          ) : session.status === 'ended' ? (
                            isLocked ? (
                              <div className="space-y-4">
                                <Button disabled className="w-full flex items-center justify-center gap-2 py-4 opacity-50">
                                  <Lock className="w-5 h-5" /> Results Locked
                                </Button>
                                <CountdownTimer
                                    targetDate={releaseTime.toISOString()}
                                    label="Results Releasing In"
                                />
                              </div>
                            ) : (
                              <Button
                                variant="outline"
                                className="w-full flex items-center justify-center gap-2 py-4 border-2"
                                onClick={() => navigate(`/admin/analytics/${session.sessionId}`)}
                              >
                                <BarChart3 className="w-5 h-5" /> View Official Results
                              </Button>
                            )
                          ) : (
                            <Button disabled className="w-full py-4 opacity-50">
                              Waiting for Start Time
                            </Button>
                          )}
                        </div>
                      </Card>
                    </motion.div>
                  );
                })}
              </div>
            ) : (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                <p className="text-gray-500 dark:text-gray-400 italic text-lg">No active or upcoming election sessions found.</p>
                <div className="flex justify-center gap-4">
                  <Button variant="outline" onClick={() => navigate('/admin/login')}>Admin Portal</Button>
                  <Button variant="ghost" onClick={fetchSessions}>Refresh List</Button>
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
