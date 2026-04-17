import React, { useEffect, useState } from 'react';
import DashboardLayout from './DashboardLayout';
import DashboardHome from './DashboardHome';
import LogsPage from './LogsPage';
import UsersPage from './UsersPage';
import JobsPage from './JobsPage';

const BASE = '/galaxy-football-admin';
function getPageComponent(hash) {
  switch (hash) {
    case '#/logs':
      return <LogsPage />;
    case '#/users':
      return <UsersPage />;
    case '#/jobs':
      return <JobsPage />;
    default:
      return <DashboardHome />;
  }
}

function App() {
  const [hash, setHash] = useState(window.location.hash || '#/');

  useEffect(() => {
    const onHashChange = () => setHash(window.location.hash || '#/');
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  const navigate = (path) => {
    window.location.hash = path;
  };

  return (
    <DashboardLayout>
      {/* Simple navigation context for demo purposes */}
      <nav style={{ marginBottom: 24 }}>
        <button onClick={() => navigate('/')} >Dashboard</button>
        <button onClick={() => navigate('/logs')}>Logs</button>
        <button onClick={() => navigate('/users')}>Users</button>
        <button onClick={() => navigate('/jobs')}>Jobs</button>
      </nav>
      {getPageComponent(hash)}
    </DashboardLayout>
  );
}

export default App;
