import React from 'react';

import { useState } from 'react';
export default function DashboardHome({ backend, token, versionInfo }) {
  const [lockResult, setLockResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchDatabaseLocked = async () => {
    setLoading(true);
    setError(null);
    try {
      const url = (backend || '').replace(/\/$/, '') + '/api/database-locked';
      const res = await fetch(url, {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      });
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();
      if (typeof data !== 'object' || data === null || (!('locked' in data) && !('isLocked' in data))) {
        throw new Error('Unexpected response format');
      }
      setLockResult(data);
    } catch (err) {
      setError(err.message);
      setLockResult(null);
    } finally {
      setLoading(false);
    }
  };


  return (
    <div>
      <h1>Welcome, Admin!</h1>
      <p>This is the Galaxy Football admin dashboard. Use the navigation to access logs, user data, and job scheduling.</p>
      {versionInfo && (
        <div style={{marginTop: 32, maxWidth: 480, background: '#f5f5f5', border: '1px solid #ccc', borderRadius: 8, padding: 24, marginLeft: 'auto', marginRight: 'auto'}}>
          <h2 style={{textAlign: 'center'}}>Backend Version Information</h2>
          <ul style={{listStyle: 'none', padding: 0, margin: 0}}>
            <li><b>Version:</b> {versionInfo.assembly_version}</li>
            <li><b>Game Version:</b> {versionInfo.game_version}</li>
            <li><b>Database Version:</b> {versionInfo.database_version}</li>
            <li><b>Branch:</b> {versionInfo.git_branchname}</li>
            <li><b>Commit:</b> {versionInfo.git_commit ? versionInfo.git_commit.slice(0, 8) : ''}</li>
            <li><b>Environment:</b> {versionInfo.asp_environment}</li>
            <li><b>Build Time:</b> {versionInfo.buildtime}</li>
            <li><b>Description:</b> {versionInfo.description}</li>
          </ul>
        </div>
      )}
    </div>
  );
}
