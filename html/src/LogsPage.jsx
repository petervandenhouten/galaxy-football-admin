

import React, { useEffect, useState, useRef } from 'react';
import { getBackendUrl } from './backend';
import AceEditorModule from 'react-ace';
const AceEditor = AceEditorModule.default || AceEditorModule;
import 'ace-builds/src-noconflict/mode-text';
import 'ace-builds/src-noconflict/mode-logiql'; // fallback if available
import 'ace-builds/src-noconflict/theme-tomorrow_night';
import 'ace-builds/src-noconflict/ext-searchbox';

// Custom log mode for basic highlighting
const logHighlightRules = {
  start: [
    { token: 'log-tag-inf', regex: /\[INF\]/i },
    { token: 'log-tag-err', regex: /\[ERR\]/i },
    { token: 'log-fatal', regex: /fatal|panic|abort|unrecoverable/i },
    { token: 'log-fail', regex: /fail|failed|failure|denied|rejected|refused|unavailable/i },
    { token: 'log-error', regex: /error|exception|critical|stacktrace|crash|corrupt|invalid|timeout|unhandled/i },
    { token: 'log-warn', regex: /warn|deprecated|unstable|slow|retry/i },
    { token: 'log-info', regex: /info|started|listening|success|ready|connected|completed/i },
    { token: 'log-debug', regex: /debug|trace|verbose|inspect/i },
    { token: 'log-date', regex: /\b\d{4}-\d{2}-\d{2}[ T]\d{2}:\d{2}:\d{2}(?:\.\d+)?\b/i },
    { token: 'log-number', regex: /\b\d+\b/i },
    { token: 'log-default', regex: /.+/i },
  ],
};

function registerCustomLogMode() {
  if (typeof window !== 'undefined' && window.ace && window.ace.define) {
    window.ace.define('ace/mode/log_highlight', [
      'require', 'exports', 'module', 'ace/lib/oop', 'ace/mode/text', 'ace/mode/text_highlight_rules'
    ], function(require, exports, module) {
      var oop = require('ace/lib/oop');
      var TextMode = require('ace/mode/text').Mode;
      var TextHighlightRules = require('ace/mode/text_highlight_rules').TextHighlightRules;
      var LogHighlightRules = function() {
        this.$rules = logHighlightRules;
      };
      oop.inherits(LogHighlightRules, TextHighlightRules);
      var Mode = function() {
        this.HighlightRules = LogHighlightRules;
      };
      oop.inherits(Mode, TextMode);
      (function() {
        this.$id = 'ace/mode/log_highlight';
      }).call(Mode.prototype);
      exports.Mode = Mode;
    });
  }
}

// Register the custom mode globally before render
if (typeof window !== 'undefined') {
  function tryRegisterLogMode() {
    if (window.ace && window.ace.define && !window.ace.definedLogHighlight) {
      registerCustomLogMode();
      window.ace.definedLogHighlight = true;
    }
  }
  // Try immediately, and again after a short delay in case ace is loaded late
  tryRegisterLogMode();
  setTimeout(tryRegisterLogMode, 500);
}
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
  const [filter, setFilter] = useState("");
  const aceRef = useRef(null);



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
