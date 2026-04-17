import React, { useEffect, useState } from 'react';
// Import.meta.env for Vite env variables

const BASE = '/galaxy-football-admin';

// Get admin version from Vite define
const ADMIN_VERSION = import.meta.env.VITE_ADMIN_VERSION || "dev";

const BACKEND_OPTIONS = [
  { label: "Production", url: "https://galaxy-football-backend.onrender.com" },
  { label: "Development", url: "https://galaxy-football-backend-dev.onrender.com" },
  { label: "Localhost", url: "http://localhost:8080" },
];

function getStoredBackendUrl() {
  const url = localStorage.getItem("backendUrl");
  return url || BACKEND_OPTIONS[0].url;
}

export function getBackendUrl() {
  return getStoredBackendUrl();
}
export default function DashboardLayout({ children }) {
  const [backendUrl, setBackendUrl] = useState(getStoredBackendUrl());
  const [backendVersion, setBackendVersion] = useState("");
  const [backendTime, setBackendTime] = useState("");
  const [backendError, setBackendError] = useState("");

  // Store backendUrl in localStorage
  useEffect(() => {
    localStorage.setItem("backendUrl", backendUrl);
  }, [backendUrl]);

  // Fetch backend version when backendUrl changes
  useEffect(() => {
    if (!backendUrl) return;
    setBackendVersion("");
    setBackendTime("");
    setBackendError("");
    // Add cache-busting query param
    const versionUrl = backendUrl.replace(/\/$/, "") + "/version?_=" + Date.now();
    fetch(versionUrl)
      .then(async res => {
        if (!res.ok) throw new Error("Network error");
        // Try to parse as JSON regardless of content-type
        try {
          const data = await res.clone().json();
          if (typeof data === "object" && data !== null) {
            setBackendVersion(data.version || "");
            setBackendTime(data.time || "");
            setBackendError("");
            return;
          }
        } catch (e) {
          // Not JSON, fallback to text
        }
        const text = await res.text();
        setBackendVersion(text);
        setBackendTime("");
        setBackendError("");
      })
      .catch(() => {
        setBackendVersion("");
        setBackendTime("");
        setBackendError("Could not connect to backend");
      });
  }, [backendUrl]);

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <aside style={{ width: 220, background: '#222', color: '#fff', padding: 24 }}>
        <h2>Galaxy Football Admin</h2>
        <div style={{ fontSize: 12, color: '#aaa', marginBottom: 8 }}>
          Admin Version: {ADMIN_VERSION}
        </div>
        <div style={{ margin: '16px 0', color: '#fff' }}>
          <label style={{ marginRight: 8 }}>Backend:</label>
          <select
            value={backendUrl}
            onChange={e => setBackendUrl(e.target.value)}
            style={{ padding: 4 }}
          >
            {BACKEND_OPTIONS.map(opt => (
              <option key={opt.url} value={opt.url}>{opt.label}</option>
            ))}
          </select>
          <div style={{ marginTop: 8, minHeight: 32 }}>
            {backendVersion && (
              <div style={{ color: '#0f0' }}>Version: {backendVersion}</div>
            )}
            {backendTime && (
              <div style={{ color: '#0cf' }}>Time: {backendTime}</div>
            )}
            {backendError && (
              <span style={{ color: '#f66' }}>{backendError}</span>
            )}
          </div>
        </div>
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
