import React from 'react';

export default function Page() {
  return (
    <div className="space-y-6 max-w-7xl mx-auto p-6">
      <div>
        <nav className="flex text-sm text-gray-500 mb-4">
          <ol className="flex items-center space-x-2">
            <li><a href="/dashboard/super-admin" className="hover:text-gray-900">Dashboard</a></li>
            <li><span className="mx-2">/</span></li>
            <li><span className="text-gray-900 font-medium">Config</span></li>
          </ol>
        </nav>
        <h1 className="text-2xl font-bold text-gray-900">Config</h1>
        <p className="mt-1 text-sm text-gray-500">
          Manage config and configure settings.
        </p>
      </div>
      <div className="bg-white rounded-xl border border-gray-200 p-12 text-center shadow-sm">
        <h3 className="text-lg font-medium text-gray-900">Coming Soon</h3>
        <p className="mt-2 text-gray-500">This module is under development.</p>
      </div>
    </div>
  );
}
