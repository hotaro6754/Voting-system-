import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Trophy, Users, CheckCircle, Percent, ArrowLeft, Download } from 'lucide-react';
import Button from '../components/Button';
import Card from '../components/Card';
import Loader from '../components/Loader';
import Toast from '../components/Toast';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const AdminAnalytics = () => {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  const authHeader = { headers: { Authorization: `Bearer ${localStorage.getItem('adminToken')}` } };

  useEffect(() => {
    fetchResults();
  }, [sessionId]);

  const fetchResults = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/analytics/results/${sessionId}`, authHeader);
      setData(res.data);
    } catch (err) {
      setToast({ message: err.response?.data?.message || 'Failed to fetch results', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loader className="py-20" />;
  if (!data) return <div className="text-center py-20 text-gray-500">No data found for this session.</div>;

  const labels = Object.keys(data.results);
  const votes = Object.values(data.results);
  const winner = labels.length > 0 ? labels.reduce((a, b) => data.results[a] > data.results[b] ? a : b) : 'N/A';

  const chartData = {
    labels,
    datasets: [
      {
        label: 'Votes Received',
        data: votes,
        backgroundColor: '#00BFA6',
        borderRadius: 8,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { display: false },
      title: { display: true, text: 'Vote Distribution per Candidate' },
    },
    scales: {
      y: { beginAtZero: true, ticks: { stepSize: 1 } }
    }
  };

  const exportCSV = () => {
    const csvContent = "data:text/csv;charset=utf-8,"
      + "Candidate,Votes\n"
      + labels.map(l => `${l},${data.results[l]}`).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `election_results_${sessionId}.csv`);
    document.body.appendChild(link);
    link.click();
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-500 hover:text-primary transition-colors">
          <ArrowLeft className="w-5 h-5" /> Back to Sessions
        </button>
        <Button onClick={exportCSV} variant="outline" className="flex items-center gap-2">
          <Download className="w-4 h-4" /> Export Results
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="border-l-4 border-accent">
           <div className="flex items-center gap-4">
              <div className="bg-accent/10 p-3 rounded-full"><Trophy className="w-6 h-6 text-accent" /></div>
              <div>
                <p className="text-[10px] uppercase font-bold text-gray-400">Current Winner</p>
                <p className="text-xl font-bold text-primary">{winner}</p>
              </div>
           </div>
        </Card>
        <Card className="border-l-4 border-primary">
           <div className="flex items-center gap-4">
              <div className="bg-primary/10 p-3 rounded-full"><Users className="w-6 h-6 text-primary" /></div>
              <div>
                <p className="text-[10px] uppercase font-bold text-gray-400">Total Voters</p>
                <p className="text-xl font-bold text-primary">{data.totalEligible}</p>
              </div>
           </div>
        </Card>
        <Card className="border-l-4 border-success">
           <div className="flex items-center gap-4">
              <div className="bg-success/10 p-3 rounded-full"><CheckCircle className="w-6 h-6 text-success" /></div>
              <div>
                <p className="text-[10px] uppercase font-bold text-gray-400">Votes Cast</p>
                <p className="text-xl font-bold text-primary">{data.totalVotes}</p>
              </div>
           </div>
        </Card>
        <Card className="border-l-4 border-yellow-500">
           <div className="flex items-center gap-4">
              <div className="bg-yellow-500/10 p-3 rounded-full"><Percent className="w-6 h-6 text-yellow-500" /></div>
              <div>
                <p className="text-[10px] uppercase font-bold text-gray-400">Participation</p>
                <p className="text-xl font-bold text-primary">{data.participationRate.toFixed(1)}%</p>
              </div>
           </div>
        </Card>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        <Card className="md:col-span-2">
          <Bar data={chartData} options={chartOptions} />
        </Card>
        <Card className="h-full">
           <h3 className="text-lg font-bold text-primary mb-6">Live Leaderboard</h3>
           <div className="space-y-4">
             {labels.sort((a,b) => data.results[b] - data.results[a]).map((roll, idx) => (
               <div key={roll} className="flex items-center justify-between p-3 rounded-xl bg-gray-50">
                 <div className="flex items-center gap-3">
                   <span className={`w-6 h-6 flex items-center justify-center rounded-full text-[10px] font-bold ${idx === 0 ? 'bg-accent text-white' : 'bg-gray-200 text-gray-500'}`}>
                     {idx + 1}
                   </span>
                   <span className="font-medium text-primary">{roll}</span>
                 </div>
                 <span className="font-bold text-accent">{data.results[roll]} <span className="text-[10px] font-normal text-gray-400">votes</span></span>
               </div>
             ))}
             {labels.length === 0 && <p className="text-center text-gray-400 py-10 italic">No votes recorded yet.</p>}
           </div>
        </Card>
      </div>

      {toast && <Toast {...toast} onClose={() => setToast(null)} />}
    </div>
  );
};

export default AdminAnalytics;
