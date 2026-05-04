import React, { useState } from 'react';

export default function JobsPage({ backend, token, user }) {
  const [loading, setLoading] = useState("");
  const [result, setResult] = useState("");
  const [error, setError] = useState("");

  // Only allow admin
  const isAdmin = user && user.role === 'admin';

  const triggerJob = async (endpoint, label, confirmMsg) => {
    if (confirmMsg) {
      // eslint-disable-next-line no-alert
      if (!window.confirm(confirmMsg)) return;
    }
    setLoading(label);
    setResult("");
    setError("");
    try {
      const url = (backend || '').replace(/\/$/, '') + endpoint;
      const res = await fetch(url, {
        method: 'POST',
        headers: token ? { 'Authorization': `Bearer ${token}` } : {},
      });
      if (!res.ok) throw new Error(`Failed: ${res.status}`);
      const data = await res.json().catch(() => ({}));
      setResult(`Success: ${JSON.stringify(data)}`);
    } catch (err) {
      setError(err.message || 'Unknown error');
    } finally {
      setLoading("");
    }
  };

  return (
    <div>
      <h1>Job Scheduler</h1>
      <p>Trigger or schedule jobs via backend API (admin only).</p>
      {isAdmin ? (
        <div style={{ marginTop: 24, display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 320, marginLeft: 'auto', marginRight: 'auto', alignItems: 'center' }}>
          <button
            onClick={() => triggerJob('/api/job/admin/run-daily-job', 'daily')}
            disabled={!!loading}
            style={{ padding: '12px 20px', borderRadius: 4, border: '1px solid #888', background: '#1976d2', color: '#fff', cursor: 'pointer', fontWeight: 600 }}
          >
            {loading === 'daily' ? 'Running...' : 'Run Daily Job'}
          </button>
          <button
            onClick={() => triggerJob(
              '/api/job/admin/start-new-game',
              'game',
              'Are you sure you want to start a new game? This will RESET the backend database and cannot be undone.'
            )}
            disabled={!!loading}
            style={{ padding: '12px 20px', borderRadius: 4, border: '1px solid #888', background: '#388e3c', color: '#fff', cursor: 'pointer', fontWeight: 600 }}
          >
            {loading === 'game' ? 'Starting...' : 'Start New Game'}
          </button>
          {result && <div style={{ color: '#0a0', marginTop: 16 }}>{result}</div>}
          {error && <div style={{ color: '#c00', marginTop: 16 }}>Error: {error}</div>}
        </div>
      ) : (
        <div style={{ color: '#c00', marginTop: 24 }}>Admin access required to trigger jobs.</div>
      )}
    </div>
  );
}
