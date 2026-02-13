import React, { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Loader from './components/Loader';

// Lazy load pages
const Landing = lazy(() => import('./pages/Landing'));
const VoterAuth = lazy(() => import('./pages/VoterAuth'));
const Ballot = lazy(() => import('./pages/Ballot'));
const Success = lazy(() => import('./pages/Success'));
const AdminLogin = lazy(() => import('./pages/AdminLogin'));
const AdminDatasets = lazy(() => import('./pages/AdminDatasets'));
const AdminSessions = lazy(() => import('./pages/AdminSessions'));
const AdminAnalytics = lazy(() => import('./pages/AdminAnalytics'));

// Components
const AdminLayout = lazy(() => import('./components/AdminLayout'));

function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-bg-light dark:bg-gray-900"><Loader /></div>}>
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
      </Suspense>
    </BrowserRouter>
  );
}

export default App;
