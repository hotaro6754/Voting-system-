import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle } from 'lucide-react';
import Button from '../components/Button';
import Card from '../components/Card';

const Success = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-bg-light flex items-center justify-center p-6">
      <Card className="max-w-md w-full text-center space-y-8 py-12">
        <div className="flex justify-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1, rotate: 360 }}
            transition={{ type: "spring", stiffness: 260, damping: 20 }}
            className="bg-success/10 p-6 rounded-full"
          >
            <CheckCircle className="w-20 h-20 text-success" />
          </motion.div>
        </div>

        <div className="space-y-2">
          <h2 className="text-3xl font-bold text-primary">Vote Recorded!</h2>
          <p className="text-gray-500">Your vote has been securely and anonymously stored in our system.</p>
        </div>

        <div className="bg-gray-50 p-4 rounded-xl">
          <p className="text-xs text-gray-400 uppercase font-bold tracking-widest mb-1">Confirmation Status</p>
          <p className="text-sm font-medium text-success flex items-center justify-center gap-2">
            Securely Encrypted & Hashed
          </p>
        </div>

        <Button
          variant="outline"
          className="w-full"
          onClick={() => navigate('/')}
        >
          Return Home
        </Button>
      </Card>
    </div>
  );
};

export default Success;
