import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, CheckCircle2, AlertTriangle } from 'lucide-react';
import Button from '../components/Button';
import Card from '../components/Card';
import Modal from '../components/Modal';

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
    setSubmitting(true);
    try {
      await api.post('/api/votes/submit', {
        sessionId: session.sessionId,
        voterRollNumber: rollNumber,
        votedFor: selectedCandidate
      });
      navigate('/success');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to submit vote');
    } finally {
      setSubmitting(false);
      setShowConfirm(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg-light dark:bg-gray-900 p-6 flex flex-col items-center">
      <div className="max-w-5xl w-full space-y-8">
        <header className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-primary dark:text-white">Official Ballot</h1>
          <p className="text-gray-500">Session: {session.name} | Voter: <span className="font-mono text-accent">{rollNumber}</span></p>
        </header>

        <div className="relative max-w-md mx-auto">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search candidate roll number..."
            className="w-full pl-12 pr-4 py-3 rounded-2xl border border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-white outline-none focus:ring-2 focus:ring-accent transition-all"
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
                onClick={() => setSelectedCandidate(candidate)}
                className="cursor-pointer"
              >
                <Card className={`relative transition-all duration-300 ${selectedCandidate === candidate ? 'ring-4 ring-accent bg-accent/5' : 'hover:border-accent/50'}`}>
                  {selectedCandidate === candidate && (
                    <div className="absolute top-2 right-2">
                      <CheckCircle2 className="w-6 h-6 text-accent" />
                    </div>
                  )}
                  <div className="text-center py-6 space-y-3">
                    <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full mx-auto flex items-center justify-center">
                      <span className="text-xl font-bold text-primary dark:text-white">{candidate.slice(-2).toUpperCase()}</span>
                    </div>
                    <p className="font-mono font-bold text-primary dark:text-white">{candidate}</p>
                  </div>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {selectedCandidate && (
          <motion.div initial={{ y: 50 }} animate={{ y: 0 }} className="fixed bottom-8 left-0 right-0 flex justify-center px-6">
            <Button
              className="max-w-md w-full shadow-2xl py-4 text-lg"
              onClick={() => setShowConfirm(true)}
            >
              Submit Vote for {selectedCandidate}
            </Button>
          </motion.div>
        )}
      </div>

      <Modal
        isOpen={showConfirm}
        onClose={() => setShowConfirm(false)}
        title="Confirm Your Vote"
      >
        <div className="space-y-6">
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="w-20 h-20 bg-yellow-50 dark:bg-yellow-900/20 rounded-full flex items-center justify-center">
              <AlertTriangle className="w-10 h-10 text-yellow-600" />
            </div>
            <p className="text-gray-600 dark:text-gray-300">
              You are about to vote for <span className="font-bold text-primary dark:text-white">{selectedCandidate}</span>.
              This action <span className="text-red-600 font-bold uppercase">cannot be undone</span>.
            </p>
          </div>
          <div className="flex gap-4">
            <Button variant="outline" className="flex-1" onClick={() => setShowConfirm(false)}>Cancel</Button>
            <Button className="flex-1" onClick={handleSubmit} disabled={submitting}>
              {submitting ? 'Submitting...' : 'Yes, Confirm'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Ballot;
