

import React, { useEffect, useState } from 'react';
import { getBackendUrl } from './backend';
import AceEditorModule from 'react-ace';
const AceEditor = AceEditorModule.default || AceEditorModule;
import 'ace-builds/src-noconflict/mode-text';
import 'ace-builds/src-noconflict/theme-tomorrow_night';
import 'ace-builds/src-noconflict/ext-searchbox';

// Simple error boundary component
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, errorInfo) {
    // You can log error info here if needed
    // console.error(error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ color: 'red', padding: 16, background: '#330', borderRadius: 4 }}>
          <h2>Something went wrong in the log viewer.</h2>
          <pre>{this.state.error && this.state.error.toString()}</pre>
        </div>
      );
    }
    return this.props.children;
  }
}


function LogsPage() {
  const [wrapLines, setWrapLines] = useState(false);
  const [lineScroll, setLineScroll] = useState(true);
  const [logFiles, setLogFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileContent, setFileContent] = useState(null);
  const [fileLoading, setFileLoading] = useState(false);
  const [fileError, setFileError] = useState(null);
  const [search, setSearch] = useState("");



    // Fetch log file list
    useEffect(() => {
      setLoading(true);
      setError(null);
      fetch(getBackendUrl().replace(/\/$/, '') + '/api/logs')
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
    }, []);

    // Fetch selected log file content
    useEffect(() => {
      if (!selectedFile) {
        setFileContent("");
        setFileError(null);
        return;
      }
      setFileLoading(true);
      setFileError(null);
      fetch(getBackendUrl().replace(/\/$/, '') + '/api/logs/' + encodeURIComponent(selectedFile))
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
    }, [selectedFile]);



  // Fetch log file list
  useEffect(() => {
    setLoading(true);
    setError(null);
    fetch(getBackendUrl().replace(/\/$/, '') + '/api/logs')
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
  }, []);

  // Fetch selected log file content
  useEffect(() => {
    if (!selectedFile) {
      setFileContent(null);
      setFileError(null);
      return;
    }
    setFileLoading(true);
    setFileError(null);
    fetch(getBackendUrl().replace(/\/$/, '') + '/api/logs/' + encodeURIComponent(selectedFile))
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch log file');
        return res.text();
      })
      .then(text => {
        setFileContent(text);
        setFileError(null);
      })
      .catch(err => {
        setFileContent(null);
        setFileError(err.message);
      })
      .finally(() => {
        setFileLoading(false);
      });
  }, [selectedFile]);

  return (
    <ErrorBoundary>
      <div>
        <h1>Backend Logs</h1>
        <p>View and download backend logs (stored in Cloudflare R2).</p>
        {loading && <div>Loading log file list...</div>}
        {error && <div style={{color: 'red'}}>Error: {error}</div>}
        {!loading && !error && (
          <div style={{ marginBottom: 24 }}>
            <h3>Available Log Files</h3>
            {logFiles.length === 0 ? (
              <div>No log files found.</div>
            ) : (
              <ul style={{ paddingLeft: 0, listStyle: 'none' }}>
                {logFiles.map((file, idx) => (
                  <li key={file} style={{ marginBottom: 8 }}>
                    <button
                      style={{
                        background: selectedFile === file ? '#444' : '#eee',
                        color: selectedFile === file ? '#fff' : '#222',
                        border: '1px solid #ccc',
                        borderRadius: 4,
                        padding: '4px 12px',
                        cursor: 'pointer',
                      }}
                      onClick={() => setSelectedFile(file)}
                    >
                      {file}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
        {selectedFile && (
          <div>
            <h3>Log File: {selectedFile}</h3>
            {fileLoading && <div>Loading file...</div>}
            {fileError && <div style={{color: 'red'}}>Error: {fileError}</div>}
            <div>
              <div style={{ maxHeight: 1000, minHeight: 600, maxWidth: 900, width: '100%', borderRadius: 4, border: '1px solid #222', marginBottom: 16, background: '#222' }}>
                {typeof fileContent === 'string' || fileContent == null ? (
                  <AceEditor
                    mode="text"
                    theme="tomorrow_night"
                    name="log-ace-editor"
                    value={fileContent || ""}
                    readOnly={true}
                    width="100%"
                    height="1000px"
                    fontSize={14}
                    showPrintMargin={false}
                    showGutter={true}
                    highlightActiveLine={false}
                    wrapEnabled={true}
                    setOptions={{
                      useWorker: false,
                      showLineNumbers: true,
                      tabSize: 2,
                      displayIndentGuides: false,
                      showFoldWidgets: false,
                    }}
                    editorProps={{ $blockScrolling: true }}
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
