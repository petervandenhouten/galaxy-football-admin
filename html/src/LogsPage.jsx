

import React, { useEffect, useState, useRef } from 'react';
import ErrorBoundary from './ErrorBoundary';
import { getBackendUrl } from './backend';
import AceEditorModule from 'react-ace';
const AceEditor = AceEditorModule.default || AceEditorModule;

import 'ace-builds/src-noconflict/mode-text';
import 'ace-builds/src-noconflict/mode-logiql'; // fallback if available
import 'ace-builds/src-noconflict/theme-tomorrow_night';
import 'ace-builds/src-noconflict/ext-searchbox';
import './mode-log_highlight';




function LogsPage({ token, backend }) {
  const [wrapLines, setWrapLines] = useState(false);
  const [lineScroll, setLineScroll] = useState(true);
  const [logFiles, setLogFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileContent, setFileContent] = useState(null);
  const [fileLoading, setFileLoading] = useState(false);
  const [fileError, setFileError] = useState(null);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("");
  const aceRef = useRef(null);

  // Manual fetch for log file list
  const fetchLogFiles = () => {
    setLoading(true);
    setError(null);
    fetch((backend || '').replace(/\/$/, '') + '/api/logs', {
      headers: token ? { 'Authorization': `Bearer ${token}` } : {}
    })
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch log file list');
        return res.json();
      })
      .then(data => {
        setLogFiles(Array.isArray(data) ? data : []);
      })
      .catch(err => {
        setError(err.message);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  // Fetch selected log file content
  useEffect(() => {
    if (!selectedFile) {
      setFileContent("");
      setFileError(null);
      return;
    }
    setFileLoading(true);
    setFileError(null);
    fetch((backend || '').replace(/\/$/, '') + '/api/logs/' + encodeURIComponent(selectedFile), {
      headers: token ? { 'Authorization': `Bearer ${token}` } : {}
    })
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch log file');
        return res.text();
      })
      .then(text => {
        setFileContent(typeof text === 'string' ? text : (text ? String(text) : ""));
        setFileError(null);
      })
      .catch(err => {
        setFileContent("");
        setFileError(err.message);
      })
      .finally(() => {
        setFileLoading(false);
      });
  }, [selectedFile, backend, token]);





  return (
    <ErrorBoundary>
      <div>
        <h1>Backend Logs</h1>
        <p>View and download backend logs (stored in Cloudflare R2).</p>
        <div style={{ marginBottom: 24 }}>
          <button onClick={fetchLogFiles} style={{ marginBottom: 16, padding: '8px 20px', borderRadius: 4, border: '1px solid #888', background: '#1976d2', color: '#fff', cursor: 'pointer', fontWeight: 600 }}>
            Retrieve Log File List
          </button>
          {loading && <div>Loading log file list...</div>}
          {error && <div style={{color: 'red'}}>Error: {error}</div>}
          {logFiles.length > 0 && !loading && !error && (
            <>
              <h3>Available Log Files</h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginBottom: 16 }}>
                {logFiles.map((file, idx) => (
                  <button
                    key={file}
                    style={{
                      background: selectedFile === file ? '#444' : '#eee',
                      color: selectedFile === file ? '#fff' : '#222',
                      border: '1px solid #ccc',
                      borderRadius: 4,
                      padding: '4px 12px',
                      cursor: 'pointer',
                      marginBottom: 8,
                      whiteSpace: 'nowrap',
                    }}
                    onClick={() => setSelectedFile(file)}
                  >
                    {file}
                  </button>
                ))}
              </div>
            </>
          )}
          {logFiles.length === 0 && !loading && !error && <div>No log files found.</div>}
        </div>
        {selectedFile && (
          <div>
            <h3>Log File: {selectedFile}</h3>
            {fileLoading && <div>Loading file...</div>}
            {fileError && <div style={{color: 'red'}}>Error: {fileError}</div>}
            <div>
              <div style={{ marginBottom: 12, display: 'flex', gap: 16, alignItems: 'center' }}>
                                <label style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                  <input
                                    type="checkbox"
                                    checked={wrapLines}
                                    onChange={e => setWrapLines(e.target.checked)}
                                  />
                                  Wrap lines
                                </label>
                <form
                  onSubmit={e => {
                    e.preventDefault();
                    if (aceRef.current && search) {
                      const editor = aceRef.current.editor;
                      editor.execCommand('find', search);
                      editor.execCommand('find');
                      editor.searchBox && (editor.searchBox.searchInput.value = search);
                    }
                  }}
                  style={{ display: 'flex', gap: 8, alignItems: 'center' }}
                >
                  <input
                    type="text"
                    placeholder="Search logs..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    style={{ padding: 6, borderRadius: 4, border: '1px solid #888', width: 220 }}
                  />
                  <button type="submit" style={{ padding: '6px 16px', borderRadius: 4, border: '1px solid #888', background: '#222', color: '#fff', cursor: 'pointer' }}>
                    Search
                  </button>
                </form>
                <input
                  type="text"
                  placeholder="Filter log lines..."
                  value={filter}
                  onChange={e => setFilter(e.target.value)}
                  style={{ padding: 6, borderRadius: 4, border: '1px solid #888', width: 220 }}
                />
              </div>
              <div style={{ maxHeight: 1000, minHeight: 600, maxWidth: 900, width: '100%', borderRadius: 4, border: '1px solid #222', marginBottom: 16, background: '#222' }}>
                {typeof fileContent === 'string' || fileContent == null ? (
                  <AceEditor
                    ref={aceRef}
                    mode="log_highlight"
                    theme="tomorrow_night"
                    name="log-ace-editor"
                    value={(() => {
                      if (!fileContent) return "";
                      if (!filter) return fileContent;
                      return fileContent
                        .split('\n')
                        .filter(line => line.toLowerCase().includes(filter.toLowerCase()))
                        .join('\n');
                    })()}
                    readOnly={true}
                    width="100%"
                    height="1000px"
                    fontSize={14}
                    showPrintMargin={false}
                    showGutter={true}
                    highlightActiveLine={true}
                    wrapEnabled={wrapLines}
                    setOptions={{
                      useWorker: false,
                      showLineNumbers: true,
                      tabSize: 2,
                      displayIndentGuides: false,
                      showFoldWidgets: false,
                    }}
                    editorProps={{ $blockScrolling: true }}
                    onLoad={editor => {
                      // Force Ace to reload the custom mode and re-apply CSS
                      if (window.ace && window.ace.require) {
                        try {
                          editor.getSession().setMode('ace/mode/log_highlight');
                        } catch (e) {}
                      }
                      // Custom style for selected line and log tokens
                      const style = document.createElement('style');
                      style.innerHTML = `
                        .ace-tomorrow-night .ace_marker-layer .ace_active-line {
                          background: #5a5127 !important;
                          border-left: 4px solid #5a5127 !important;
                          box-sizing: border-box;
                        }
                        .ace-tomorrow-night .ace_line.ace_active-line {
                          color: #000 !important;
                        }
                        .ace-tomorrow-night .ace_line.ace_active-line .ace_log-tag-inf {
                          color: #00838f !important;
                          font-weight: bold;
                        }
                        .ace-tomorrow-night .ace_line.ace_active-line .ace_log-tag-err {
                          color: #b71c1c !important;
                          font-weight: bold;
                        }
                        .ace_log-fatal { color: #ff1744 !important; font-weight: bold; }
                        .ace_log-fail { color: #ff9100 !important; font-weight: bold; }
                        .ace_log-error { color: #ff5252 !important; font-weight: bold; }
                        .ace_log-warn { color: #ffd600 !important; }
                        .ace_log-info { color: #00e676 !important; }
                        .ace_log-debug { color: #40c4ff !important; }
                        .ace_log-date { color: #b39ddb !important; }
                        .ace_log-number { color: #b0bec5 !important; }
                        .ace_log-tag-inf { color: #00bcd4 !important; font-weight: bold; }
                        .ace_log-tag-err { color: #ff1744 !important; font-weight: bold; }
                        .ace-tomorrow-night .ace_log-http-get { color: #ffd600 !important; font-weight: bold; }
                        .ace_log-default { color: #fff !important; }
                      `;
                      document.head.appendChild(style);
                    }}
                  />
                ) : (
                  <div style={{ color: 'red', padding: 16, background: '#330', borderRadius: 4 }}>
                    <b>Error:</b> fileContent is not a string.<br />
                    Type: {typeof fileContent}<br />
                    Value: <pre style={{ color: '#fff' }}>{JSON.stringify(fileContent, null, 2)}</pre>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </ErrorBoundary>
  );
}

export default LogsPage;
