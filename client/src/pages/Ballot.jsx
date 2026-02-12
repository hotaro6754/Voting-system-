import React, { useState, useMemo, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Search, User, CheckCircle2 } from 'lucide-react';
import Button from '../components/Button';
import Card from '../components/Card';
import Modal from '../components/Modal';
import Toast from '../components/Toast';
import { motion } from 'framer-motion';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const Ballot = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { session, dataset, voterRollNumber } = location.state || {};

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    if (!session || !dataset || !voterRollNumber) {
      navigate('/');
    }
  }, [session, dataset, voterRollNumber, navigate]);

  const filteredCandidates = useMemo(() => {
    if (!dataset) return [];
    return dataset.rollNumbers.filter(roll =>
      roll.toLowerCase().includes(searchTerm.toLowerCase())
    ).sort();
  }, [dataset, searchTerm]);

  const handleVoteSubmit = async () => {
    try {
      setSubmitting(true);
      await axios.post(`${API_URL}/api/votes/submit`, {
        sessionId: session.sessionId,
        datasetId: dataset.datasetId,
        voterRollNumber,
        votedFor: selectedCandidate
      });
      navigate('/success');
    } catch (err) {
      setToast({ message: err.response?.data?.message || 'Vote submission failed', type: 'error' });
      setIsModalOpen(false);
    } finally {
      setSubmitting(false);
    }
  };

  if (!session || !dataset || !voterRollNumber) return null;

  return (
    <div className="min-h-screen bg-bg-light p-6 pb-24">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div>
            <h1 className="text-2xl font-bold text-primary">{session.name}</h1>
            <p className="text-sm text-gray-500">Voting as: <span className="font-bold text-accent">{voterRollNumber}</span></p>
          </div>
          <div className="relative max-w-sm w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search candidate by roll number..."
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-accent outline-none"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              aria-label="Search candidates"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredCandidates.map((roll, index) => (
            <motion.div
              key={roll}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card
                className={`cursor-pointer transition-all border-2 ${
                  selectedCandidate === roll ? 'border-accent bg-accent/5' : 'border-transparent hover:border-gray-200'
                }`}
                onClick={() => setSelectedCandidate(roll)}
                aria-label={`Select candidate ${roll}`}
              >
                <div className="flex flex-col items-center text-center space-y-3 pointer-events-none">
                  <div className={`p-3 rounded-full ${selectedCandidate === roll ? 'bg-accent text-white' : 'bg-gray-100 text-gray-400'}`}>
                    <User className="w-8 h-8" />
                  </div>
                  <span className="font-bold text-primary">{roll}</span>
                  {selectedCandidate === roll && (
                    <span className="text-[10px] uppercase font-bold text-accent flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Selected
                    </span>
                  )}
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        <div className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-md border-t border-gray-100 p-4 flex justify-center z-40">
           <Button
             className="max-w-md w-full py-4 text-lg shadow-xl"
             disabled={!selectedCandidate}
             onClick={() => setIsModalOpen(true)}
             aria-label="Open confirmation modal"
           >
             Cast Final Vote
           </Button>
        </div>

        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title="Confirm Your Vote"
        >
          <div className="space-y-4">
            <p className="text-gray-600">
              Are you sure you want to vote for candidate <span className="font-bold text-primary">{selectedCandidate}</span>?
              This action cannot be undone.
            </p>
            <div className="flex gap-3 pt-4">
              <Button variant="outline" className="flex-1" onClick={() => setIsModalOpen(false)}>Cancel</Button>
              <Button
                className="flex-1"
                onClick={handleVoteSubmit}
                disabled={submitting}
                aria-label="Confirm and submit vote"
              >
                {submitting ? 'Submitting...' : 'Yes, Confirm'}
              </Button>
            </div>
          </div>
        </Modal>

        {toast && <Toast {...toast} onClose={() => setToast(null)} />}
      </div>
    </div>
  );
};

export default Ballot;
