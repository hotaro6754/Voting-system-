import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Landing from './pages/Landing';
import VoterAuth from './pages/VoterAuth';
import Ballot from './pages/Ballot';
import Success from './pages/Success';
import AdminLogin from './pages/AdminLogin';
import AdminDatasets from './pages/AdminDatasets';
import AdminSessions from './pages/AdminSessions';
import AdminAnalytics from './pages/AdminAnalytics';
import AdminLayout from './components/AdminLayout';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Voter Routes */}
        <Route path="/" element={<Landing />} />
        <Route path="/auth" element={<VoterAuth />} />
        <Route path="/ballot" element={<Ballot />} />
        <Route path="/success" element={<Success />} />

        {/* Admin Routes */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin" element={<AdminLayout />}>
          <Route path="datasets" element={<AdminDatasets />} />
          <Route path="sessions" element={<AdminSessions />} />
          <Route path="analytics/:sessionId" element={<AdminAnalytics />} />
          <Route index element={<AdminSessions />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
