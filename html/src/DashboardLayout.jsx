import React from 'react';

const BASE = '/galaxy-football-admin';
export default function DashboardLayout({ children }) {
  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <aside style={{ width: 220, background: '#222', color: '#fff', padding: 24 }}>
        <h2>Galaxy Football Admin</h2>
        <nav>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            <li><a href={`${BASE}/#/`} style={{ color: '#fff' }}>Dashboard</a></li>
            <li><a href={`${BASE}/#/logs`} style={{ color: '#fff' }}>Backend Logs</a></li>
            <li><a href={`${BASE}/#/users`} style={{ color: '#fff' }}>User Data</a></li>
            <li><a href={`${BASE}/#/jobs`} style={{ color: '#fff' }}>Jobs</a></li>
          </ul>
        </nav>
      </aside>
      <main style={{ flex: 1, padding: 32, background: '#f7f7f7' }}>{children}</main>
    </div>
  );
}
