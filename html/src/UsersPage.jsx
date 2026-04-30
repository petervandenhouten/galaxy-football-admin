import React from 'react';

export default function UsersPage({ backend, token }) {
  return (
    <div>
      <h1>User Data</h1>
      <p>View and search user-submitted data from the database.</p>
      {/* TODO: Integrate with backend API to fetch and display user data using backend and token props */}
    </div>
  );
}
