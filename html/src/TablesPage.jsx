import React from 'react';

export default function TablesPage({ backend, token }) {
  return (
    <div>
      <h1>Database Tables</h1>
      <p>View all database tables and their contents.</p>
      {/* TODO: Integrate with backend API to fetch and display tables using backend and token props */}
    </div>
  );
}