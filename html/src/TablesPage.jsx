import React, { useState } from 'react';
import { DataGrid } from '@mui/x-data-grid';

export default function TablesPage({ backend, token, user }) {
  // --- Database Locked State ---
  const [lockResult, setLockResult] = useState(null);
  const [lockLoading, setLockLoading] = useState(false);
  const [lockError, setLockError] = useState(null);

  const fetchDatabaseLocked = async () => {
    setLockLoading(true);
    setLockError(null);
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
      setLockError(err.message);
      setLockResult(null);
    } finally {
      setLockLoading(false);
    }
  };
  // Debug info for troubleshooting
  if (!user || user.role !== 'admin') {
    return (
      <div style={{ padding: 32, color: 'red', fontWeight: 600 }}>
        Access denied. Only admin users can view database tables directly.<br />
        <div style={{ color: '#333', marginTop: 16, fontWeight: 400 }}>
          <b>Debug info:</b><br />
          user: {JSON.stringify(user)}
        </div>
      </div>
    );
  }

  // Database connection parameters
  const isDev = backend.includes('localhost') || backend.includes('dev');
  const dbParams = isDev
    ? {
        name: 'galaxyfootballdbdev',
        user: 'galaxyfootballdbdev_user',
        password: 'RWzXT6AHSoi2zlPVh5yft3h30Ma0qIvG',
        url: 'dpg-d7gfd01kh4rs73egbf3g-a.virginia-postgres.render.com',
        port: 5432,
        env: 'Development',
      }
    : {
        name: 'galaxyfootballdb',
        user: 'galaxyfootballdb_user',
        password: 'dQDkRcAIjIcwPpgNH4NH3y6eGKoJEBBD',
        url: 'dpg-d7getdfaqgkc73esef70-a.virginia-postgres.render.com',
        port: 5432,
        env: 'Production',
      };

  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedTable, setSelectedTable] = useState(null);
  const [tableRows, setTableRows] = useState([]);
  const [tableColumns, setTableColumns] = useState([]);
  const [tableLoading, setTableLoading] = useState(false);

  // Fetch real table list from backend
  const fetchTables = async () => {
    setLoading(true);
    setError(null);
    setTables([]);
    try {
      const res = await fetch(`${backend.replace(/\/$/, '')}/api/table/list`, {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      });
      if (!res.ok) throw new Error('Failed to fetch table list');
      const data = await res.json();
      setTables(data);
    } catch (err) {
      setError('Failed to fetch tables');
    } finally {
      setLoading(false);
    }
  };

  // Fetch real table content from backend
  const fetchTableContent = async (table) => {
    setSelectedTable(table);
    setTableLoading(true);
    setTableRows([]);
    setTableColumns([]);
    try {
      const res = await fetch(`${backend.replace(/\/$/, '')}/api/table/${encodeURIComponent(table)}`, {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      });
      if (!res.ok) throw new Error('Failed to fetch table data');
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        // Dynamically create columns from keys
        const cols = Object.keys(data[0]).map(key => ({
          field: key,
          headerName: key.charAt(0).toUpperCase() + key.slice(1),
          width: 150
        }));
        setTableColumns(cols);
        setTableRows(data.map((row, idx) => ({ id: row.id ?? idx, ...row })));
      } else {
        setTableColumns([]);
        setTableRows([]);
      }
    } catch (err) {
      setTableColumns([]);
      setTableRows([]);
    } finally {
      setTableLoading(false);
    }
  };

  return (
    <div>
      <h1>Database</h1>
      <p>View all database tables, their contents, and check database lock status.</p>
      <div style={{ margin: '16px auto', padding: 16, background: '#f5f5f5', borderRadius: 8, border: '1px solid #ccc', maxWidth: 600, textAlign: 'center' }}>
        <b>Database Connection Summary ({dbParams.env}):</b>
        <ul style={{ margin: 0, paddingLeft: 0, display: 'inline-block', textAlign: 'left' }}>
          <li><b>Name:</b> {dbParams.name}</li>
          <li><b>Host:</b> {dbParams.url}</li>
        </ul>
      </div>
      <button onClick={fetchTables} disabled={loading} style={{ margin: '16px 0', padding: '8px 20px', borderRadius: 4, border: '1px solid #888', background: '#1976d2', color: '#fff', cursor: 'pointer', fontWeight: 600 }}>
        {loading ? 'Fetching tables...' : 'Retrieve Table List'}
      </button>
      <button onClick={fetchDatabaseLocked} disabled={lockLoading} style={{ margin: '16px 0 0 16px', padding: '8px 20px', borderRadius: 4, border: '1px solid #888', background: '#d2691e', color: '#fff', cursor: 'pointer', fontWeight: 600 }}>
        {lockLoading ? 'Checking...' : 'Check Database Locked'}
      </button>
      {lockError && <div style={{ color: 'red', marginTop: 16 }}>Error: {lockError}</div>}
      {lockResult && (
        <div style={{ marginTop: 16 }}>
          <h3>Database Locked Status</h3>
          <div><b>Locked:</b> {lockResult.locked !== undefined ? (lockResult.locked ? 'Yes' : 'No') : (lockResult.isLocked ? 'Yes' : 'No')}</div>
          {lockResult.isBatchProcessing !== undefined && (
            <div><b>Batch Processing:</b> {lockResult.isBatchProcessing ? 'Yes' : 'No'}</div>
          )}
          {lockResult.locks && Array.isArray(lockResult.locks) && lockResult.locks.length > 0 && (
            <div style={{ overflowX: 'auto', marginTop: 8 }}>
              <table border="1" cellPadding="4" style={{ maxWidth: '100%' }}>
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
      {error && <div style={{ color: 'red', marginTop: 8 }}>{error}</div>}
      {tables.length > 0 && (
        <div style={{ marginTop: 16 }}>
          <b>Available Tables:</b>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginTop: 8 }}>
            {tables.map((table) => (
              <button
                key={table}
                style={{ background: selectedTable === table ? '#1976d2' : '#eee', color: selectedTable === table ? '#fff' : '#222', border: '1px solid #888', borderRadius: 4, padding: '4px 12px', cursor: 'pointer', marginBottom: 4 }}
                onClick={() => fetchTableContent(table)}
                disabled={tableLoading && selectedTable === table}
              >
                {table}
              </button>
            ))}
          </div>
        </div>
      )}

      {selectedTable && (
        <div style={{ marginTop: 32 }}>
          <b>Table: {selectedTable}</b>
          <button
            style={{ marginLeft: 16, padding: '4px 16px', borderRadius: 4, border: '1px solid #888', background: '#1976d2', color: '#fff', cursor: 'pointer', fontWeight: 600 }}
            onClick={() => {
              // Convert tableRows and tableColumns to CSV
              if (!tableRows.length || !tableColumns.length) return;
              const csvRows = [];
              // Header
              csvRows.push(tableColumns.map(col => '"' + col.headerName + '"').join(','));
              // Data
              tableRows.forEach(row => {
                csvRows.push(tableColumns.map(col => '"' + (row[col.field] ?? '') + '"').join(','));
              });
              const csvContent = csvRows.join('\n');
              const blob = new Blob([csvContent], { type: 'text/csv' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `${selectedTable}.csv`;
              document.body.appendChild(a);
              a.click();
              document.body.removeChild(a);
              URL.revokeObjectURL(url);
            }}
          >
            Download CSV
          </button>
          <div style={{ height: '50vh', width: '100%', maxWidth: '100vw', background: '#fff', border: '1px solid #ccc', borderRadius: 8, marginTop: 12, minHeight: 300 }}>
            <DataGrid
              rows={tableRows}
              columns={tableColumns}
              loading={tableLoading}
              pageSize={20}
              rowsPerPageOptions={[20, 50, 100]}
              disableSelectionOnClick
              autoHeight={false}
            />
          </div>
        </div>
      )}
    </div>
  );
}