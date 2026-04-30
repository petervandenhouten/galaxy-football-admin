import React from 'react';

export default function JobsPage({ backend, token }) {
  return (
    <div>
      <h1>Job Scheduler</h1>
      <p>Trigger or schedule jobs via GitHub Actions or backend API.</p>
      {/* TODO: Integrate with backend API or GitHub Actions to trigger/schedule jobs using backend and token props */}
    </div>
  );
}
