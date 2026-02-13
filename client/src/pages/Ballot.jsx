import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, CheckCircle2, AlertTriangle } from 'lucide-react';
import Button from '../components/Button';
import Card from '../components/Card';
import Modal from '../components/Modal';
import Loader from '../components/Loader';

const Ballot = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { session, rollNumber, candidates } = state || {};

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  if (!session || !rollNumber) {
    navigate('/');
    return null;
  }

  const filteredCandidates = candidates.filter(c =>
    c.toLowerCase().includes(searchTerm.toLowerCase()) &&
    (session.allowSelfVote ? true : c !== rollNumber)
  );

  const handleSubmit = async () => {
    if (submitting) return;
    setSubmitting(true);
    try {
      await api.post('/api/votes/submit', {
        sessionId: session.sessionId,
        datasetId: session.datasetId,
        voterRollNumber: rollNumber,
        votedFor: selectedCandidate
      });
      // Store local flag to prevent back-button re-vote attempt UI
      localStorage.setItem(`voted_${session.sessionId}`, 'true');
      navigate('/success');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to submit vote. Please try again.');
      setSubmitting(false);
      setShowConfirm(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg-light dark:bg-gray-900 p-6 flex flex-col items-center">
      <div className="max-w-5xl w-full space-y-8 pb-32">
        <header className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-primary dark:text-white">Official Ballot</h1>
          <p className="text-gray-500">Session: {session.name} | Voter ID: <span className="font-mono text-accent font-bold">{rollNumber}</span></p>
        </header>

        <div className="relative max-w-md mx-auto">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search candidate roll number..."
            className="w-full pl-12 pr-4 py-4 rounded-2xl border border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-white outline-none focus:ring-2 focus:ring-accent transition-all shadow-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          <AnimatePresence>
            {filteredCandidates.map(candidate => (
              <motion.div
                key={candidate}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                onClick={() => !submitting && setSelectedCandidate(candidate)}
                className="cursor-pointer"
              >
                <Card className={`relative transition-all duration-300 ${selectedCandidate === candidate ? 'ring-4 ring-accent bg-accent/5' : 'hover:border-accent/50'}`}>
                  {selectedCandidate === candidate && (
                    <div className="absolute top-2 right-2">
                      <CheckCircle2 className="w-6 h-6 text-accent" />
                    </div>
                  )}
                  <div className="text-center py-8 space-y-3">
                    <div className="w-20 h-20 bg-gray-100 dark:bg-gray-700 rounded-full mx-auto flex items-center justify-center">
                      <span className="text-2xl font-bold text-primary dark:text-white font-mono">{candidate.slice(-3)}</span>
                    </div>
                    <p className="font-mono font-bold text-primary dark:text-white tracking-wider">{candidate}</p>
                  </div>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {filteredCandidates.length === 0 && (
          <div className="text-center py-12 text-gray-500 italic">No candidates found matching your search.</div>
        )}

        {selectedCandidate && !submitting && (
          <motion.div initial={{ y: 100 }} animate={{ y: 0 }} className="fixed bottom-8 left-0 right-0 flex justify-center px-6 z-40">
            <Button
              className="max-w-md w-full shadow-2xl py-4 text-lg font-bold bg-primary hover:bg-primary/90"
              onClick={() => setShowConfirm(true)}
            >
              Cast Vote for {selectedCandidate}
            </Button>
          </motion.div>
        )}
      </div>

      <Modal
        isOpen={showConfirm}
        onClose={() => !submitting && setShowConfirm(false)}
        title="Confirm Your Vote"
      >
        <div className="space-y-6">
          {submitting ? (
            <div className="flex flex-col items-center py-8 space-y-4">
              <Loader />
              <p className="text-gray-600 font-medium">Securing your vote...</p>
            </div>
          ) : (
            <>
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="w-20 h-20 bg-yellow-50 dark:bg-yellow-900/20 rounded-full flex items-center justify-center">
                  <AlertTriangle className="w-10 h-10 text-yellow-600" />
                </div>
                <div className="space-y-2">
                  <p className="text-gray-600 dark:text-gray-300">
                    You are casting your only vote for:
                  </p>
                  <p className="text-2xl font-bold text-primary dark:text-white font-mono bg-gray-100 dark:bg-gray-800 py-2 rounded-lg">
                    {selectedCandidate}
                  </p>
                  <p className="text-xs text-red-500 font-bold uppercase mt-4">
                    This action is permanent and cannot be reversed.
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <Button variant="outline" className="flex-1" onClick={() => setShowConfirm(false)}>Review</Button>
                <Button className="flex-1" onClick={handleSubmit}>
                  Confirm Vote
                </Button>
              </div>
            </>
          )}
        </div>
      </Modal>
    </div>
  );
};

export default Ballot;
