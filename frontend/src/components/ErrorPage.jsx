import React from 'react';
import { Link, useRouteError } from 'react-router-dom';

export default function ErrorPage() {
  const error = useRouteError();
  const status = error?.status || (error?.response?.status) || 500;
  const message = error?.statusText || error?.message || (error?.response?.data?.message) || 'Something went wrong';

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
      <div className="max-w-lg w-full bg-white rounded-lg shadow-lg p-8 text-center">
        <h1 className="text-4xl font-bold mb-4 text-red-600">Unexpected Application Error</h1>
        <p className="text-sm text-gray-600 mb-6">Status: <strong>{status}</strong></p>
        <p className="mb-6 text-gray-800">{String(message)}</p>
        <div className="flex justify-center gap-4">
          <Link to="/" className="px-4 py-2 bg-blue-600 text-white rounded-md">Go home</Link>
          <button onClick={() => window.location.reload()} className="px-4 py-2 border rounded-md">Reload</button>
        </div>
        <div className="mt-6 text-xs text-gray-400">
          <p>If this keeps happening, check the server console or network tab for details.</p>
        </div>
      </div>
    </div>
  );
}