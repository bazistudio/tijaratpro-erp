'use client';

import React from 'react';

export default function ShopsManagementPage() {
  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Shops Management</h1>
        <button className="bg-[#006970] text-white px-4 py-2 rounded-md hover:bg-[#005a60]">
          Add Shop
        </button>
      </div>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
        <p className="text-gray-500">Shop list placeholder. This will display all shops within the organization.</p>
      </div>
    </div>
  );
}
