import React from 'react';

export default function DashboardLayout({ children }) {
  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <aside style={{ width: 220, background: '#222', color: '#fff', padding: 24 }}>
        <h2>Galaxy Football Admin</h2>
        <nav>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            <li><a href="/" style={{ color: '#fff' }}>Dashboard</a></li>
            <li><a href="/logs" style={{ color: '#fff' }}>Backend Logs</a></li>
            <li><a href="/users" style={{ color: '#fff' }}>User Data</a></li>
            <li><a href="/jobs" style={{ color: '#fff' }}>Jobs</a></li>
          </ul>
        </nav>
      </aside>
      <main style={{ flex: 1, padding: 32, background: '#f7f7f7' }}>{children}</main>
    </div>
  );
}
