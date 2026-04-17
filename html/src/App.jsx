import React, { useEffect, useState } from 'react';
import DashboardLayout from './DashboardLayout';
import DashboardHome from './DashboardHome';
import LogsPage from './LogsPage';
import UsersPage from './UsersPage';
import JobsPage from './JobsPage';

const BASE = '/galaxy-football-admin';
function getPageComponent(route) {
  switch (route) {
    case `${BASE}/logs`:
      return <LogsPage />;
    case `${BASE}/users`:
      return <UsersPage />;
    case `${BASE}/jobs`:
      return <JobsPage />;
    default:
      return <DashboardHome />;
  }
}

function App() {
  const [route, setRoute] = useState(window.location.pathname);

  useEffect(() => {
    const onPopState = () => setRoute(window.location.pathname);
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  const navigate = (path) => {
    window.history.pushState({}, '', `${BASE}${path}`);
    setRoute(`${BASE}${path}`);
  };

  return (
    <DashboardLayout>
      {/* Simple navigation context for demo purposes */}
      <nav style={{ marginBottom: 24 }}>
        <button onClick={() => navigate('/')}>Dashboard</button>
        <button onClick={() => navigate('/logs')}>Logs</button>
        <button onClick={() => navigate('/users')}>Users</button>
        <button onClick={() => navigate('/jobs')}>Jobs</button>
      </nav>
      {getPageComponent(route)}
    </DashboardLayout>
  );
}

export default App;
