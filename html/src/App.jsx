import React, { useState } from 'react';
import { HashRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import TextField from '@mui/material/TextField';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Stack from '@mui/material/Stack';
import Paper from '@mui/material/Paper';
// Backend options
const BACKEND_OPTIONS = [
  { label: "Production", url: "https://galaxy-football-backend.onrender.com" },
  { label: "Development", url: "https://galaxy-football-backend-dev.onrender.com" },
  { label: "Localhost", url: "http://localhost:8080" },
];
import DashboardHome from './DashboardHome';
import LogsPage from './LogsPage';
import UsersPage from './UsersPage';
import JobsPage from './JobsPage';
import TablesPage from './TablesPage';
import TrackCallPage from './TrackCallPage';

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
  const [user, setUser] = useState(null); // {name, role}
  const [status, setStatus] = useState('Disconnected');
  const [backend, setBackend] = useState(BACKEND_OPTIONS[0].url);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [version, setVersion] = useState('');
  const [token, setToken] = useState('');

  // Login using backend /auth/login endpoint
  const handleLogin = async (e) => {
    e.preventDefault();
    setStatus('Connecting...');
    try {
      const res = await fetch(`${backend.replace(/\/$/, '')}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      if (!res.ok) {
        setStatus('Login failed');
        setUser(null);
        setToken('');
        return;
      }
      const data = await res.json();
      if (!data.token) {
        setStatus('No token received');
        setUser(null);
        setToken('');
        return;
      }
      setToken(data.token);
      setUser({ name: username, role: username === 'admin' ? 'admin' : 'user' });
      setStatus('Connected');
      // Fetch version info as an example authenticated call
      const versionRes = await fetch(`${backend.replace(/\/$/, '')}/version`, {
        headers: { 'Authorization': `Bearer ${data.token}` }
      });
      if (versionRes.ok) {
        const versionData = await versionRes.json();
        setVersion(versionData.version || '');
      } else {
        setVersion('');
      }
    } catch (err) {
      setStatus('Error connecting');
      setUser(null);
      setToken('');
    }
  };

  const handleLogout = () => {
    setUser(null);
    setStatus('Disconnected');
    setVersion('');
    setToken('');
  };

  return (
    <Router>
      <Box sx={{ flexGrow: 1, minHeight: '100vh', bgcolor: '#f5f5f5' }}>
        <AppBar position="static" color="primary">
          <Toolbar>
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              Galaxy Football Admin
            </Typography>
            <Button color="inherit" component={Link} to="/">Home</Button>
            <Button color="inherit" component={Link} to="/logs">Logs</Button>
            <Button color="inherit" component={Link} to="/tables">Tables</Button>
            <Button color="inherit" component={Link} to="/users">Users</Button>
            <Button color="inherit" component={Link} to="/jobs">Jobs</Button>
            <Button color="inherit" component={Link} to="/track">Track Call</Button>
          </Toolbar>
        </AppBar>

        <Container maxWidth="sm" sx={{ mt: 4 }}>
          {!user ? (
            <Paper elevation={3} sx={{ p: 4 }}>
              <Typography variant="h5" gutterBottom>Admin Login</Typography>
              <Box component="form" onSubmit={handleLogin} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Select
                  value={backend}
                  onChange={e => setBackend(e.target.value)}
                  required
                  displayEmpty
                >
                  {BACKEND_OPTIONS.map(opt => (
                    <MenuItem key={opt.url} value={opt.url}>{opt.label}</MenuItem>
                  ))}
                </Select>
                <TextField
                  label="Username"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  required
                  autoFocus
                />
                <TextField
                  label="Password"
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                />
                <Button type="submit" variant="contained" color="primary">Connect</Button>
                <Typography color={status === 'Connected' ? 'success.main' : 'error.main'}>{status}</Typography>
              </Box>
            </Paper>
          ) : (
            <Paper elevation={2} sx={{ p: 2, mb: 2 }}>
              <Stack direction="row" spacing={2} alignItems="center">
                <Typography>Status: {status}</Typography>
                <Typography>User: {user.name} ({user.role})</Typography>
                <Typography>Backend: {BACKEND_OPTIONS.find(opt => opt.url === backend)?.label || backend}</Typography>
                <Typography>Version: {version}</Typography>
                <Button variant="outlined" color="secondary" onClick={handleLogout}>Logout</Button>
              </Stack>
            </Paper>
          )}
        </Container>

        <Container maxWidth="lg" sx={{ mt: 4 }}>
          <Routes>
            <Route path="/" element={<DashboardHome user={user} token={token} backend={backend} />} />
            <Route path="/logs" element={user ? <LogsPage token={token} backend={backend} /> : <Navigate to="/" />} />
            <Route path="/tables" element={user ? <TablesPage token={token} backend={backend} user={user} /> : <Navigate to="/" />} />
            <Route path="/users" element={user ? <UsersPage token={token} backend={backend} /> : <Navigate to="/" />} />
            <Route path="/jobs" element={user ? <JobsPage token={token} backend={backend} /> : <Navigate to="/" />} />
            <Route path="/track" element={user ? <TrackCallPage token={token} backend={backend} /> : <Navigate to="/" />} />
          </Routes>
        </Container>
      </Box>
    </Router>
  );
}

export default App;
