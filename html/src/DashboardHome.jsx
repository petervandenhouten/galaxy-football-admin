import React from 'react';

import { useState } from 'react';
import { getBackendUrl } from './backend';

export default function DashboardHome() {
  const [lockResult, setLockResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchDatabaseLocked = async () => {
    setLoading(true);
    setError(null);
    try {
      const url = getBackendUrl().replace(/\/$/, '') + '/api/database-locked';
      const res = await fetch(url);
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
      <button onClick={fetchDatabaseLocked} disabled={loading} style={{marginTop: 16}}>
        {loading ? 'Checking...' : 'Check Database Locked'}
      </button>
      {error && <div style={{color: 'red', marginTop: 16}}>Error: {error}</div>}
      {lockResult && (
        <div style={{marginTop: 16}}>
          <h3>Database Locked Status</h3>
          <div><b>Locked:</b> {lockResult.locked !== undefined ? (lockResult.locked ? 'Yes' : 'No') : (lockResult.isLocked ? 'Yes' : 'No')}</div>
          {lockResult.isBatchProcessing !== undefined && (
            <div><b>Batch Processing:</b> {lockResult.isBatchProcessing ? 'Yes' : 'No'}</div>
          )}
          {lockResult.locks && Array.isArray(lockResult.locks) && lockResult.locks.length > 0 && (
            <div style={{overflowX: 'auto', marginTop: 8}}>
              <table border="1" cellPadding="4" style={{maxWidth: '100%'}}>
                <thead>
                  <tr>
                    {Object.keys(lockResult.locks[0] || {}).map((col) => (
                      <th key={col}>{col}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {lockResult.locks.map((row, i) => (
                    <tr key={i}>
                      {Object.values(row).map((val, j) => (
                        <td key={j}>{String(val)}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
