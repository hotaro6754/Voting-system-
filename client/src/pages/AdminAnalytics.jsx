import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../services/api';
import { Bar, Pie } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement } from 'chart.js';
import { Download, Users, CheckCircle, Percent, Trophy } from 'lucide-react';
import AdminLayout from '../components/AdminLayout';
import Button from '../components/Button';
import Card from '../components/Card';
import Loader from '../components/Loader';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

const AdminAnalytics = () => {
  const { sessionId } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchResults();
    const interval = setInterval(fetchResults, 30000); // Polling every 30s
    return () => clearInterval(interval);
  }, [sessionId]);

  const fetchResults = async () => {
    try {
      const res = await api.get(`/api/analytics/results/${sessionId}`);
      setData(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    if (!data) return;
    const csvContent = "data:text/csv;charset=utf-8,"
      + "Candidate,Votes\n"
      + data.tallies.map(t => `${t.candidate},${t.votes}`).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `election_results_${sessionId}.csv`);
    document.body.appendChild(link);
    link.click();
  };

  if (loading) return <AdminLayout title="Analytics"><Loader /></AdminLayout>;
  if (!data) return <AdminLayout title="Analytics"><div>No data found for this session.</div></AdminLayout>;

  const barData = {
    labels: data.tallies.map(t => t.candidate),
    datasets: [{
      label: 'Votes',
      data: data.tallies.map(t => t.votes),
      backgroundColor: '#00BFA6',
      borderRadius: 8,
    }]
  };

  const winner = data.tallies[0];

  return (
    <AdminLayout title={`Results: ${data.sessionName}`} activePage="analytics">
      <div className="space-y-8">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="flex items-center gap-4 bg-primary text-white">
             <div className="p-3 bg-white/10 rounded-xl"><Users /></div>
             <div><p className="text-xs opacity-70">Eligible Voters</p><p className="text-2xl font-bold">{data.totalEligible}</p></div>
          </Card>
          <Card className="flex items-center gap-4 border-accent/20">
             <div className="p-3 bg-accent/10 rounded-xl text-accent"><CheckCircle /></div>
             <div><p className="text-xs text-gray-500">Votes Cast</p><p className="text-2xl font-bold text-primary dark:text-white">{data.totalVotes}</p></div>
          </Card>
          <Card className="flex items-center gap-4">
             <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-xl text-blue-600"><Percent /></div>
             <div><p className="text-xs text-gray-500">Participation</p><p className="text-2xl font-bold text-primary dark:text-white">{data.participationRate}%</p></div>
          </Card>
          <Card className="flex items-center gap-4 border-yellow-200">
             <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-xl text-yellow-600"><Trophy /></div>
             <div><p className="text-xs text-gray-500">Leading</p><p className="text-2xl font-bold text-primary dark:text-white">{winner?.candidate || 'N/A'}</p></div>
          </Card>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <Card className="lg:col-span-2 space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-lg text-primary dark:text-white">Vote Distribution</h3>
              <Button variant="outline" size="sm" onClick={handleExport} className="flex items-center gap-2">
                <Download className="w-4 h-4" /> Export CSV
              </Button>
            </div>
            <div className="h-[400px]">
              <Bar data={barData} options={{ maintainAspectRatio: false, plugins: { legend: { display: false } } }} />
            </div>
          </Card>

          <Card className="space-y-6">
            <h3 className="font-bold text-lg text-primary dark:text-white">Standings</h3>
            <div className="space-y-4">
              {data.tallies.map((t, i) => (
                <div key={t.candidate} className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-gray-800">
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 flex items-center justify-center bg-primary text-white rounded-full text-xs font-bold">{i+1}</span>
                    <span className="font-mono font-bold dark:text-white">{t.candidate}</span>
                  </div>
                  <span className="font-bold text-accent">{t.votes} votes</span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminAnalytics;
